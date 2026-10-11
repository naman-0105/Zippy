import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { BiBell, BiCheck, BiX, BiTime } from "react-icons/bi";

interface Props {
  orderId: string;
  onAccepted: () => void;
  onDeclined: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted, onDeclined }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDeclined();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDeclined]);

  const acceptOrder = async () => {
    if (accepting || rejecting) return;
    try {
      setAccepting(true);
      await axios.post(`${riderService}/api/rider/accept/${orderId}`, {});

      toast.success("Delivery offer accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept order");
      onDeclined();
    } finally {
      setAccepting(false);
    }
  };

  const rejectOrder = async () => {
    if (accepting || rejecting) return;
    try {
      setRejecting(true);
      await axios.post(`${riderService}/api/rider/reject/${orderId}`, {});

      toast("Offer declined");
      onDeclined();
    } catch {
      onDeclined();
    } finally {
      setRejecting(false);
    }
  };

  const progressPercent = (secondsLeft / 20) * 100;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className="h-full bg-slate-800 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-1 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <BiBell className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              New Offer
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              Order #{orderId.slice(-6).toUpperCase()}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
          <BiTime className="h-3.5 w-3.5" />
          <span>{secondsLeft}s</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          disabled={accepting || rejecting}
          onClick={rejectOrder}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <BiX className="h-4 w-4" />
          {rejecting ? "Declining..." : "Decline"}
        </button>

        <button
          type="button"
          disabled={accepting || rejecting}
          onClick={acceptOrder}
          className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          <BiCheck className="h-4 w-4" />
          {accepting ? "Accepting..." : "Accept"}
        </button>
      </div>
    </div>
  );
};

export default RiderOrderRequest;
