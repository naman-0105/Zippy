import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, quauntity } = useAppData();
  const currLocation = useLocation();

  const isCustomerHomePage = isAuth && currLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    if (!isCustomerHomePage) return;
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, isCustomerHomePage]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-indigo-600 hover:text-indigo-700"
        >
          Zippy
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {isAuth ? (
            <>
              <Link
                to="/cart"
                className="group relative flex items-center justify-center p-2 text-slate-700 hover:text-indigo-600"
                aria-label="View Cart"
              >
                <CgShoppingCart className="h-6 w-6" />
                {quauntity > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {quauntity}
                  </span>
                )}
              </Link>

              <Link
                to="/account"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Account
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/restaurant"
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 sm:text-sm"
              >
                Restaurant Partner
              </Link>
              <Link
                to="/rider"
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 sm:text-sm"
              >
                Become a Rider
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 sm:text-sm"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>

      {isCustomerHomePage && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <div className="mr-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <BiMapPin className="h-4 w-4 text-indigo-500" />
              <span className="max-w-[140px] truncate text-xs font-medium sm:text-sm">
                {city}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 border-l border-slate-100 px-3 py-2">
              <BiSearch className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
