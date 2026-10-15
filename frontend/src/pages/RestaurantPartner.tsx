import { Link } from "react-router-dom";
import { BiRestaurant, BiReceipt, BiLineChart } from "react-icons/bi";

const RestaurantPartner = () => {
  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col justify-between bg-[#fafaf9] text-stone-900">
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Partner with Zippy
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-base text-stone-600 sm:text-lg">
          Manage your restaurant, update menus in real time, and process orders with Zippy.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/login?role=seller"
            className="rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-orange-700"
          >
            Restaurant Partner Login
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <BiRestaurant className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-stone-900">Menu Control</h2>
            <p className="mt-1 text-xs text-stone-500">
              Easily update food items, pricing, and availability in real time.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <BiReceipt className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-stone-900">Order Management</h2>
            <p className="mt-1 text-xs text-stone-500">
              Accept orders, update preparation stages, and dispatch to riders.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <BiLineChart className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-stone-900">Order Tracking</h2>
            <p className="mt-1 text-xs text-stone-500">
              Stay updated on order progress, from placement to delivery.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-stone-500">
            © 2026 Zippy Restaurant Partner.
          </p>
          <div className="flex items-center gap-6 text-xs text-stone-500">
            <Link to="/" className="hover:text-stone-700">
              Home
            </Link>
            <Link to="/rider" className="hover:text-stone-700">
              Become a Rider
            </Link>
            <Link to="/login?role=seller" className="hover:text-stone-700">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantPartner;
