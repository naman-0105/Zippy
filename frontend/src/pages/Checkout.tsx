import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quauntity } = useAppData();

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setselectedAddressId] = useState<string | null>(
    null
  );

  const [loadingAddress, setLoadingAddress] = useState(true);

  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] item-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;

  const platformFee = 7;

  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Zippy",
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment successfull 🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#E23744",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;

      try {
        await stripePromise;

        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/create`,
          {
            orderId,
          }
        );

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("failed to create payment session");
        }
      } catch (error) {
        toast.error("Payment Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Checkout</h1>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h2 className="text-xl font-bold text-slate-800">{restaurant.name}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-bold text-slate-800">Delivery Address</h3>

        {loadingAddress ? (
          <p className="text-sm font-medium text-slate-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">
            No address found. Please add one
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((add) => (
              <label
                key={add._id}
                className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-all duration-200 ${
                  selectedAddressId === add._id
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500"
                    : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedAddressId === add._id}
                    onChange={() => setselectedAddressId(add._id)}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{add.formattedAddress}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{add.mobile}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-bold text-slate-800">Order Summary</h3>

        <div className="space-y-3">
          {cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenuItem;
            return (
              <div className="flex justify-between text-sm font-medium text-slate-700" key={cartItem._id}>
                <span>
                  {item.name} <span className="text-slate-400">x {cartItem.quauntity}</span>
                </span>
                <span className="font-bold text-slate-800">₹{item.price * cartItem.quauntity}</span>
              </div>
            );
          })}
        </div>

        <hr className="border-slate-100" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Items ({quauntity})</span>
            <span>₹{subTotal}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Delivery Fee</span>
            <span className={deliveryFee === 0 ? "font-bold text-emerald-500" : ""}>
              {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Platform Fee</span>
            <span>₹{platformFee}</span>
          </div>
        </div>

        {subTotal < 250 && (
          <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
            Add items worth ₹{250 - subTotal} more to get Free delivery
          </div>
        )}

        <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-extrabold text-slate-900">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-bold text-slate-800">Payment Method</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
            onClick={payWithRazorpay}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingRazorpay ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (
              <BiCreditCard size={18} />
            )}
            Pay With Razorpay
          </button>

          <button
            disabled={!selectedAddressId || loadingStripe || creatingOrder}
            onClick={payWithStripe}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingStripe ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (
              <BiCreditCard size={18} />
            )}
            Pay With Stripe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
