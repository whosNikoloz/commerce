import { headers } from "next/headers";

import { DEFAULT_TENANT, TENANTS } from "@/config/tenat";
import type { SiteConfig } from "@/types/tenant";

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export function getSiteByHost(host?: string): SiteConfig {
  const key = normalizeHost(host);
  const tenant = TENANTS[key] ?? DEFAULT_TENANT;

  return tenant.siteConfig;
}

export async function getSiteByHostFromHeaders(): Promise<SiteConfig> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";

  return getSiteByHost(host);
}
