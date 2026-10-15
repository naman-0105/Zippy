import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BiRestaurant,
  BiCycling,
  BiShoppingBag,
  BiCompass,
  BiRightArrowAlt,
  BiCheckCircle,
  BiTimeFive,
  BiDish,
  BiStore,
  BiCheckShield,
} from "react-icons/bi";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { authService } from "../main";

const Landing = () => {
  const { setUser, setIsAuth, setDemoLocation } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);
  const handleExploreDemo = async (searchQuery?: string) => {
    setLoadingDemo(true);
    try {
      const result = await axios.post(`${authService}/api/auth/demo-login`, {
        role: "customer",
      });
      setUser(result.data.user);
      setIsAuth(true);
      setDemoLocation();

      if (searchQuery) {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate("/");
      }
    } catch {
      if (searchQuery) {
        navigate(
          `/login?role=customer&search=${encodeURIComponent(searchQuery)}`,
        );
      } else {
        navigate("/login?role=customer");
      }
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col bg-[#fafaf9] text-stone-900">
      <main className="flex-1">
        <section className="border-b border-stone-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-10 lg:col-span-7 lg:pr-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                  Your next favourite meal is just a few clicks away.
                </h1>

                <p className="max-w-2xl text-base text-stone-600 sm:text-lg">
                  Craving slow-cooked dum biryani, stone-baked pizza, or
                  comforting South Indian dosas? Discover fresh food from
                  trusted local kitchens, order seamlessly, and follow your
                  rider in real time.
                </p>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => handleExploreDemo()}
                    disabled={loadingDemo}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-xs transition hover:bg-orange-700 disabled:opacity-70"
                  >
                    <BiCompass className="h-4 w-4" />
                    <span>
                      {loadingDemo
                        ? "Launching Food Catalog..."
                        : "Explore Food Now (Demo)"}
                    </span>
                    <BiRightArrowAlt className="h-4 w-4" />
                  </button>

                  <Link
                    to="/login?role=customer"
                    className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Customer Sign In
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3 sm:border-t sm:border-stone-100">
                  <div className="flex items-center gap-2.5 text-xs font-medium text-stone-600">
                    <BiDish className="h-4 w-4 text-orange-600 shrink-0" />
                    <span>Fresh local kitchens</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-stone-600">
                    <BiTimeFive className="h-4 w-4 text-orange-600 shrink-0" />
                    <span>Live order tracking</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium text-stone-600">
                    <BiCheckShield className="h-4 w-4 text-orange-600 shrink-0" />
                    <span>Secure 4-digit OTP handoff</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm">
                  <div className="relative aspect-4/3 w-full sm:aspect-16/11">
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80"
                      alt="Appetizing Sourdough Pizza spread featuring Margherita Superiore & Smoked Pepperoni"
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-white/95 px-3.5 py-2.5 backdrop-blur-xs">
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          Freshly prepared & hot
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Cooked to order by partner kitchens
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-16 border-t border-stone-200/80 bg-[#fafaf9] py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="mt-8 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                How Zippy works
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">
                From kitchen to doorstep in three straightforward steps.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <BiRestaurant className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black text-stone-200">01</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-stone-900">
                  1. Explore food and choose a restaurant
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Browse menus from local kitchens, search by dish or cuisine,
                  and customize your cart items easily.
                </p>
              </div>

              <div className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <BiShoppingBag className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black text-stone-200">02</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-stone-900">
                  2. Place your order and complete checkout
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Select your delivery address, check transparent billing with
                  platform and delivery fees, and confirm payment.
                </p>
              </div>

              <div className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <BiCycling className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-black text-stone-200">03</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-stone-900">
                  3. Track your order until it arrives
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Follow live preparation status, view your rider's location on
                  the map, and confirm delivery safely with an OTP.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200/80 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Partner with Zippy
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">
                Whether you run a kitchen or want to deliver orders, Zippy
                offers dedicated tools for every role.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/40 p-6 sm:p-8">
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <BiStore className="h-6 w-6" />
                  </div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-orange-700">
                    For Restaurants
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-stone-900">
                    Grow your food business with Zippy
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    Manage your restaurant profile, update menu items and
                    pricing in real time, accept incoming orders, and hand off
                    meals directly to nearby riders.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-stone-600">
                    <li className="flex items-center gap-2">
                      <BiCheckCircle className="h-4 w-4 text-emerald-600" />
                      Live menu control
                    </li>
                    <li className="flex items-center gap-2">
                      <BiCheckCircle className="h-4 w-4 text-emerald-600" />
                      Stage-by-stage kitchen order management
                    </li>
                    <li className="flex items-center gap-2">
                      <BiCheckCircle className="h-4 w-4 text-emerald-600" />
                      Automated rider dispatching upon preparation
                    </li>
                  </ul>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-stone-200/60">
                  <Link
                    to="/login?role=seller"
                    className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
                  >
                    Restaurant Login
                  </Link>
                  <Link
                    to="/restaurant"
                    className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Partner Overview
                  </Link>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/40 p-6 sm:p-8">
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <BiCycling className="h-6 w-6" />
                  </div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-orange-700">
                    For Riders
                  </span>
                  <h3 className="mt-1 text-xl font-bold text-stone-900">
                    Deliver with freedom and flexibility
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    Access assigned delivery tasks, navigate to restaurant
                    pickups and customer drops with Leaflet maps, and verify
                    handoffs with safe OTP codes.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-stone-600">
                    <li className="flex items-center gap-2">
                      <BiCheckCircle className="h-4 w-4 text-emerald-600" />
                      Real-time delivery requests with audio notification
                    </li>
                    <li className="flex items-center gap-2">
                      <BiCheckCircle className="h-4 w-4 text-emerald-600" />
                      Interactive route navigation with distance calculation
                    </li>
                    <li className="flex items-center gap-2">
                      <BiCheckCircle className="h-4 w-4 text-emerald-600" />
                      Secure handoffs verified by customer OTP
                    </li>
                  </ul>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-stone-200/60">
                  <Link
                    to="/login?role=rider"
                    className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800"
                  >
                    Rider Login
                  </Link>
                  <Link
                    to="/rider"
                    className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Rider Information
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-stone-900 text-stone-400">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="space-y-3 md:col-span-5">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xl font-black tracking-tight text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
                  Z
                </span>
                <span>
                  Zippy<span className="text-orange-500">.</span>
                </span>
              </Link>
              <p className="max-w-sm text-xs leading-relaxed text-stone-400">
                A food delivery platform engineered with MongoDB, Express,
                React, and Node.js. Discover local restaurants, place orders,
                and follow deliveries in real time.
              </p>
            </div>

            <div className="space-y-3 md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Order & Discover
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => handleExploreDemo()}
                    className="text-stone-400 transition hover:text-white"
                  >
                    Explore Food Menu
                  </button>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById("how-it-works");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-stone-400 transition hover:text-white"
                  >
                    How Zippy Works
                  </a>
                </li>
                <li>
                  <Link
                    to="/login?role=customer"
                    className="text-stone-400 transition hover:text-white"
                  >
                    Customer Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 md:col-span-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Partner Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/restaurant"
                    className="text-stone-400 transition hover:text-white"
                  >
                    Restaurant Partner Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rider"
                    className="text-stone-400 transition hover:text-white"
                  >
                    Become a Delivery Rider
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login?role=seller"
                    className="text-stone-400 transition hover:text-white"
                  >
                    Restaurant Partner Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login?role=rider"
                    className="text-stone-400 transition hover:text-white"
                  >
                    Rider Partner Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© 2026 Zippy Food Delivery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
