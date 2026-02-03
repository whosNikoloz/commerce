import { getFinaSyncStatus } from "./syncService";

import { apiFetch } from "@/app/api/client/fetcher";
import { PaymentType } from "@/types/payment";

const INTEGRATION_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "api/Integration/";

const MERCHANT_TYPE_KEY = "merchantType";
const CUSTOM_MERCHANT_KEY = "isCustomMerchant";

export enum IntegrationType {
  Fina = "FINA",
  TBC = 10,
  BOG = 11,
  TBCSplitPay = 12,
  Flitt = 13,
  TBCInstallment = 20,
  BOGInstallment = 21,
}

export interface IntegrationConfigurationItem {
  key: string;
  value: string;
  isSecret: boolean;
}

export interface IntegrationStatus {
  id: string;
  tenantId: string;
  integrationType: number;
  integrationTypeName: string;
  category: string;
  isEnabled: boolean;
  isPrimary: boolean;
  autoSyncOrders: boolean;
  autoSyncPayments: boolean;
  configuration: IntegrationConfigurationItem[];
}

interface IntegrationStatusesResponse {
  integrations: IntegrationStatus[];
}

// Map backend integrationType IDs to frontend PaymentType enum
const integrationTypeToPaymentType: Record<number, PaymentType> = {
  10: PaymentType.TBC,
  11: PaymentType.BOG,
  12: PaymentType.TBCSplitPay,
  13: PaymentType.Flitt,
  20: PaymentType.FlittInstallment,
  21: PaymentType.BOGInstallment,
};

export async function getIntegrationStatuses(): Promise<IntegrationStatus[]> {
  const url = `${INTEGRATION_BASE}statuses`;

  const res = await apiFetch<IntegrationStatusesResponse>(url, {
    method: "GET",
    requireAuth: true,
    failIfUnauthenticated: true,
    cache: "no-store",
  } as any);

  return res.integrations || [];
}

/**
 * Get a simple status object for a given integration type.
 * For Fina, this uses the FinaSync status endpoint instead of Integration/status.
 */
export async function getIntegrationStatus(
  integrationType: IntegrationType,
): Promise<{ isEnabled: boolean; integration?: IntegrationStatus | null }> {
  // Special handling for Fina integration
  if (integrationType === IntegrationType.Fina) {
    try {
      return { isEnabled: false, integration: null };

      await getFinaSyncStatus();

      return { isEnabled: true, integration: null };
    } catch {
      return { isEnabled: false, integration: null };
    }
  }

  const numericType = integrationType as unknown as number;
  const integrations = await getIntegrationStatuses();
  const integration = integrations.find((i) => i.integrationType === numericType) ?? null;

  return {
    isEnabled: !!integration?.isEnabled,
    integration,
  };
}

/**
 * Get enabled payment-related PaymentType values for the current tenant
 * based on /api/Integration/statuses.
 */
export async function getEnabledPaymentTypes(): Promise<PaymentType[]> {
  const integrations = await getIntegrationStatuses();

  const enabled = integrations.filter((i) => i.isEnabled);

  const types = new Set<PaymentType>();

  for (const integ of enabled) {
    const mapped = integrationTypeToPaymentType[integ.integrationType];

    if (mapped !== undefined) {
      types.add(mapped);
    }
  }

  return Array.from(types);
}

/**
 * Initialize cached integration/merchant info on first client load.
 * Called from TenantProvider.
 */
export async function initializeIntegrationCache(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const finaStatus = await getIntegrationStatus(IntegrationType.Fina);
    const merchantType = finaStatus.isEnabled ? "FINA" : "CUSTOM";

    window.localStorage.setItem(MERCHANT_TYPE_KEY, merchantType);
    window.localStorage.setItem(CUSTOM_MERCHANT_KEY, finaStatus.isEnabled ? "false" : "true");
  } catch {
    // Swallow errors; fall back to defaults in getters
  }
}

/**
 * Returns true when this tenant behaves as a "custom merchant"
 * (i.e. Fina integration is not enabled).
 */
export async function isCustomMerchant(): Promise<boolean> {
  try {
    const status = await getIntegrationStatus(IntegrationType.Fina);
    const custom = !status.isEnabled;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(CUSTOM_MERCHANT_KEY, custom ? "true" : "false");
      window.localStorage.setItem(MERCHANT_TYPE_KEY, custom ? "CUSTOM" : "FINA");
    }

    return custom;
  } catch {
    return true;
  }
}

/**
 * Read merchant type from localStorage without making network calls.
 * Used in hot paths like cart/product operations.
 */
export function getCachedMerchantType(): string | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(MERCHANT_TYPE_KEY);

  if (stored) return stored;

  // Default to CUSTOM if nothing is cached
  return "CUSTOM";
}
