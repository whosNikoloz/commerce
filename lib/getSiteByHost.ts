import { headers } from "next/headers";

import { DEFAULT_SITE, SITES } from "@/config/site";

function normalizeHost(host?: string) {
  return (host ?? "").toLowerCase().replace(/:.*$/, "").replace(",", ".");
}

export function getSiteByHost(host?: string) {
  const key = normalizeHost(host);

  return SITES[key] ?? DEFAULT_SITE;
}

export async function getSiteByHostFromHeaders() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";

  return getSiteByHost(host);
}
