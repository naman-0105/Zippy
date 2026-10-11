import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, restaurantService } from "../main";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${authService}/api/auth/me`);
      if (data && data._id) {
        setUser(data);
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    } catch {
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quauntity, setQuauntity] = useState(0);

  async function fetchCart() {
    if (!user || user.role !== "customer") return;
    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`);

      setCart(data.cart || []);
      setSubTotal(data.subtotal || 0);
      setQuauntity(data.cartLength);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user]);

  const [realLocation, setRealLocation] = useState<LocationData | null>(null);
  const [realCity, setRealCity] = useState("Your Location");
  const [isDemoLocation, setIsDemoLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoadingLocation(false);
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          const resolvedAddress = data.display_name || "Current Location";
          const resolvedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "Your Location";

          const userLoc: LocationData = {
            latitude,
            longitude,
            formattedAddress: resolvedAddress,
          };

          setRealLocation(userLoc);
          setRealCity(resolvedCity);

          if (!isDemoLocation) {
            setLocation(userLoc);
            setCity(resolvedCity);
          }
          setLoadingLocation(false);
        } catch {
          const fallbackLoc: LocationData = {
            latitude,
            longitude,
            formattedAddress: "Current Location",
          };
          setRealLocation(fallbackLoc);
          setRealCity("Your Location");

          if (!isDemoLocation) {
            setLocation(fallbackLoc);
            setCity("Your Location");
          }
          setLoadingLocation(false);
        }
      },
      (error) => {
        setLoadingLocation(false);
        setLocationError(error.message || "Unable to retrieve your location.");
        if (!isDemoLocation && !location) {
          setCity("Location Unavailable");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const setDemoLocation = () => {
    const demoLoc: LocationData = {
      latitude: 13.5558,
      longitude: 80.0272,
      formattedAddress: "Gnan Marg, Sri City, Andhra Pradesh 517646, India",
    };
    setLocation(demoLoc);
    setCity("Sri City (Demo)");
    setIsDemoLocation(true);
    setLoadingLocation(false);
    setLocationError(null);
  };

  const restoreRealLocation = () => {
    setIsDemoLocation(false);
    if (realLocation) {
      setLocation(realLocation);
      setCity(realCity);
    } else {
      setLocation(null);
      setCity("Fetching Location...");
      requestUserLocation();
    }
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        user,
        location,
        loadingLocation,
        city,
        cart,
        fetchCart,
        quauntity,
        subTotal,
        isDemoLocation,
        setDemoLocation,
        restoreRealLocation,
        requestUserLocation,
        realLocation,
        locationError,
      }}
    >
      {children}

      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
