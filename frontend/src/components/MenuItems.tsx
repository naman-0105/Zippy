import { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`);

      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailiblity = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {}
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const { fetchCart } = useAppData();

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        }
      );

      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <p className="text-xs font-medium text-slate-500">No menu items added yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            key={item._id}
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 flex flex-col justify-between space-y-3 ${
              !item.isAvailable ? "opacity-75" : ""
            }`}
          >
            <div className="space-y-3">
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={item.image}
                  alt=""
                  className={`h-full w-full object-cover ${
                    !item.isAvailable ? "grayscale contrast-75" : ""
                  }`}
                />
                {!item.isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-xs font-semibold text-white">
                    Not Available
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-bold text-slate-900">
                ₹{item.price}
              </span>

              {isSeller && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleAvailiblity(item._id)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    {item.isAvailable ? (
                      <BsEye size={15} />
                    ) : (
                      <FiEyeOff size={15} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <BiTrash size={15} />
                  </button>
                </div>
              )}

              {!isSeller && (
                <button
                  type="button"
                  disabled={!item.isAvailable || isLoading}
                  onClick={() => addToCart(item.restaurantId, item._id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    !item.isAvailable || isLoading
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "bg-orange-600 text-white hover:bg-orange-700 shadow-xs"
                  }`}
                >
                  {isLoading ? (
                    <VscLoading size={14} className="animate-spin" />
                  ) : (
                    <>
                      <BsCartPlus size={14} />
                      Add
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
