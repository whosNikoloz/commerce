"use client";

import { useEffect, useState } from "react";

export interface AuthConfig {
  googleClientId: string;
  facebookClientId: string;
  basicEnabled: boolean;
  googleEnabled: boolean;
  facebookEnabled: boolean;
}

let cachedConfig: AuthConfig | null = null;
let inFlightPromise: Promise<AuthConfig> | null = null;

async function fetchAuthConfig(): Promise<AuthConfig> {
  const res = await fetch("/api/auth/oauth-config", { cache: "no-store" });
  const data = await res.json();

  const config: AuthConfig = {
    googleClientId: data.googleClientId ?? "",
    facebookClientId: data.facebookClientId ?? "",
    basicEnabled:
      typeof data.basicEnabled === "boolean" ? data.basicEnabled : true,
    googleEnabled:
      typeof data.googleEnabled === "boolean"
        ? data.googleEnabled
        : !!data.googleClientId,
    facebookEnabled:
      typeof data.facebookEnabled === "boolean"
        ? data.facebookEnabled
        : !!data.facebookClientId,
  };

  cachedConfig = config;

  return config;
}

export function useAuthConfig() {
  const [config, setConfig] = useState<AuthConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setLoading(false);

      return;
    }

    let cancelled = false;

    if (!inFlightPromise) {
      inFlightPromise = fetchAuthConfig().finally(() => {
        inFlightPromise = null;
      });
    }

    setLoading(true);

    inFlightPromise
      .then((cfg) => {
        if (cancelled) return;
        setConfig(cfg);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Failed to load auth config"));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading, error };
}

