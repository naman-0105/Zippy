import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      alert("Name, price and image are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData);

      toast.success("Item added successfully");
      resetForm();
      onItemAdded();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 py-2">
      <div>
        <h2 className="text-base font-bold text-slate-900">Add Menu Item</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Add a new dish to your restaurant's live catalog.
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Dish name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
        />

        <textarea
          placeholder="Description (optional)"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
        />

        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-blue-400 hover:bg-blue-50/20">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BiUpload className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-600 truncate">
            {image ? image.name : "Select dish image to upload"}
          </span>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Adding Item..." : "Add Item"}
        </button>
      </div>
    </div>
  );
};

export default AddMenuItem;
