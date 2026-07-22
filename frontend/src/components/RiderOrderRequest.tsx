import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      setAccepting(true);
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {}
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept order");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  const rejectOrder = async () => {
    try {
      setRejecting(true);
      await axios.post(
        `${riderService}/api/rider/reject/${orderId}`,
        {}
      );

      toast("Order offer declined");
      onAccepted();
    } catch (error: any) {
      onAccepted();
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-green-300 space-y-3">
      <p className="text-center text-xs font-semibold text-red-600">
        Accept within {secondsLeft}s
      </p>

      <p className="text-center text-xs font-semibold text-green-600">
        New Delivery Request
      </p>

      <p className="text-xs text-gray-600">
        Order ID: <b>{orderId.slice(-6)}</b>
      </p>

      <div className="flex gap-2">
        <button
          disabled={accepting || rejecting}
          onClick={rejectOrder}
          className="w-1/3 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {rejecting ? "Declining..." : "Decline"}
        </button>

        <button
          disabled={accepting || rejecting}
          onClick={acceptOrder}
          className="w-2/3 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {accepting ? "Accepting..." : "Accept order"}
        </button>
      </div>
    </div>
  );
};

export default RiderOrderRequest;
