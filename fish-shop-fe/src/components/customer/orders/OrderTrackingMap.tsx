"use client";

import { useEffect, useRef, useState } from "react";

type OrderTrackingMapProps = {
  orderCode: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
};

export default function OrderTrackingMap({
  orderCode,
  status,
  latitude,
  longitude,
}: OrderTrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Shop location (Lim, Bac Ninh)
  const shopCoord: [number, number] = [21.1442, 105.9926];

  // Customer location (from props, or fallback to Hanoi Center)
  const custCoord: [number, number] =
    latitude && longitude ? [Number(latitude), Number(longitude)] : [21.0285, 105.8542];

  const isCompleted = status === "COMPLETED";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Inject Leaflet CSS dynamically
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = async () => {
      const L = await import("leaflet");

      // Clear previous map if any
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Configure map options based on status
      const mapOptions = isCompleted
        ? {
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
          }
        : {};

      if (!containerRef.current) return;

      // Initialize map
      const map = L.map(containerRef.current, {
        ...mapOptions,
        center: isCompleted ? custCoord : shopCoord,
        zoom: isCompleted ? 15 : 12,
      });

      mapRef.current = map;

      // Add OpenStreetMap tiles (premium styling using CartoDB Positron / Voyage for modern look)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Custom div icons using Tailwind css
      const shopIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-[#005B71] border-2 border-white flex items-center justify-center text-white shadow-md text-sm font-bold">🐟</div>`,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const custIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white shadow-md text-sm font-bold">🏠</div>`,
        className: "custom-leaflet-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const shipperIcon = L.divIcon({
        html: `<div class="w-8.5 h-8.5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md text-sm font-bold animate-bounce">🛵</div>`,
        className: "custom-leaflet-icon",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const completedIcon = L.divIcon({
        html: `<div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-lg text-lg font-bold animate-pulse">🎁</div>`,
        className: "custom-leaflet-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (isCompleted) {
        // Only show single merged marker at customer location
        L.marker(custCoord, { icon: completedIcon })
          .addTo(map)
          .bindPopup("<b>Đơn hàng đã giao thành công!</b>")
          .openPopup();
      } else {
        // Active delivery: two markers + polyline route + shipper
        L.marker(shopCoord, { icon: shopIcon })
          .addTo(map)
          .bindPopup("<b>Trại cá Cảnh FishSync</b><br/>Địa chỉ lấy hàng");

        L.marker(custCoord, { icon: custIcon })
          .addTo(map)
          .bindPopup("<b>Địa chỉ của bạn</b><br/>Điểm giao hàng");

        // Intermediate point for shipper location (65% of the way)
        const shipLat = shopCoord[0] + (custCoord[0] - shopCoord[0]) * 0.65;
        const shipLng = shopCoord[1] + (custCoord[1] - shopCoord[1]) * 0.65;
        const shipCoord: [number, number] = [shipLat, shipLng];

        L.marker(shipCoord, { icon: shipperIcon })
          .addTo(map)
          .bindPopup("<b>Shipper đang di chuyển</b><br/>Đang giao hàng...");

        // Polyline connecting points
        const routePoints = [shopCoord, shipCoord, custCoord];
        L.polyline(routePoints, {
          color: "#005B71",
          weight: 4,
          opacity: 0.8,
          dashArray: "8, 8",
        }).addTo(map);

        // Fit bounds to show the entire route
        const bounds = L.latLngBounds([shopCoord, custCoord]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted, status, latitude, longitude]);

  if (!mounted) return null;

  return (
    <div className="space-y-3 mt-4">
      {isCompleted ? (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-sm px-4 py-3 flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
          <span className="material-symbols-outlined text-xl">verified</span>
          <span className="font-semibold">🎉 Đơn hàng đã được giao thành công.</span>
        </div>
      ) : (
        <div className="rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 text-sm px-4 py-3 flex items-center gap-2 border border-sky-100 dark:border-sky-900/30">
          <span className="material-symbols-outlined text-xl animate-spin text-sky-500">progress_activity</span>
          <span className="font-semibold">Đơn hàng đang được vận chuyển. Theo dõi hành trình shipper:</span>
        </div>
      )}

      <div
        className={`w-full rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-inner transition-all duration-300 ${
          isCompleted ? "h-48" : "h-96"
        }`}
      >
        <div ref={containerRef} className="w-full h-full z-0" />
      </div>
    </div>
  );
}
