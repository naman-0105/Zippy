import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { BiCompass, BiMapPin, BiRefresh } from "react-icons/bi";

const Home = () => {
  const {
    location,
    loadingLocation,
    isDemoLocation,
    setDemoLocation,
    restoreRealLocation,
    requestUserLocation,
    locationError,
  } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
        }
      );

      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  if (loadingLocation && !location) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-orange-600"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-600">
          Detecting your location...
        </p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <BiMapPin className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            Location Access Required
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {locationError ||
              "Location access is currently unavailable or was denied in your browser."}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            You can explore our predefined demo restaurants to experience the full ordering flow, menu browsing, cart, and checkout.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={requestUserLocation}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <BiRefresh className="h-4 w-4" />
              Retry Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {isDemoLocation && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800">
              <BiMapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  Demo Mode Active: Sri City
                </span>
                <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900">
                  Demo
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600">
                Browsing 7+ seeded fictional restaurants within 5 km (13.5558° N, 80.0272° E). Discover restaurants, add items to cart, and test the real checkout flow.
              </p>
            </div>
          </div>
          <button
            onClick={restoreRealLocation}
            className="self-end sm:self-auto shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-amber-100/50"
          >
            Return to My Location
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-orange-600"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-500">
            Finding restaurants near you...
          </p>
        </div>
      ) : restaurants.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-8">
            {restaurants.map((res) => {
              const [resLng, resLat] = res.autoLocation.coordinates;

              const distance = getDistanceKm(
                location.latitude,
                location.longitude,
                resLat,
                resLng
              );

              return (
                <RestaurantCard
                  key={res._id}
                  id={res._id}
                  name={res.name}
                  image={res.image ?? ""}
                  distance={`${distance}`}
                  isOpen={res.isOpen}
                />
              );
            })}
          </div>

          {!isDemoLocation && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={setDemoLocation}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <BiCompass className="h-3.5 w-3.5 text-orange-600" />
                Switch to Demo
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center transition-all hover:bg-slate-50">
          <p className="text-xl font-extrabold text-slate-800">
            {isDemoLocation
              ? "No demo restaurants matched your search"
              : "No restaurants found nearby"}
          </p>
          <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
            {isDemoLocation
              ? `We couldn't find any demo spots matching "${search}". Try searching for pizza, biryani, or burger.`
              : "We couldn't find any active restaurants within the search radius of your location."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {search ? (
              <button
                onClick={() => setSearchParams({})}
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-orange-700"
              >
                Clear Search
              </button>
            ) : null}
            {!isDemoLocation && (
              <button
                onClick={requestUserLocation}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Retry Location
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
