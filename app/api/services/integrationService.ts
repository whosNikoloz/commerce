import { apiFetch } from "../client/fetcher";

const INTEGRATION_API_BASE = process.env.NEXT_PUBLIC_API_URL + "api/Integration";
const FINA_STATUS_CACHE_KEY = "fina_integration_status";

export enum IntegrationType {
  Fina = 1,
}

export interface IntegrationStatus {
  integrationType: IntegrationType;
  isEnabled: boolean;
}

/**
 * Get integration status
 * @param integrationType - The type of integration to check (e.g., IntegrationType.Fina = 10)
 */
export async function getIntegrationStatus(
  integrationType: IntegrationType
): Promise<IntegrationStatus> {
  return apiFetch<IntegrationStatus>(
    `${INTEGRATION_API_BASE}/status?integrationType=${integrationType}`,
    {
      requireAuth: true,
      failIfUnauthenticated: false,
    }
  );
}

/**
 * Check if the merchant is a custom merchant (not using Fina integration)
 */
export async function isCustomMerchant(): Promise<boolean> {
  try {
    const status = await getIntegrationStatus(IntegrationType.Fina);

    // Cache the result for sync access
    if (typeof window !== "undefined") {
      localStorage.setItem(FINA_STATUS_CACHE_KEY, status.isEnabled ? "FINA" : "CUSTOM");
    }

    // If Fina integration is OFF, it's a custom merchant
    return !status.isEnabled;
  } catch {
    // If we can't check, assume not custom (safer default)
    return false;
  }
}

/**
 * Check if Fina integration is enabled (async with caching)
 */
export async function isFinaIntegrationEnabled(): Promise<boolean> {
  try {
    const status = await getIntegrationStatus(IntegrationType.Fina);

    // Cache the result for sync access
    if (typeof window !== "undefined") {
      localStorage.setItem(FINA_STATUS_CACHE_KEY, status.isEnabled ? "FINA" : "CUSTOM");
    }

    return status.isEnabled;
  } catch {
    return false;
  }
}

/**
 * Get cached merchant type synchronously (for use in places that can't be async)
 * Returns "FINA" or "CUSTOM" or null if not yet cached
 * Call isFinaIntegrationEnabled() or isCustomMerchant() first to populate the cache
 */
export function getCachedMerchantType(): "FINA" | "CUSTOM" | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(FINA_STATUS_CACHE_KEY);

  if (cached === "FINA" || cached === "CUSTOM") {
    return cached;
  }

  return null;
}

/**
 * Initialize integration cache - call this early in app lifecycle
 * This populates the cache so getCachedMerchantType() can be used synchronously
 */
export async function initializeIntegrationCache(): Promise<void> {
  await isFinaIntegrationEnabled();
}
