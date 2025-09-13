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
  const [config, setConfig] = useState<TenantConfig | null>(initialConfig);
  const [isLoading, setIsLoading] = useState(!initialConfig);
  const mounted = useRef(true);

  // Apply theme immediately on mount/updates
  useEffect(() => {
    if (config?.theme) {
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
      // If SSR provided config, we’re done.
      if (initialConfig) {
        setIsLoading(false);

        return;
      }

      // Try cache
      try {
        const raw = localStorage.getItem(CACHE_KEY);

        if (raw) {
          const parsed = JSON.parse(raw) as Cached;

          if (parsed?.v === CACHE_VERSION && parsed?.data) {
            setConfig(parsed.data);
          }
        }
      } catch {}

      // If you don’t have an endpoint yet, skip fetch:
      setIsLoading(false);

      // When your endpoint is ready, uncomment this block:
      // try {
      //   const host = window.location.host;
      //   const res = await fetch(`/api/tenant-config?host=${encodeURIComponent(host)}`, { cache: "no-store" });
      //   if (res.ok) {
      //     const fresh = (await res.json()) as TenantConfig;
      //     if (mounted.current) setConfig(fresh);
      //   }
      // } catch {}
      // finally {
      //   if (mounted.current) setIsLoading(false);
      // }
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
