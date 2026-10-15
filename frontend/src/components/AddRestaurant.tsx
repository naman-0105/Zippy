import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("All fields and location are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formattedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData);

      toast.success("Restaurant added successfully");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Register Your Restaurant
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Set up your restaurant store details to start receiving customer orders on Zippy.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Spice Symphony"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Short description of cuisines or specialties"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Storefront Photo
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-orange-400 hover:bg-orange-50/20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detected Store Location
            </label>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <BiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
              <div className="text-xs font-medium text-slate-600">
                {loadingLocation
                  ? "Detecting location coordinates..."
                  : location?.formattedAddress || "Location unavailable"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-orange-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-orange-700 disabled:opacity-50 transition"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Registering..." : "Add Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
