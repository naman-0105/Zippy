import { Link, useNavigate } from "react-router-dom";
import { BiRestaurant, BiCycling, BiShoppingBag, BiCompass } from "react-icons/bi";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import axios from "axios";
import { authService } from "../main";

const Landing = () => {
  const { setUser, setIsAuth, setDemoLocation } = useAppData();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleExploreDemo = async () => {
    setLoadingDemo(true);
    try {
      const result = await axios.post(`${authService}/api/auth/demo-login`, {
        role: "customer",
      });
      setUser(result.data.user);
      setIsAuth(true);
      setDemoLocation();
      navigate("/");
    } catch {
      navigate("/login?role=customer");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col justify-between bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-10 text-center sm:py-14">

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Food delivery, made simple.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Discover restaurants, order your favorite food, and track your delivery.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={handleExploreDemo}
            disabled={loadingDemo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 sm:w-auto disabled:opacity-60"
          >
            <BiCompass className="h-4 w-4" />
            {loadingDemo ? "Launching Demo..." : "Explore Demo Mode"}
          </button>
          <Link
            to="/login?role=customer"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            Sign In
          </Link>
          <Link
            to="/restaurant"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            Restaurant Partner
          </Link>
          <Link
            to="/rider"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            Become a Rider
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BiShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Easy Ordering</h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse curated menus from local favorites and order with ease.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BiRestaurant className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Partner with Us</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your menu and orders directly with Zippy's restaurant dashboard.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BiCycling className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Deliver with Freedom</h2>
            <p className="mt-1 text-sm text-slate-500">
              Accept nearby orders with real-time notifications and OTP verification.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © 2026 Zippy. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/restaurant" className="hover:text-slate-700">
              Restaurant Partner
            </Link>
            <Link to="/rider" className="hover:text-slate-700">
              Become a Rider
            </Link>
            <Link to="/login" className="hover:text-slate-700">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
