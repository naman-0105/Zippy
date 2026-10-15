import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch, BiMenu, BiX } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, quauntity, isDemoLocation, restoreRealLocation } =
    useAppData();
  const currLocation = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCustomerHomePage = isAuth && currLocation.pathname === "/";
  const isLandingPage = !isAuth && currLocation.pathname === "/";

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
  }, [search, isCustomerHomePage, setSearchParams]);

  const handleNavScroll = (elementId: string) => {
    setMobileMenuOpen(false);
    if (isLandingPage) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${elementId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-1.5 text-2xl font-black tracking-tight text-stone-900 hover:opacity-90"
          aria-label="Zippy Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-base font-extrabold text-white">
            Z
          </span>
          <span>
            Zippy<span className="text-orange-600">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {isAuth ? (
            <>
              <Link
                to="/cart"
                className="group relative flex items-center justify-center rounded-lg p-2 text-stone-700 transition hover:bg-stone-100 hover:text-orange-600"
                aria-label="View Cart"
              >
                <CgShoppingCart className="h-6 w-6" />
                {quauntity > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white shadow-xs">
                    {quauntity}
                  </span>
                )}
              </Link>

              <Link
                to="/account"
                className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
              >
                Account
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="text-sm font-medium text-stone-600 transition hover:text-orange-600"
              >
                Home
              </Link>

              <a
                href="/#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavScroll("how-it-works");
                }}
                className="text-sm font-medium text-stone-600 transition hover:text-orange-600"
              >
                How It Works
              </a>

              <Link
                to="/restaurant"
                className="text-sm font-medium text-stone-600 transition hover:text-orange-600"
              >
                Restaurant Partner
              </Link>

              <Link
                to="/rider"
                className="text-sm font-medium text-stone-600 transition hover:text-orange-600"
              >
                Become a Rider
              </Link>

              <div className="flex items-center gap-3 pl-2">
                <Link
                  to="/login"
                  className="rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {isAuth && (
            <Link
              to="/cart"
              className="relative p-2 text-stone-700 hover:text-orange-600"
              aria-label="View Cart"
            >
              <CgShoppingCart className="h-6 w-6" />
              {quauntity > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                  {quauntity}
                </span>
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <BiX className="h-6 w-6" />
            ) : (
              <BiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pt-3 pb-5 shadow-lg md:hidden">
          <nav className="flex flex-col gap-2.5">
            {isAuth ? (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Home
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cart ({quauntity})
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Account & Orders
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Home
                </Link>
                <a
                  href="/#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavScroll("how-it-works");
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  How It Works
                </a>
                <Link
                  to="/restaurant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Restaurant Partner
                </Link>
                <Link
                  to="/rider"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Become a Rider
                </Link>
                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-stone-100">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Login
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      {isCustomerHomePage && (
        <div className="border-t border-stone-100 bg-stone-50 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center rounded-xl border border-stone-200 bg-white p-1 shadow-xs">
            <div
              className={`mr-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-stone-700 transition-colors ${
                isDemoLocation
                  ? "bg-amber-50 border border-amber-200 text-amber-900"
                  : "bg-stone-50"
              }`}
            >
              <BiMapPin
                className={`h-4 w-4 ${
                  isDemoLocation ? "text-amber-600" : "text-orange-600"
                }`}
              />
              <span className="max-w-[140px] truncate text-xs font-semibold sm:text-sm">
                {city}
              </span>
              {isDemoLocation && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    restoreRealLocation();
                  }}
                  title="Return to real location"
                  className="ml-1 rounded bg-amber-200/80 px-1 py-0.5 text-[9px] font-extrabold uppercase text-amber-900 hover:bg-amber-300"
                >
                  Demo
                </button>
              )}
            </div>
            <div className="flex flex-1 items-center gap-2 border-l border-stone-100 px-3 py-2">
              <BiSearch className="h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search for restaurants, biryani, pizza..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-stone-700 outline-none placeholder:text-stone-400 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
