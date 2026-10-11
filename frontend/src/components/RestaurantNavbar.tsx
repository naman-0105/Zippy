import type { IRestaurant } from "../types";
import { BiStore, BiLogOut } from "react-icons/bi";

export type SellerTab = "orders" | "completed" | "menu" | "add-item" | "profile";

interface RestaurantNavbarProps {
  restaurant?: IRestaurant;
  activeTab: SellerTab;
  onTabChange: (tab: SellerTab) => void;
  isOpen?: boolean;
  onToggleStatus?: () => void;
  onLogout: () => void;
}

const RestaurantNavbar = ({
  activeTab,
  onTabChange,
  onLogout,
}: RestaurantNavbarProps) => {
  const navItems: { key: SellerTab; label: string }[] = [
    { key: "orders", label: "Active Orders" },
    { key: "completed", label: "Completed Orders" },
    { key: "menu", label: "Menu Items" },
    { key: "add-item", label: "Add Item" },
    { key: "profile", label: "Store Profile" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900">
              Zippy
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
              <BiStore className="h-3.5 w-3.5" />
              Partner
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === item.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
          >
            <BiLogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-1 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onTabChange(item.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === item.key
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default RestaurantNavbar;
