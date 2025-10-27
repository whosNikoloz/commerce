"use client";
import type { TenantConfig } from "@/types/tenant";

import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";

import { applyThemeOnDocument } from "@/lib/applyTheme";

type TenantContextType = {
  config: TenantConfig | null;
  isLoading: boolean;
  refresh: () => Promise<boolean>;
};

const TenantContext = createContext<TenantContextType>({
  config: null,
  isLoading: true,
  refresh: async () => false,
});

export const useTenant = () => useContext(TenantContext);

const CACHE_KEY = "tenantConfig";
const CACHE_VERSION = 1;

type Cached = { v: number; data: TenantConfig };

export const TenantProvider: React.FC<{
  children: React.ReactNode;
  initialConfig?: TenantConfig | null;
}> = ({ children, initialConfig = null }) => {
  //console.log("🔧 TenantProvider initialized with:", initialConfig ? `${initialConfig.siteConfig.name}` : "null");
  const [config, setConfig] = useState<TenantConfig | null>(initialConfig);
  const [isLoading, setIsLoading] = useState(!initialConfig);
  const mounted = useRef(true);

  // Apply theme immediately on mount/updates
  useEffect(() => {
    if (config?.theme) {
      //console.log("🎨 Applying theme for:", config.siteConfig.name);
      applyThemeOnDocument(config.theme);
      try {
        const payload: Cached = { v: CACHE_VERSION, data: config };

        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch {}
    }
  }, [config]);

  // On first client load: use cache (if no SSR config), then optionally fetch (when API exists)
  useEffect(() => {
    mounted.current = true;

    const boot = async () => {
      // If SSR provided config, we're done.
      if (initialConfig) {
        //console.log("✅ Using SSR config, skipping client fetch:", initialConfig.siteConfig.name);
        setIsLoading(false);

        return;
      }

      //console.log("⚠️ No SSR config, attempting client-side fetch...");

      // Try cache
      try {
        const raw = localStorage.getItem(CACHE_KEY);

        if (raw) {
          const parsed = JSON.parse(raw) as Cached;

          if (parsed?.v === CACHE_VERSION && parsed?.data) {
            //console.log("📦 Loaded cached config:", parsed.data.siteConfig.name);
            setConfig(parsed.data);
          } else {
            //console.log("🗑️ Clearing invalid/old cache");
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch {}

      // If you don't have an endpoint yet, skip fetch:
      setIsLoading(false);

      //When your endpoint is ready, uncomment this block:
      try {
        const host = window.location.host;
        //console.log("🌐 Fetching tenant config from /api/tenant-config for:", host);
        const res = await fetch(`/api/tenant-config?host=${encodeURIComponent(host)}`, { cache: "no-store" });

        if (res.ok) {
          const fresh = (await res.json()) as TenantConfig;

          //console.log("🔄 Updating config from client fetch:", fresh.siteConfig.name);
          if (mounted.current) setConfig(fresh);
        } else {
          console.error("❌ Failed to fetch tenant config:", res.status);
        }
      } catch (e) {
        console.error("❌ Error fetching tenant config:", e);
      }
      finally {
        if (mounted.current) setIsLoading(false);
      }
    };

    boot();

    return () => {
      mounted.current = false;
    };
  }, [initialConfig]); // <- only depends on initialConfig

  const refresh = async () => {
    try {
      const host = window.location.host;
      const res = await fetch(`/api/tenant-config?host=${encodeURIComponent(host)}`, {
        cache: "no-store",
      });

      if (!res.ok) return false;
      const fresh = (await res.json()) as TenantConfig;

      if (mounted.current) setConfig(fresh);

      return true;
    } catch {
      return false;
    }
  };

  const value = useMemo(
    () => ({
      config,
      isLoading,
      refresh,
    }),
    [config, isLoading],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};
