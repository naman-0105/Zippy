import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join", `user:${id}`);

    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ latitude, longitude }: any) => {
      console.log("Rider Location:", latitude, longitude);
      setRiderLocation([latitude, longitude]);
    };

    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-500">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4">
        <div className="flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:bg-slate-50">
          <p className="text-xl font-extrabold text-slate-800">No order Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Order #{order._id.slice(-6)}
        </h1>
        <div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
          </span>
          <span className="text-sm font-bold capitalize text-indigo-700">
            {order.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-lg font-bold text-slate-800">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div className="flex justify-between text-sm font-medium text-slate-700" key={i}>
              <span>
                {item.name} <span className="text-slate-400">x {item.quauntity}</span>
              </span>
              <span className="font-bold text-slate-800">₹{item.price * item.quauntity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-lg font-bold text-slate-800">Delivery Address</h2>
        <p className="text-sm font-medium text-slate-600">
          {order.deliveryAddress.fromattedAddress}
        </p>
        <p className="text-sm font-medium text-slate-500">
          Mobile: <span className="font-semibold text-slate-700">{order.deliveryAddress.mobile}</span>
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>SubTotal</span> <span className="text-slate-800">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Delivery Fee</span> <span className="text-slate-800">₹{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Platform Fee</span> <span className="text-slate-800">₹{order.platfromFee}</span>
          </div>
        </div>
        
        <hr className="border-slate-100" />
        
        <div className="flex justify-between text-lg font-extrabold text-slate-900">
          <span>Total</span> <span>₹{order.totalAmount}</span>
        </div>

        <div className="mt-4 flex gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Method</p>
            <p className="mt-1 text-sm font-bold capitalize text-slate-700">{order.paymentMethod}</p>
          </div>
          <div className="flex-1 border-l border-slate-200 pl-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Status</p>
            <p className={`mt-1 text-sm font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>

      {(order.status === "rider_assigned" || order.status === "picked_up") && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {riderLocation ? (
            <UserOrderMap
              riderLocation={riderLocation}
              deliveryLocation={[
                order.deliveryAddress.latitude!,
                order.deliveryAddress.longitude!,
              ]}
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-slate-50/50">
              <p className="animate-pulse text-sm font-bold text-indigo-500">Waiting for rider location...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
