import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import axios from "axios";
import { realtimeService } from "../main";
import { BiNavigation } from "react-icons/bi";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

const riderIcon = new L.DivIcon({
  html: "<div class='text-2xl drop-shadow-md select-none'>🛵</div>",
  iconSize: [32, 32],
  className: "rider-marker",
});

const deliveryIcon = new L.DivIcon({
  html: "<div class='text-2xl drop-shadow-md select-none'>📍</div>",
  iconSize: [32, 32],
  className: "delivery-marker",
});

interface Props {
  order: IOrder;
}

const Routing = ({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [L.latLng(from), L.latLng(to)],
      lineOptions: {
        styles: [{ color: "#4F46E5", weight: 5, opacity: 0.85 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    return () => {
      try {
        map.removeControl(control);
      } catch {

      }
    };
  }, [from, to, map]);

  return null;
};

const RiderOrderMap = ({ order }: Props) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  if (
    order.deliveryAddress?.latitude == null ||
    order.deliveryAddress?.longitude == null
  ) {
    return null;
  }

  const deliveryLocation: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          setRiderLocation([latitude, longitude]);

          axios
            .post(
              `${realtimeService}/api/v1/internal/emit`,
              {
                event: "rider:location",
                room: `user:${order.userId}`,
                payload: { latitude, longitude },
              },
              {
                headers: {
                  "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY,
                },
              }
            )
            .catch(() => {});
        },
        (err) => console.log("Rider Map Location:", err),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order.userId]);

  if (!riderLocation) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 mb-2"></div>
        <p className="text-xs font-semibold">Acquiring live map coordinates...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 shadow-md border border-slate-200/80 text-[11px] font-bold text-slate-800 backdrop-blur-xs">
        <BiNavigation className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
        <span>Live Route to Customer</span>
      </div>

      <MapContainer
        center={riderLocation}
        zoom={14}
        scrollWheelZoom={false}
        className="h-80 sm:h-96 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>You (Current Location)</Popup>
        </Marker>
        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Customer Delivery Location</Popup>
        </Marker>
        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;
