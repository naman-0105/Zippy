import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";
import { BiVolumeFull } from "react-icons/bi";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

interface RestaurantOrdersProps {
  restaurantId: string;
  view?: "active" | "completed" | "all";
}

const RestaurantOrders = ({
  restaurantId,
  view = "all",
}: RestaurantOrdersProps) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notif.mp3");
    audioRef.current.load();
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
          console.log("Audio unlocked");
        })
        .catch((err) => {
          console.log("Failed to unlock audio: ", err);
        });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/restaurant/${restaurantId}`
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket || !restaurantId) return;
    socket.emit("join:restaurant", restaurantId);
  }, [socket, restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const onNewOrder = () => {
      console.log("New Order received socket");

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("Audio play failed:", err);
        });
      }

      fetchOrders();
    };

    const onUpdateOrder = () => {
      console.log("Order updated via socket event");
      fetchOrders();
    };

    socket.on("order:new", onNewOrder);
    socket.on("order:update", onUpdateOrder);
    socket.on("order:rider_assigned", onUpdateOrder);

    return () => {
      socket.off("order:new", onNewOrder);
      socket.off("order:update", onUpdateOrder);
      socket.off("order:rider_assigned", onUpdateOrder);
    };
  }, [socket, audioUnlocked]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <p className="text-xs font-semibold text-slate-500">Loading orders...</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <div className="space-y-6">
      {view !== "completed" && !audioUnlocked && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <BiVolumeFull className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-950">
                Enable Sound Alerts
              </p>
              <p className="text-xs text-orange-800">
                Get audio alerts when new orders arrive.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={unlockAudio}
            className="rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 shadow-xs transition self-end sm:self-auto"
          >
            Enable Sound
          </button>
        </div>
      )}

      {(view === "all" || view === "active") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Orders ({activeOrders.length})
            </h3>
          </div>

          {activeOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <p className="text-xs font-medium text-slate-500">No active orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {(view === "all" || view === "completed") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Orders ({completedOrders.length})
            </h3>
          </div>

          {completedOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <p className="text-xs font-medium text-slate-500">No completed orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusUpdate={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
