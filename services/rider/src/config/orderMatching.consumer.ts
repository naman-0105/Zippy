import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import { Rider } from "../model/Rider.js";

const OFFER_TIMEOUT_MS = 30000;
const MAX_ROUNDS_PER_RADIUS = 3;
const INITIAL_RADIUS_METERS = 5000;
const EXPANDED_RADIUS_METERS = 10000;

interface ActiveMatchingSession {
  orderId: string;
  currentRiderId: string | null;
  resolveWait?: ((result: "accepted" | "rejected" | "timeout") => void) | undefined;
  isAssigned?: boolean;
}

const activeSessions = new Map<string, ActiveMatchingSession>();

export const handleRiderAcceptance = (
  orderId: string,
  riderId?: string
): boolean => {
  const session = activeSessions.get(orderId);
  if (session) {
    session.isAssigned = true;
    if (session.resolveWait) {
      console.log(
        `[Matching] successful assignment: Acceptance event received for order ${orderId}${
          riderId ? ` (rider: ${riderId})` : ""
        }`
      );
      session.resolveWait("accepted");
      return true;
    }
  }
  return false;
};

export const handleRiderRejection = (
  orderId: string,
  riderId: string
): boolean => {
  const session = activeSessions.get(orderId);
  if (session && session.currentRiderId === riderId && session.resolveWait) {
    console.log(
      `[Matching] rider rejected: Early rejection received for order ${orderId} from rider ${riderId}`
    );
    session.resolveWait("rejected");
    return true;
  }
  return false;
};

const getRestaurantServiceUrl = () =>
  process.env.RESTAURANT_SERVICE ||
  process.env.VITE_RESTAURANT_SERVICE ||
  "http://localhost:5001";

const getRealtimeServiceUrl = () =>
  process.env.REALTIME_SERVICE ||
  process.env.VITE_REALTIME_SERVICE ||
  "http://localhost:5004";

const markOrderAsDelayed = async (orderId: string) => {
  try {
    await axios.put(
      `${getRestaurantServiceUrl()}/api/order/internal/delayed/${orderId}`,
      {},
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
        timeout: 5000,
      }
    );
    console.log(
      `[Matching] final delayed state: Order ${orderId} marked as delayed in restaurant service`
    );
  } catch (error: any) {
    console.error(
      `[Matching] Failed to mark order ${orderId} as delayed:`,
      error?.response?.data || error.message
    );
  }
};

const sendOfferToRider = async (
  userId: string,
  orderId: string,
  restaurantId: string
) => {
  await axios.post(
    `${getRealtimeServiceUrl()}/api/v1/internal/emit`,
    {
      event: "order:available",
      room: `user:${userId}`,
      payload: { orderId, restaurantId },
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
      timeout: 5000,
    }
  );
};

const waitForRiderResponse = (
  orderId: string,
  riderId: string,
  session: ActiveMatchingSession,
  timeoutMs = OFFER_TIMEOUT_MS
): Promise<"accepted" | "rejected" | "timeout"> => {
  return new Promise((resolve) => {
    let resolved = false;
    let timeoutTimer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      delete session.resolveWait;
    };

    const handleResolution = (result: "accepted" | "rejected" | "timeout") => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(result);
      }
    };

    session.resolveWait = handleResolution;

    timeoutTimer = setTimeout(() => {
      handleResolution("timeout");
    }, timeoutMs);
  });
};

export const processSequentialRiderMatching = async (data: {
  orderId: string;
  restaurantId: string;
  location: any;
}) => {
  const { orderId, restaurantId, location } = data;

  const rawCoords =
    Array.isArray(location)
      ? location
      : Array.isArray(location?.coordinates)
      ? location.coordinates
      : null;

  if (!orderId || !rawCoords || rawCoords.length < 2) {
    console.error("[Matching] Invalid event data for rider matching:", data);
    return;
  }

  const restaurantCoords: [number, number] = [
    Number(rawCoords[0]),
    Number(rawCoords[1]),
  ];

  if (activeSessions.has(orderId)) {
    console.log(
      `[Matching] Matching is already in progress for order ${orderId}. Skipping duplicate trigger.`
    );
    return;
  }

  const session: ActiveMatchingSession = {
    orderId,
    currentRiderId: null,
    isAssigned: false,
  };
  activeSessions.set(orderId, session);

  console.log(`\n======================================================`);
  console.log(`[Matching] matching started for order ${orderId}`);
  console.log(
    `[Matching] Restaurant location coordinates: [${restaurantCoords[0]}, ${restaurantCoords[1]}]`
  );
  console.log(`======================================================`);

  const attemptedRiderIds = new Set<string>();

  let currentRadius = INITIAL_RADIUS_METERS;
  let round = 1;
  let roundsInCurrentRadius = 0;

  try {
    while (true) {
      if (session.isAssigned) {
        console.log(
          `[Matching] successful assignment: Order ${orderId} is already assigned. Stopping matching.`
        );
        break;
      }

      console.log(
        `\n[Matching] round number: ${round} | [Matching] current radius: ${
          currentRadius / 1000
        } km | attempted riders: ${attemptedRiderIds.size}`
      );

      console.log(
        `[Matching] fresh candidate search: Querying database for nearest unattempted eligible rider within ${
          currentRadius / 1000
        } km...`
      );

      const candidate = await Rider.findOne({
        isAvailble: true,
        isVerified: true,
        _id: { $nin: Array.from(attemptedRiderIds) },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: restaurantCoords,
            },
            $maxDistance: currentRadius,
          },
        },
      });

      if (!candidate) {
        console.log(
          `[Matching] No eligible unattempted rider found within ${
            currentRadius / 1000
          } km.`
        );

        const totalRiders = await Rider.countDocuments();
        const verifiedRiders = await Rider.countDocuments({ isVerified: true });
        const onlineRiders = await Rider.countDocuments({ isAvailble: true });
        const verifiedAndOnline = await Rider.countDocuments({
          isVerified: true,
          isAvailble: true,
        });
        console.log(
          `[Matching] Diagnostics: Total riders: ${totalRiders}, Verified riders: ${verifiedRiders}, Online riders: ${onlineRiders}, Verified & Online: ${verifiedAndOnline}`
        );

        if (currentRadius === INITIAL_RADIUS_METERS) {
          console.log(
            `[Matching] expanding radius: Expanding search radius from 5 km to 10 km.`
          );
          currentRadius = EXPANDED_RADIUS_METERS;
          roundsInCurrentRadius = 0;
          round++;
          continue;
        } else {
          console.log(
            `[Matching] No eligible riders found in 10 km radius. Expanded search exhausted.`
          );
          break;
        }
      }

      const candidateRiderId = candidate._id.toString();
      session.currentRiderId = candidateRiderId;
      attemptedRiderIds.add(candidateRiderId);
      roundsInCurrentRadius++;

      console.log(
        `[Matching] selected rider: ${candidateRiderId} (userId: ${candidate.userId}, phone: ${candidate.phoneNumber})`
      );

      let offerSent = false;
      try {
        await sendOfferToRider(candidate.userId, orderId, restaurantId);
        offerSent = true;
        console.log(
          `[Matching] offer sent to rider ${candidateRiderId} (room: user:${candidate.userId})`
        );
      } catch (err: any) {
        console.error(
          `[Matching] offer delivery failed for rider ${candidateRiderId}:`,
          err.message || err
        );
      }

      if (!offerSent) {
        console.log(
          `[Matching] Skipping 30s wait due to notification failure for rider ${candidateRiderId}. Moving to next round.`
        );
        if (
          currentRadius === INITIAL_RADIUS_METERS &&
          roundsInCurrentRadius >= MAX_ROUNDS_PER_RADIUS
        ) {
          console.log(
            `[Matching] expanding radius: Completed ${MAX_ROUNDS_PER_RADIUS} attempts in 5 km radius. Expanding radius to 10 km.`
          );
          currentRadius = EXPANDED_RADIUS_METERS;
          roundsInCurrentRadius = 0;
        } else if (
          currentRadius === EXPANDED_RADIUS_METERS &&
          roundsInCurrentRadius >= MAX_ROUNDS_PER_RADIUS
        ) {
          console.log(
            `[Matching] Completed ${MAX_ROUNDS_PER_RADIUS} attempts in 10 km radius without acceptance.`
          );
          break;
        }
        round++;
        continue;
      }

      console.log(
        `[Matching] Waiting up to 30 seconds for rider ${candidateRiderId} response...`
      );

      const result = await waitForRiderResponse(
        orderId,
        candidateRiderId,
        session,
        OFFER_TIMEOUT_MS
      );

      if (result === "accepted") {
        console.log(
          `[Matching] successful assignment: Rider ${candidateRiderId} accepted order ${orderId}!`
        );
        break;
      } else if (result === "rejected") {
        console.log(
          `[Matching] rider rejected: Rider ${candidateRiderId} rejected order ${orderId}.`
        );
      } else {
        console.log(
          `[Matching] rider timed out: 30-second offer timeout expired for rider ${candidateRiderId}.`
        );
      }

      if (
        currentRadius === INITIAL_RADIUS_METERS &&
        roundsInCurrentRadius >= MAX_ROUNDS_PER_RADIUS
      ) {
        console.log(
          `[Matching] expanding radius: Completed ${MAX_ROUNDS_PER_RADIUS} attempts in 5 km radius. Expanding radius to 10 km.`
        );
        currentRadius = EXPANDED_RADIUS_METERS;
        roundsInCurrentRadius = 0;
      } else if (
        currentRadius === EXPANDED_RADIUS_METERS &&
        roundsInCurrentRadius >= MAX_ROUNDS_PER_RADIUS
      ) {
        console.log(
          `[Matching] Completed ${MAX_ROUNDS_PER_RADIUS} attempts in 10 km radius without acceptance.`
        );
        break;
      }

      round++;
    }

    if (!session.isAssigned) {
      console.log(
        `[Matching] final delayed state: No rider accepted after expanded search for order ${orderId}. Flagging order as delayed.`
      );
      await markOrderAsDelayed(orderId);
    } else {
      console.log(
        `[Matching] successful assignment confirmed for order ${orderId}.`
      );
    }
  } catch (error) {
    console.error(
      `[Matching] Error during sequential rider matching for order ${orderId}:`,
      error
    );
  } finally {
    activeSessions.delete(orderId);
    console.log(
      `[Matching] Matching session completed and cleaned up for order ${orderId}.\n`
    );
  }
};

export const startOrderReadyConsumer = async () => {
  const channel = getChannel();

  console.log("Starting to consume from:", process.env.ORDER_READY_QUEUE);

  channel.consume(process.env.ORDER_READY_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const content = msg.content.toString();
      const event = JSON.parse(content);

      if (event.type === "ORDER_READY_FOR_RIDER") {
        console.log(
          `[OrderConsumer] Received ORDER_READY_FOR_RIDER for order ${event.data?.orderId}`
        );

        await processSequentialRiderMatching(event.data);
        channel.ack(msg);
        console.log(
          `[OrderConsumer] Matching finished and message acknowledged for order ${event.data?.orderId}`
        );
      } else if (
        event.type === "ORDER_ASSIGNED_TO_RIDER" ||
        event.type === "RIDER_ACCEPTED_ORDER"
      ) {
        console.log(
          `[OrderConsumer] Received ${event.type} for order ${event.data?.orderId}, rider ${event.data?.riderId}`
        );
        handleRiderAcceptance(event.data?.orderId, event.data?.riderId);
        channel.ack(msg);
      } else {
        console.log(
          `[OrderConsumer] Skipping unhandled event type: ${event.type}`
        );
        channel.ack(msg);
      }
    } catch (error) {
      console.error("[OrderConsumer] Consumer error:", error);
      try {
        channel.nack(msg, false, true);
      } catch (ackError) {

      }
    }
  });
};
