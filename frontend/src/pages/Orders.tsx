import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);
if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-500">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4">
        <div className="flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:bg-slate-50">
          <p className="text-xl font-extrabold text-slate-800">No orders yet</p>
          <p className="mt-2 text-sm font-medium text-slate-500">Looks like you haven't placed any orders.</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Orders</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
            <p className="text-sm font-medium text-slate-500">No active orders</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Completed Orders</h2>
        {completedOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
            <p className="text-sm font-medium text-slate-500">No completed orders</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {completedOrders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onClick={() => navigate(`/order/${order._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;

// component Order row
const OrderRow = ({
  order,
  onClick,
}: {
  order: IOrder;
  onClick: () => void;
}) => {
return (
    <div
      className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md"
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
            Order #{order._id.slice(-6)}
          </p>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            ACTIVE_STATUSES.includes(order.status) 
              ? "bg-indigo-50 text-indigo-600" 
              : "bg-slate-100 text-slate-500"
          }`}>
            {order.status.replace("_", " ")}
          </span>
        </div>

        <div className="mt-3 text-sm font-medium leading-relaxed text-slate-600 line-clamp-2">
          {order.items.map((item, i) => (
            <span key={i}>
              {item.name} <span className="text-slate-400">x {item.quauntity}</span>
              {i < order.items.length - 1 && ", "}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="font-bold text-slate-500">Total</span>
        <span className="text-base font-extrabold text-slate-900">₹{order.totalAmount}</span>
      </div>
    </div>
  );
};
