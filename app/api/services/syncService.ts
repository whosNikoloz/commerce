import { FinaSyncStatus } from "@/types/fina";
import { apiFetch } from "../client/fetcher";

const API_FINA_BASE = process.env.NEXT_PUBLIC_API_URL + "api/FinaSync";

export type SyncOk = void | unknown;

export async function syncAll(): Promise<SyncOk> {
    return apiFetch<SyncOk>(`${API_FINA_BASE}/sync-all`, {
        method: "POST",
        body: ""
    });
}

export async function syncProduct(finaProductId: number): Promise<SyncOk> {
    if (!Number.isFinite(finaProductId)) throw new Error("finaProductId must be a number");
    return apiFetch<SyncOk>(`${API_FINA_BASE}/sync-product/${finaProductId}`, {
        method: "POST",
        body: ""
    });
}

export async function syncCharacteristics(): Promise<SyncOk> {
    return apiFetch<SyncOk>(`${API_FINA_BASE}/sync-characteristics`, {
        method: "POST",
        body: ""
    });
}

export async function fullSync(): Promise<SyncOk> {
    return apiFetch<SyncOk>(`${API_FINA_BASE}/full-sync`, {
        method: "POST",
        body: ""
    });
}

export async function getFinaSyncStatus(): Promise<FinaSyncStatus> {
    return apiFetch<FinaSyncStatus>(`${API_FINA_BASE}/status`, {
        method: "GET"
    });
}