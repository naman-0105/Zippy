import { BiShieldQuarter, BiCrosshair, BiTime } from "react-icons/bi";

const RiderShiftInfo = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <BiCrosshair className="h-4 w-4 text-slate-600" />
            <span>5 km Matching</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Requests are offered to verified online riders within 5000m of the preparing restaurant.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <BiTime className="h-4 w-4 text-slate-600" />
            <span>20s Timer</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Offers time out after 20 seconds and route to the next nearest available rider.
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <BiShieldQuarter className="h-4 w-4 text-slate-600" />
            <span>OTP Verification</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Customer provides a 4-digit code to complete and confirm order drop-off.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiderShiftInfo;
