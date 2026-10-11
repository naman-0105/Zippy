import axios from "axios";
import { useState } from "react";
import type { IOrder, IRestaurant } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import {
  BiMapPin,
  BiPackage,
  BiCheckCircle,
  BiShieldQuarter,
  BiShoppingBag,
  BiStore,
} from "react-icons/bi";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const isAssigned = order.status === "rider_assigned";
  const isPickedUp = order.status === "picked_up";

  const restaurantObj =
    typeof order.restaurantId === "object" && order.restaurantId !== null
      ? (order.restaurantId as IRestaurant)
      : null;

  const restaurantAddress =
    restaurantObj?.autoLocation?.formattedAddress ||
    order.restaurantName ||
    "Restaurant Hub";

  const customerDropAddress =
    order.deliveryAddress?.fromattedAddress ||
    (order.deliveryAddress as any)?.formattedAddress ||
    "Customer Address";

  const updateStatus = async () => {
    if (updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {}
      );

      toast.success("Order marked as picked up");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const verifyDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.trim().length !== 4) {
      toast.error("Please enter the 4-digit OTP");
      return;
    }

    try {
      setVerifying(true);
      await axios.post(
        `${riderService}/api/rider/order/verify-delivery/${order._id}`,
        { otp: otp.trim() }
      );

      toast.success("Delivery completed");
      setOtp("");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Invalid delivery OTP"
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Order ID
            </p>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base font-mono">
              {order._id}
            </h3>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                isAssigned ? "bg-amber-500" : "bg-slate-700"
              }`}
            />
            {isAssigned ? "Pickup Required" : "Out for Delivery"}
          </span>
        </div>

        <div className="border-b border-slate-100 bg-white px-5 py-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-800">
              <BiCheckCircle className="h-4 w-4 text-slate-700" />
              <span>1. Assigned</span>
            </div>
            <div
              className={`h-px flex-1 mx-3 ${
                isPickedUp ? "bg-slate-700" : "bg-slate-200"
              }`}
            />
            <div
              className={`flex items-center gap-1.5 ${
                isPickedUp ? "text-slate-800 font-bold" : "text-slate-400"
              }`}
            >
              <BiPackage className="h-4 w-4" />
              <span>2. Picked Up</span>
            </div>
            <div className="h-px flex-1 mx-3 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <BiShieldQuarter className="h-4 w-4" />
              <span>3. Delivered</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 p-5 space-y-4 text-xs">
          <div className="flex items-start gap-3 pt-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 mt-0.5">
              <BiStore className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pickup From
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                {order.restaurantName}
              </h4>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                {restaurantAddress}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 mt-0.5">
              <BiMapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Deliver To
              </span>
              <h4 className="font-bold text-slate-900 text-sm">
                Customer Location
              </h4>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                {customerDropAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/30 p-5">
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[11px] font-semibold text-slate-400">
                Order Total
              </span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                ₹{order.totalAmount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[11px] font-semibold text-slate-400">
                Payment
              </span>
              <p className="font-bold text-slate-800 capitalize text-sm mt-0.5">
                {order.paymentMethod || "Online"} ({order.paymentStatus})
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <button
              type="button"
              onClick={() => setItemsExpanded(!itemsExpanded)}
              className="flex w-full items-center justify-between text-xs font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <BiShoppingBag className="h-4 w-4 text-slate-500" />
                <span>
                  Items Summary ({order.items?.length || 0})
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {itemsExpanded ? "Hide Details ▲" : "View Details ▼"}
              </span>
            </button>

            {itemsExpanded && order.items && order.items.length > 0 && (
              <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100 pt-2 space-y-1.5 text-xs text-slate-600">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between pt-1"
                  >
                    <span>
                      {item.quauntity}x {item.name}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{item.price * item.quauntity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white p-5">
          {isAssigned && (
            <button
              type="button"
              onClick={updateStatus}
              disabled={updatingStatus}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <BiPackage className="h-4 w-4" />
              {updatingStatus ? "Updating..." : "Mark as Picked Up"}
            </button>
          )}

          {isPickedUp && (
            <form onSubmit={verifyDelivery} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer 4-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter OTP"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-lg font-black tracking-widest text-slate-900 outline-none transition focus:border-slate-800 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 4}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <BiCheckCircle className="h-4 w-4" />
                {verifying ? "Verifying..." : "Verify & Complete Delivery"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
