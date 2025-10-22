import type { TenantConfig } from "@/types/tenant";

import { apiFetch } from "@/app/api/client/fetcher";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}Tenant`;

export async function getTenantByHostApi(): Promise<TenantConfig> {
  return apiFetch<TenantConfig>(`${API_BASE}/tenant-configuration`, {
    cache: "no-store",
  }); 
}

// export async function getTenantById(id: string): Promise<TenantConfig> {
//   return apiFetch<TenantConfig>(`${API_BASE}/by-id/${encodeURIComponent(id)}`, {
//     cache: "no-store",
//   });
// }

// export async function listTenants(): Promise<TenantConfig[]> {
//   return apiFetch<TenantConfig[]>(`${API_BASE}/list`, { cache: "no-store" });
// }

// export async function createTenant(data: TenantConfig): Promise<string> {
//   return apiFetch<string>(`${API_BASE}/create`, {
//     method: "POST",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function updateTenant(data: TenantConfig): Promise<string> {
//   return apiFetch<string>(`${API_BASE}/update`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function deleteTenant(id: string): Promise<string> {
//   return apiFetch<string>(`${API_BASE}/delete/${encodeURIComponent(id)}`, {
//     method: "DELETE",
//   });
// }
