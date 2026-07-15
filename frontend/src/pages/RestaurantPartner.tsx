import { Link } from "react-router-dom";
import { BiRestaurant, BiReceipt, BiLineChart } from "react-icons/bi";

const RestaurantPartner = () => {
  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col justify-between bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Partner with Zippy
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
          Manage your restaurant, menu and orders with Zippy.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/login?role=seller"
            className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            Continue
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BiRestaurant className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Menu Control</h2>
            <p className="mt-1 text-xs text-slate-500">
              Easily update food items, pricing, and availability in real time.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BiReceipt className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Order Management</h2>
            <p className="mt-1 text-xs text-slate-500">
              Accept orders, update preparation stages, and dispatch to riders.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BiLineChart className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Track Sales</h2>
            <p className="mt-1 text-xs text-slate-500">
              Keep track of incoming orders and growing revenue with simple metrics.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            © 2026 Zippy Restaurant Partner.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-700">
              Home
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

export default RestaurantPartner;
