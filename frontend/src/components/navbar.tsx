import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, quauntity } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
return (
    <div className="sticky top-0 z-50 w-full border-b border-white/60 bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          to={"/"}
          className="cursor-pointer text-2xl font-extrabold tracking-tight text-indigo-600"
        >
          Zippy
        </Link>

        <div className="flex items-center gap-6">
          <Link to={"/cart"} className="group relative flex items-center justify-center p-2">
            <CgShoppingCart className="h-6 w-6 text-slate-600 transition-colors group-hover:text-indigo-600" />
            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md shadow-indigo-200">
              {quauntity}
            </span>
          </Link>

          {isAuth ? (
            <Link
              to="/account"
              className="rounded-xl bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-sm"
            >
              Account
            </Link>
          ) : (
            <Link
              to="/Login"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {isHomePage && (
        <div className="border-t border-slate-100/60 bg-slate-50/50 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
            <div className="mr-2 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-slate-700">
              <BiMapPin className="h-4 w-4 text-indigo-500" />
              <span className="max-w-35 truncate text-sm font-medium">{city}</span>
            </div>
            <div className="flex flex-1 items-center gap-3 border-l border-slate-100 px-4 py-2.5">
              <BiSearch className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for restaurant"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
