import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "accepted":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "preparing":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "ready_for_rider":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "picked_up":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "delayed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status }
      );

      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 tracking-tight">
          Order #{order._id.slice(-6)}
        </span>

        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusColor(
            order.status
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="space-y-1.5 py-1">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs text-slate-700"
          >
            <span className="font-medium text-slate-800">
              {item.name} × {item.quauntity}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-500 capitalize">
          Payment: {order.paymentStatus}
        </span>
        <span className="font-bold text-slate-900 text-sm">
          ₹{order.totalAmount}
        </span>
      </div>

      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
          {actions.map((status) => (
            <button
              key={status}
              type="button"
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 transition"
            >
              Mark as {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("ready_for_rider")}
            className="w-full rounded-xl border border-blue-600 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition"
          >
            Retry Ready for Rider
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
