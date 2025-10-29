import { apiFetch } from "../client/fetcher";

import { FinaSyncStatus } from "@/types/fina";
import { DetailedSyncResult } from "@/types/sync";

const API_FINA_BASE = process.env.NEXT_PUBLIC_API_URL + "api/FinaSync";
const API_FINA_BASE_AUTH = process.env.NEXT_PUBLIC_API_URL + "api";

export type SyncOk = void | unknown;

export interface FinaAuthResponse {
  token: string;
  expires?: string;
}

export async function finaAuthenticate(): Promise<FinaAuthResponse> {
  const response = await apiFetch<FinaAuthResponse>(`${API_FINA_BASE_AUTH}/FinaAuthentication/authenticate`, {
    method: "POST",
    body: "",
  });

  // Immediately fail if token is null or undefined
  if (!response || !response.token) {
    console.error("❌ Fina Authentication failed: Token is null or undefined", response);
    throw new Error("Authentication failed: No valid token received from Fina");
  }

  console.log("✅ Fina Authentication successful:", {
    tokenReceived: true,
    expires: response.expires
  });

  return response;
}

export async function syncAll(): Promise<DetailedSyncResult> {
  const response = await apiFetch<any>(`${API_FINA_BASE}/sync-all`, {
    method: "POST",
    body: "",
  });

  return {
    success: response.message?.includes("success") || response.successCount > 0,
    successCount: response.successCount || 0,
    failureCount: response.failureCount || 0,
    processedItems: response.processedItems || 0,
    errors: response.errors || [],
    addedCount: response.addedCount || 0,
    updatedCount: response.updatedCount || 0,
    unchangedCount: response.unchangedCount || 0,
    productChanges: response.productChanges || [],
  };
}

export async function syncProduct(finaProductId: number): Promise<SyncOk> {
  if (!Number.isFinite(finaProductId)) throw new Error("finaProductId must be a number");

  return apiFetch<SyncOk>(`${API_FINA_BASE}/sync-product/${finaProductId}`, {
    method: "POST",
    body: "",
  });
}

export async function syncCharacteristics(): Promise<SyncOk> {
  return apiFetch<SyncOk>(`${API_FINA_BASE}/sync-characteristics`, {
    method: "POST",
    body: "",
  });
}

export async function fullSync(): Promise<SyncOk> {
  return apiFetch<SyncOk>(`${API_FINA_BASE}/full-sync`, {
    method: "POST",
    body: "",
  });
}

export async function getFinaSyncStatus(): Promise<FinaSyncStatus> {
  return apiFetch<FinaSyncStatus>(`${API_FINA_BASE}/status`, {
    method: "GET",
  });
}
