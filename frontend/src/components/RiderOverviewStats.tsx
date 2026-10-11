import type { IOrder } from "../types";
import { BiRadioCircleMarked, BiMapPin } from "react-icons/bi";

interface RiderOverviewStatsProps {
  isAvailable: boolean;
  isVerified: boolean;
  currentOrder: IOrder | null;
  toggling: boolean;
  onToggleAvailability: () => void;
}

const RiderOverviewStats = ({
  isAvailable,
  isVerified,
  currentOrder,
  toggling,
  onToggleAvailability,
}: RiderOverviewStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Duty Status
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <BiRadioCircleMarked className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                currentOrder
                  ? "bg-amber-500"
                  : isAvailable
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />
            <p className="text-sm sm:text-base font-bold text-slate-900">
              {currentOrder ? "On Delivery" : isAvailable ? "Online" : "Offline"}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {currentOrder
              ? "Current order in progress"
              : isAvailable
              ? "Ready for incoming orders"
              : "Not taking orders"}
          </p>
        </div>
        {isVerified && !currentOrder && (
          <button
            onClick={onToggleAvailability}
            disabled={toggling}
            className="mt-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-50"
          >
            {toggling
              ? "Updating..."
              : isAvailable
              ? "Go Offline →"
              : "Go Online →"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Matching Radius
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <BiMapPin className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2.5">
          <p className="text-sm sm:text-base font-bold text-slate-900">
            5.0 km
          </p>
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            Coverage radius
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiderOverviewStats;
