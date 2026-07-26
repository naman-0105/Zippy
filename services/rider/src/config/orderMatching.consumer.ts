import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import { Rider } from "../model/Rider.js";

const OFFER_TIMEOUT_MS = 20000; // 20 seconds per rider
const MAX_RADIUS_METERS = 5000; // Strictly 5 km radius limit

interface ActiveMatchingSession {
  orderId: string;
  currentRiderId: string | null;
  rejectedRiders: Set<string>;
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
        `[Matching] Acceptance received for order ${orderId}${
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
  if (session) {
    session.rejectedRiders.add(riderId);
    if (session.currentRiderId === riderId) {
      session.currentRiderId = null;
      if (session.resolveWait) {
        console.log(
          `[Matching] Early rejection received for order ${orderId} from rider ${riderId}`
        );
        session.resolveWait("rejected");
        return true;
      }
    }
  }
  return false;
};

export const isOfferValidForRider = (
  orderId: string,
  riderId: string
): boolean => {
  const session = activeSessions.get(orderId);
  if (!session) return false;
  if (session.isAssigned) return false;
  if (session.rejectedRiders && session.rejectedRiders.has(riderId)) return false;
  return session.currentRiderId === riderId;
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
      `[Matching] Order ${orderId} marked as delayed (no eligible rider accepted within 5 km)`
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
  const url = `${getRealtimeServiceUrl()}/api/v1/internal/emit`;
  console.log(`[Matching] Sending offer notification for order ${orderId} to rider user:${userId} via ${url}`);
  const response = await axios.post(
    url,
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
  console.log(`[Matching] Realtime emit response: ${response.status} ${response.data?.sucess ? "SUCCESS" : ""}`);
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
    rejectedRiders: new Set<string>(),
    isAssigned: false,
  };
  activeSessions.set(orderId, session);

  console.log(`\n======================================================`);
  console.log(`[Matching] Matching started for order ${orderId}`);
  console.log(
    `[Matching] Restaurant location coordinates: [${restaurantCoords[0]}, ${restaurantCoords[1]}]`
  );
  console.log(`[Matching] Search radius: 5 km (Strict limit)`);
  console.log(`======================================================`);

  const attemptedRiderIds = new Set<string>();
  let round = 1;

  try {
    while (true) {
      if (session.isAssigned) {
        console.log(
          `[Matching] Order ${orderId} is assigned. Stopping matching loop.`
        );
        break;
      }

      console.log(
        `\n[Matching] Round ${round} | Radius: 5 km | Attempted riders: ${attemptedRiderIds.size}`
      );

      // Fresh query for nearest eligible unattempted rider within 5 km
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
            $maxDistance: MAX_RADIUS_METERS,
          },
        },
      });

      if (!candidate) {
        console.log(
          `[Matching] No more eligible unattempted riders found within 5 km for order ${orderId}.`
        );
        break;
      }

      const candidateRiderId = candidate._id.toString();
      session.currentRiderId = candidateRiderId;
      attemptedRiderIds.add(candidateRiderId);

      console.log(
        `[Matching] Selected nearest eligible rider: ${candidateRiderId} (userId: ${candidate.userId}, phone: ${candidate.phoneNumber})`
      );

      let offerSent = false;
      try {
        await sendOfferToRider(candidate.userId, orderId, restaurantId);
        offerSent = true;
        console.log(
          `[Matching] Offer sent to rider ${candidateRiderId} (room: user:${candidate.userId})`
        );
      } catch (err: any) {
        console.error(
          `[Matching] Offer delivery failed for rider ${candidateRiderId}:`,
          err.message || err
        );
      }

      if (!offerSent) {
        console.log(
          `[Matching] Notification failed for rider ${candidateRiderId}. Moving to next candidate immediately.`
        );
        round++;
        continue;
      }

      console.log(
        `[Matching] Waiting up to 20 seconds for rider ${candidateRiderId} response...`
      );

      const result = await waitForRiderResponse(
        orderId,
        candidateRiderId,
        session,
        OFFER_TIMEOUT_MS
      );

      if (result === "accepted") {
        console.log(
          `[Matching] Rider ${candidateRiderId} ACCEPTED order ${orderId}!`
        );
        break;
      } else if (result === "rejected") {
        console.log(
          `[Matching] Rider ${candidateRiderId} REJECTED order ${orderId}. Querying next nearest rider...`
        );
      } else {
        console.log(
          `[Matching] 20-second offer timeout expired for rider ${candidateRiderId}. Querying next nearest rider...`
        );
      }

      round++;
    }

    if (!session.isAssigned) {
      console.log(
        `[Matching] No rider accepted order ${orderId} within 5 km. Flagging order as delayed.`
      );
      await markOrderAsDelayed(orderId);
    } else {
      console.log(
        `[Matching] Successful assignment confirmed for order ${orderId}.`
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
      } catch {

      }
    }
  });
};
