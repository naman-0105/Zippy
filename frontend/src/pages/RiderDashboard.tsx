import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";
import type { IOrder } from "../types";
import audio from "../assets/notif.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
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
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound Enabled");
    } catch (error) {
      toast.error("Tap again to enable sound");
    }
  };

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
      }, 10000);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
    } catch (error) {
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
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailble: !profile?.isAvailble,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(
          profile?.isAvailble ? "You are offline" : "You are online"
        );
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setToggling(false);
      }
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();

      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());

      if (image) {
        formData.append("file", image);
      }

      try {
        const { data } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(data.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response.data.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center transition-all hover:bg-white">
          <p className="text-xl font-extrabold text-slate-800">Access Denied</p>
          <p className="mt-2 text-sm font-medium text-slate-500">You are not registered as a rider.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-500">Loading rider details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Add Your Profile</h1>
          
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Aadhar number"
              value={aadharNumber}
              onChange={(e) => setaadharNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
            <input
              type="number"
              placeholder="Contact Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
            <input
              type="text"
              placeholder="Driving Licence"
              value={drivingLicenseNumber}
              onChange={(e) => setDrivingLicenseNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />

            <label className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200">
                <BiUpload className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-600 transition-colors group-hover:text-indigo-600">
                {image ? image.name : "Upload your image"}
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>

            <button
              className="mt-2 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "Add Profile"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8 sm:max-w-xl sm:px-6 lg:px-8">
      
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-violet-500 sm:h-32"></div>
        <div className="relative px-6 pb-6 pt-0 text-center sm:px-8 sm:pb-8">
          <img
            src={profile.picture}
            className="mx-auto -mt-12 h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-md sm:-mt-16 sm:h-32 sm:w-32"
            alt="Profile"
          />
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">{user?.name}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{profile.phoneNumber}</p>

          <div className="mt-4 flex justify-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${profile.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {profile.isVerified ? (
                <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Verified</>
              ) : (
                <><span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Pending</>
              )}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${profile.isAvailble ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
              {profile.isAvailble ? (
                <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500"></span> Online</>
              ) : (
                <><span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Offline</>
              )}
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-indigo-50/50 p-4 text-left text-xs font-medium leading-relaxed text-indigo-700">
            Please be within a 5000m radius of any restaurant (hotspot) before going online to receive orders.
          </div>

          {profile.isVerified && !currentOrder && (
            <button
              onClick={toggleAvailiblity}
              disabled={toggling}
              className={`mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                toggling
                  ? "bg-slate-400"
                  : profile.isAvailble
                  ? "bg-slate-800 hover:bg-slate-900"
                  : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
              }`}
            >
              {toggling
                ? "Updating..."
                : profile.isAvailble
                ? "Go Offline"
                : "Go Online"}
            </button>
          )}
        </div>
      </div>

      {!audioUnlocked && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm">🔔</div>
            <div>
              <p className="text-sm font-bold text-indigo-900">Enable Sound</p>
              <p className="mt-0.5 text-xs font-medium text-indigo-700">Get notified when orders arrive</p>
            </div>
          </div>
          <button
            onClick={unlockAudio}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100"
          >
            Enable
          </button>
        </div>
      )}

      {profile.isAvailble && incomingOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Incoming Orders</h3>
          <div className="space-y-3">
            {incomingOrders.map((id) => (
              <RiderOrderRequest
                key={id}
                orderId={id}
                onAccepted={() => {
                  fetchProfile();
                  fetchCurrentOrder();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {currentOrder && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
             <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600">Active Delivery</h3>
          </div>
          <RiderCurrentOrder
            order={currentOrder}
            onStatusUpdate={fetchCurrentOrder}
          />
          <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <RiderOrderMap order={currentOrder} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
