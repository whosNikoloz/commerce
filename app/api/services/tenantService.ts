import type { TenantConfig } from "@/types/tenant";

import { apiFetch } from "@/app/api/client/fetcher";

function getApiBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL environment variable is not set. Please configure it in your Vercel project settings."
    );
  }

  // Ensure the URL ends with a slash
  const normalizedUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  
  return `${normalizedUrl}Tenant`;
}

export async function getTenantByHostApi(): Promise<TenantConfig> {
  try {
    const API_BASE = getApiBase();

    return await apiFetch<TenantConfig>(`${API_BASE}/tenant-configuration`, {
      cache: "no-store",
    });
  } catch (error) {
    // Log more details in production for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Failed to fetch tenant configuration:", {
      error: errorMessage,
      apiUrl: process.env.NEXT_PUBLIC_API_URL ? "Set" : "Missing",
      url: process.env.NEXT_PUBLIC_API_URL,
    });
    throw error;
  }
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
