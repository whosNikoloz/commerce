"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { LocateFixed, AlertTriangle, Globe, Layers } from "lucide-react";
import { useDictionary } from "@/app/context/dictionary-provider";

interface Location {
    lat: number;
    lng: number;
}

type MapType = "street" | "satellite";

interface AddressMapPickerProps {
    onLocationSelect: (location: Location, address?: string, metadata?: any) => void;
    initialLocation?: Location;
    height?: string;
    className?: string;
}

// Safer icon creation for Next.js
function createMarkerIcon() {
    if (typeof window === "undefined") return null;
    try {
        const L = require("leaflet");
        const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png";
        const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png";
        const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";

        return L.icon({
            iconUrl,
            iconRetinaUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
    } catch (e) {
        return null;
    }
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (location: Location, address?: string, metadata?: any) => void }) {
    const map = useMap();

    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            onLocationSelect({ lat, lng });
            map.panTo(e.latlng);

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.display_name) {
                        onLocationSelect({ lat, lng }, data.display_name, data.address);
                    }
                }
            } catch (error) {
                onLocationSelect({ lat, lng });
            }
        },
    });
    return null;
}

function MapController({ center }: { center: Location | null }) {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
            if (center) {
                map.setView([center.lat, center.lng]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [map, center]);

    return null;
}

export default function AddressMapPicker({ onLocationSelect, initialLocation, height = "400px", className }: AddressMapPickerProps) {
    const { resolvedTheme } = useTheme();
    const dict = useDictionary();
    const [mounted, setMounted] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
    const [hasTileError, setHasTileError] = useState(false);
    const [mapType, setMapType] = useState<MapType>("street");

    useEffect(() => {
        setMounted(true);
        if (!selectedLocation && !initialLocation) {
            setSelectedLocation({ lat: 41.7151, lng: 44.8271 });
        }
    }, [initialLocation]);

    const isDark = mounted && resolvedTheme === "dark";
    const markerIcon = useMemo(() => createMarkerIcon(), [mounted]);

    const tileUrl = useMemo(() => {
        if (mapType === "satellite") {
            return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        }
        return isDark
            ? "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    }, [mapType, isDark]);

    const handleSelect = (loc: Location, addr?: string) => {
        setSelectedLocation(loc);
        onLocationSelect(loc, addr);
    };

    const handleLocateMe = () => {
        if (typeof window === "undefined" || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            handleSelect(loc);
        });
    };

    if (!mounted) return (
        <div style={{ height }} className="w-full bg-slate-100 animate-pulse rounded-[2.5rem] border-2 border-dashed border-slate-300" />
    );

    return (
        <div
            className={cn("relative overflow-hidden rounded-[2.5rem] border-2 border-slate-200 dark:border-white/10 shadow-2xl bg-[#f9fafb]", className)}
            style={{ height }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container { background: #f9fafb !important; outline: 0; }
                .leaflet-tile-pane { opacity: 1 !important; }
                .leaflet-layer { z-index: 1; }
                .custom-map-control { pointer-events: auto; }
            `}} />

            <MapContainer
                key={`${isDark ? "dark" : "light"}-${mapType}`}
                center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [41.7151, 44.8271]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                className="z-0"
            >
                <TileLayer
                    url={tileUrl}
                    attribution={mapType === "satellite" ? '&copy; ESRI' : '&copy; OpenStreetMap'}
                    eventHandlers={{
                        tileerror: (e) => {
                            console.error("TILE ERROR:", e);
                            setHasTileError(true);
                        }
                    }}
                />
                <MapController center={selectedLocation} />
                <MapEvents onLocationSelect={handleSelect} />
                {selectedLocation && markerIcon && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={markerIcon} />
                )}
            </MapContainer>

            {hasTileError && (
                <div className="absolute inset-0 z-[3000] bg-white/80 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center gap-4">
                    <AlertTriangle className="h-10 w-10 text-amber-500 animate-bounce" />
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {dict?.profile?.map?.connectivityIssue || "Connectivity Issue"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                            {dict?.profile?.map?.connectivityDesc || "Some map tiles are being blocked by your browser or network."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                        >
                            {dict?.profile?.map?.retry || "Retry"}
                        </button>
                        <button
                            onClick={() => setHasTileError(false)}
                            className="px-5 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
                        >
                            {dict?.profile?.map?.dismiss || "Dismiss"}
                        </button>
                    </div>
                </div>
            )}

            {/* FLOATING CONTROLS - TOP RIGHT */}
            <div className="absolute top-6 right-6 z-[2500] flex flex-col gap-3 pointer-events-none">
                <div className="flex flex-col gap-2 custom-map-control">
                    {/* LOCATE ME BUTTON */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleLocateMe();
                        }}
                        className="w-14 h-14 bg-white/95 dark:bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all duration-300 active:scale-95 group"
                        title={dict?.profile?.map?.locateMe || "Find my location"}
                    >
                        <LocateFixed className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* SATELLITE TOGGLE BUTTON */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setMapType(mapType === "street" ? "satellite" : "street");
                        }}
                        className={cn(
                            "w-14 h-14 backdrop-blur-xl rounded-2xl shadow-2xl border transition-all duration-300 active:scale-95 group flex items-center justify-center",
                            mapType === "satellite"
                                ? "bg-brand-primary text-white border-brand-primary"
                                : "bg-white/95 dark:bg-black/90 border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-brand-primary hover:text-white"
                        )}
                        title={mapType === "street" ? (dict?.profile?.map?.switchToSatellite || "Switch to Satellite") : (dict?.profile?.map?.switchToStreet || "Switch to Street View")}
                    >
                        {mapType === "street" ? <Globe className="h-6 w-6 group-hover:scale-110 transition-transform" /> : <Layers className="h-6 w-6 group-hover:scale-110 transition-transform" />}
                    </button>
                </div>
            </div>

            {/* HELP BANNER - TOP LEFT (Next to Zoom) */}
            <div className="absolute top-6 left-16 z-[2500] pointer-events-none hidden md:block">
                <div className="bg-white/95 dark:bg-black/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">
                        {dict?.profile?.map?.clickMap || "Click map to set address"}
                    </span>
                </div>
            </div>
        </div>
    );
}
