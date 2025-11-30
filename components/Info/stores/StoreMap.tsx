"use client";

import type * as L from "leaflet";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";

import CtrlToZoom from "./CtrlToZoom";

import { cn } from "@/lib/utils"; // or replace with simple class merge

// Default Leaflet marker icons
const ICONS = {
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
};

function createDefaultIcon() {
  const L = require("leaflet") as typeof import("leaflet");

  return L.icon({
    iconUrl: ICONS.iconUrl,
    iconRetinaUrl: ICONS.iconRetinaUrl,
    shadowUrl: ICONS.shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export type StoreForMap = {
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  hours: string;
  isMain?: boolean;
};

export default function StoreMap({
  stores,
  height = 380,
  className,
}: {
  stores: StoreForMap[];
  height?: number;
  className?: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  // ✅ theme awareness
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  // Carto basemaps (light/dark) + proper attribution
  const tile = isDark
    ? {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    : {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      };

  const center = useMemo<[number, number]>(() => {
    const main = stores.find((s) => s.isMain) || stores[0];

    return [main.lat, main.lng];
  }, [stores]);

  const markerIcon = useMemo(createDefaultIcon, []);

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        setUserPos(p);
        mapRef.current!.setView(p, 13);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border",
        // small background behind tiles to match theme
        isDark ? "bg-slate-900" : "bg-white",
        className,
      )}
    >
      <div className="absolute left-3 ml-10 top-3 z-[1000] flex gap-2">
        <button className="font-primary rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium shadow hover:bg-white dark:bg-slate-800/90 dark:text-slate-100"
          title="ჩემი მდებარეობა"
          onClick={locateMe}
        >
          ჩემი მდებარეობა
        </button>
      </div>

      <div style={{ height }}>
        <MapContainer
          ref={(map) => {
            mapRef.current = map;
          }}
          center={center}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          zoom={12}
        >
          <CtrlToZoom />
          {/* 🔄 remount TileLayer when theme flips */}
          <TileLayer
            key={isDark ? "dark" : "light"}
            attribution={tile.attribution}
            url={tile.url}
          />

          {stores.map((s, i) => (
            <Marker key={`${s.name}-${i}`} icon={markerIcon} position={[s.lat, s.lng]}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <strong>{s.name}</strong>
                  <div>{s.address}</div>
                  <div>
                    ტელ: <a href={`tel:${s.phone.replace(/\s+/g, "")}`}>{s.phone}</a>
                  </div>
                  <div>გრაფიკი: {s.hours}</div>
                  <a className="font-primary text-blue-600 underline dark:text-blue-400"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.lat},${s.lng}`)}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    რუკაზე გახსნა
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {userPos && (
            <Marker icon={markerIcon} position={userPos}>
              <Popup>თქვენი მდებარეობა</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
