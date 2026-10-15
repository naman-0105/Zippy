import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { authService, restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import RestaurantNavbar, { type SellerTab } from "../components/RestaurantNavbar";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("orders");

  const { setIsAuth, setUser } = useAppData();

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`
      );

      setRestaurant(data.restaurant || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${restaurantId}`
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant]);

  const toggleOpenStatus = async () => {
    if (!restaurant) return;
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !restaurant.isOpen }
      );

      toast.success(data.message);
      setRestaurant(data.restaurant);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const logoutHandler = async () => {
    try {
      if (restaurant) {
        await axios.put(`${restaurantService}/api/restaurant/status`, {
          status: false,
        });
      }
      await axios.post(`${authService}/api/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-orange-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading restaurant...
        </p>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <RestaurantNavbar
        restaurant={restaurant}
        activeTab={tab}
        onTabChange={setTab}
        isOpen={restaurant.isOpen}
        onToggleStatus={toggleOpenStatus}
        onLogout={logoutHandler}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className={tab === "orders" || tab === "completed" ? "" : "hidden"}>
          <RestaurantOrders
            restaurantId={restaurant._id}
            view={tab === "completed" ? "completed" : "active"}
          />
        </div>

        {tab === "menu" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Menu Items ({menuItems.length})
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Manage dishes and live availability for customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTab("add-item")}
                className="rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 shadow-xs transition"
              >
                Add Item
              </button>
            </div>

            <MenuItems
              items={menuItems}
              onItemDeleted={() => fetchMenuItems(restaurant._id)}
              isSeller={true}
            />
          </div>
        )}

        {tab === "add-item" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <AddMenuItem
              onItemAdded={() => {
                fetchMenuItems(restaurant._id);
                setTab("menu");
              }}
            />
          </div>
        )}

        {tab === "profile" && (
          <RestaurantProfile
            restaurant={restaurant}
            onUpdate={setRestaurant}
            isSeller={true}
          />
        )}
      </div>
    </div>
  );
};

export default Restaurant;
