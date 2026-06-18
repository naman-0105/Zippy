import axios from "axios";
import { useState } from "react";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const updateStatus = async () => {
    try {
      setUpdatingStatus(true);
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setVerifying(true);
      await axios.post(
        `${riderService}/api/rider/order/verify-delivery/${order._id}`,
        { otp: otp.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Delivery verified successfully 🎉");
      setOtp("");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid delivery OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm p-4 space-y-4">
      <h1 className="font-semibold text-gray-800">Current Order</h1>

      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <b>Pickup:</b> {order.restaurantName}
        </p>
        <p>
          <b>Drop:</b> {order.deliveryAddress.fromattedAddress}
        </p>
        <p>
          <b>Total:</b> ₹{order.totalAmount}
        </p>
        <p>
          <b>Payment:</b>{" "}
          <span className="capitalize font-medium text-slate-700">
            {order.paymentMethod} ({order.paymentStatus})
          </span>
        </p>
        <p>
          <b>Your Earning:</b> ₹{order.riderAmount}
        </p>
        <p>
          <b>Status:</b>{" "}
          <span className="capitalize font-semibold text-indigo-600">
            {order.status.replace("_", " ")}
          </span>
        </p>
      </div>

      {order.deliveryAddress.mobile && (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="text-sm">
            <p className="text-gray-500">Customer Phone</p>
            <p className="font-semibold text-gray-800">
              {order.deliveryAddress.mobile}
            </p>
          </div>
          <a
            href={`tel:${order.deliveryAddress.mobile}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Call
          </a>
        </div>
      )}

      <div className="space-y-3 pt-2">
        {order.status === "rider_assigned" && (
          <button
            onClick={updateStatus}
            disabled={updatingStatus}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2.5 font-semibold transition-all disabled:opacity-60"
          >
            {updatingStatus ? "Updating..." : "Order Picked Up"}
          </button>
        )}

        {order.status === "picked_up" && (
          <form onSubmit={verifyDelivery} className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Customer Delivery OTP
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Ask customer for their 4-digit OTP to complete delivery
              </p>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 4-digit OTP"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-xl font-bold tracking-widest text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || otp.length !== 4}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
            >
              {verifying ? "Verifying OTP..." : "Verify & Complete Delivery"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
