import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import {
  BiUpload,
  BiCycling,
  BiRadar,
  BiVolumeFull,
  BiShieldQuarter,
} from "react-icons/bi";
import type { IOrder } from "../types";
import RiderHeader from "../components/RiderHeader";
import RiderOverviewStats from "../components/RiderOverviewStats";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import RiderShiftInfo from "../components/RiderShiftInfo";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notif.mp3");
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound alerts enabled");
    } catch {
      toast.error("Tap to enable browser sound permission");
    }
  };

  useEffect(() => {
    if (!profile?.isAvailble) {
      return;
    }
    if (!navigator.geolocation) {
      return;
    }

    let lastSentTime = 0;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const now = Date.now();
        if (now - lastSentTime >= 3000) {
          lastSentTime = now;
          try {
            await axios.patch(`${riderService}/api/rider/location`, {
              latitude,
              longitude,
            });
          } catch (err) {
            console.error("Failed to update rider location in backend:", err);
          }
        }
      },
      (err) => {
        console.error("Error watching rider location:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [profile?.isAvailble]);

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 20000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`);
      setProfile(data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`
      );
      setCurrentOrder(data.order || null);
    } catch (error) {
      console.log("No active order:", error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location access is required to go online");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          await axios.patch(`${riderService}/api/rider/toggle`, {
            isAvailble: !profile?.isAvailble,
            latitude,
            longitude,
          });

          const goingOnline = !profile?.isAvailble;
          toast.success(
            goingOnline
              ? "You are now Online and ready for orders!"
              : "You are now Offline"
          );
          fetchProfile();
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Failed to toggle status"
          );
        } finally {
          setToggling(false);
        }
      },
      () => {
        setToggling(false);
        toast.error("Location permission is required to go online");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleProfileSubmit = async () => {
    if (!phoneNumber || !aadharNumber || !drivingLicenseNumber) {
      toast.error("Please fill in all profile fields");
      return;
    }
    if (!image) {
      toast.error("Please select a profile photo");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const formData = new FormData();
        formData.append("phoneNumber", phoneNumber);
        formData.append("aadharNumber", aadharNumber);
        formData.append("drivingLicenseNumber", drivingLicenseNumber);
        formData.append("latitude", pos.coords.latitude.toString());
        formData.append("longitude", pos.coords.longitude.toString());
        if (image) formData.append("file", image);

        try {
          const { data } = await axios.post(
            `${riderService}/api/rider/new`,
            formData
          );

          toast.success(data.message || "Rider profile registered!");
          fetchProfile();
        } catch (error: any) {
          toast.error(
            error.response?.data?.message || "Failed to register profile"
          );
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        setSubmitting(false);
        toast.error("Location permission required to register profile");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <BiShieldQuarter className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Courier Access Only
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This portal is reserved for registered Zippy delivery partners.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="text-sm font-semibold tracking-wide text-slate-500">
          Loading courier dashboard...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <RiderHeader
          profile={null}
          toggling={false}
          toggleAvailiblity={() => {}}
          audioUnlocked={audioUnlocked}
          unlockAudio={unlockAudio}
          hasActiveOrder={false}
        />
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 space-y-6">
            <div>
              <h1 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                Complete Registration
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Provide your identification and contact details to start delivering with Zippy.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="12-digit Aadhar number"
                  value={aadharNumber}
                  onChange={(e) => setaadharNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Driving License Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL-0420110012345"
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Courier Photo / ID
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-400 hover:bg-indigo-50/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <BiUpload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {image ? image.name : "Select photo to upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleProfileSubmit}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? "Submitting Registration..." : "Register as Rider"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <RiderHeader
        profile={profile}
        toggling={toggling}
        toggleAvailiblity={toggleAvailiblity}
        audioUnlocked={audioUnlocked}
        unlockAudio={unlockAudio}
        hasActiveOrder={Boolean(currentOrder)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {!audioUnlocked && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <BiVolumeFull className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Enable Sound Notifications
                </p>
                <p className="text-xs text-slate-500">
                  Allow audio alerts to hear incoming 20s delivery offers.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={unlockAudio}
              className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition self-end sm:self-auto"
            >
              Enable Sound
            </button>
          </div>
        )}

        <RiderOverviewStats
          isAvailable={profile.isAvailble}
          isVerified={profile.isVerified}
          currentOrder={currentOrder}
          toggling={toggling}
          onToggleAvailability={toggleAvailiblity}
        />

        {profile.isAvailble && incomingOrders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Incoming Offers ({incomingOrders.length})
              </h2>
            </div>
            <div className="space-y-3">
              {incomingOrders.map((id) => (
                <RiderOrderRequest
                  key={id}
                  orderId={id}
                  onAccepted={() => {
                    setIncomingOrders((prev) =>
                      prev.filter((orderId) => orderId !== id)
                    );
                    fetchProfile();
                    fetchCurrentOrder();
                  }}
                  onDeclined={() => {
                    setIncomingOrders((prev) =>
                      prev.filter((orderId) => orderId !== id)
                    );
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {currentOrder ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Delivery
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <RiderCurrentOrder
                  order={currentOrder}
                  onStatusUpdate={() => {
                    fetchCurrentOrder();
                    fetchProfile();
                  }}
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <RiderOrderMap order={currentOrder} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 mb-3">
              <BiRadar
                className={`h-6 w-6 ${
                  profile.isAvailble ? "animate-spin text-slate-700" : "text-slate-400"
                }`}
              />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {profile.isAvailble
                ? "Waiting for Delivery Requests..."
                : "You Are Currently Offline"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
              {profile.isAvailble
                ? "You are online and eligible for orders within 5 km. Keep this tab open to receive dispatches."
                : "Turn online when ready to receive new delivery dispatches."}
            </p>

            {!profile.isAvailble && profile.isVerified && (
              <button
                type="button"
                onClick={toggleAvailiblity}
                disabled={toggling}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <BiCycling className="h-4 w-4" />
                {toggling ? "Updating..." : "Go Online"}
              </button>
            )}
          </div>
        )}
        <RiderShiftInfo />
      </main>
    </div>
  );
};

export default RiderDashboard;
