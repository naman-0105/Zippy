import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { authService, restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave, BiLogOut } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editMode) {
      setName(restaurant.name);
      setDescription(restaurant.description);
    }
    setIsOpen(restaurant.isOpen);
  }, [restaurant, editMode]);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen }
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description }
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    try {
      await axios.put(`${restaurantService}/api/restaurant/status`, {
        status: false,
      });
      await axios.post(`${authService}/api/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {restaurant.image && (
        <div className="h-44 sm:h-56 w-full overflow-hidden bg-slate-100">
          <img
            src={restaurant.image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Restaurant name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-base sm:text-lg font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {restaurant.name}
              </h1>
            )}

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <BiMapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {restaurant.autoLocation.formattedAddress ||
                  "Location unavailable"}
              </span>
            </div>
          </div>

          {isSeller && (
            <div className="flex items-center gap-2 self-start">
              {editMode ? (
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 transition"
                >
                  <BiSave size={14} />
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition"
                >
                  <BiEdit size={14} />
                  Edit Details
                </button>
              )}
            </div>
          )}
        </div>

        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Restaurant description"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        ) : (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {restaurant.description || "No description added"}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOpen ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {isOpen ? "Open for Orders" : "Closed"}
            </span>

            <span className="text-xs text-slate-400">
              Created {new Date(restaurant.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isSeller && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleOpenStatus}
                className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition ${
                  isOpen
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                }`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>

              <button
                type="button"
                onClick={logoutHandler}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
              >
                <BiLogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
