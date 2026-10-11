import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { authService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BiLogOut,
  BiVolumeFull,
  BiVolumeMute,
  BiCheckCircle,
  BiTime,
  BiCycling,
} from "react-icons/bi";

interface IRiderProfile {
  _id: string;
  phoneNumber: string;
  isVerified: boolean;
  isAvailble: boolean;
  picture: string;
}

interface RiderHeaderProps {
  profile: IRiderProfile | null;
  toggling: boolean;
  toggleAvailiblity: () => void;
  audioUnlocked: boolean;
  unlockAudio: () => void;
  hasActiveOrder: boolean;
}

const RiderHeader = ({
  profile,
  toggling,
  toggleAvailiblity,
  audioUnlocked,
  unlockAudio,
  hasActiveOrder,
}: RiderHeaderProps) => {
  const { user, setUser, setIsAuth } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await axios.post(`${authService}/api/auth/logout`);
      setUser(null);
      setIsAuth(false);
      toast.success("Logged out");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to log out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-slate-900">
            Zippy
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            <BiCycling className="h-3.5 w-3.5" />
            Rider
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={unlockAudio}
            title={audioUnlocked ? "Sound alerts enabled" : "Enable sound alerts"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm transition-colors"
          >
            {audioUnlocked ? (
              <BiVolumeFull className="h-4 w-4" />
            ) : (
              <BiVolumeMute className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {profile?.isVerified && !hasActiveOrder && (
            <button
              onClick={toggleAvailiblity}
              disabled={toggling}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                profile.isAvailble
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  profile.isAvailble ? "bg-emerald-400" : "bg-slate-400"
                }`}
              />
              <span>
                {toggling
                  ? "Updating..."
                  : profile.isAvailble
                  ? "Online"
                  : "Offline"}
              </span>
            </button>
          )}

          {hasActiveOrder && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              On Delivery
            </span>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 hover:bg-slate-50 transition-colors"
            >
              <img
                src={
                  profile?.picture ||
                  user?.image ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Rider"
                className="h-6 w-6 rounded-md object-cover bg-slate-100"
              />
              <span className="hidden sm:inline-block max-w-[90px] truncate text-xs font-medium text-slate-700">
                {user?.name || "Rider"}
              </span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="border-b border-slate-100 pb-2.5">
                    <p className="font-bold text-slate-800 text-xs truncate">
                      {user?.name || "Zippy Rider"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email}
                    </p>
                    {profile && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        {profile.isVerified ? (
                          <>
                            <BiCheckCircle className="h-3.5 w-3.5 text-slate-700" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <BiTime className="h-3.5 w-3.5 text-slate-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <BiLogOut className="h-4 w-4" />
                      {loggingOut ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default RiderHeader;
