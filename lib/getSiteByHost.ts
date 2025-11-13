import type { SiteConfig } from "@/types/tenant";

import { headers } from "next/headers";

import { getTenantByHost } from "./getTenantByHost";

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export async function getSiteByHost(host?: string): Promise<SiteConfig> {
  const key = normalizeHost(host);
  const tenant = await getTenantByHost(key);

  return tenant.siteConfig;
}

export async function getSiteByHostFromHeaders(): Promise<SiteConfig> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";

  return getSiteByHost(host);
}
