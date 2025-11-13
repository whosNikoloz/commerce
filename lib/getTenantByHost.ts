import type { TenantConfig } from "@/types/tenant";

import { getTenantByHostApi } from "@/app/api/services/tenantService";

export async function getTenantByHost(host: string): Promise<TenantConfig> {
  const cleanHost = host.replace(/^www\./, "").toLowerCase();

  // eslint-disable-next-line no-console
  //console.log(`🔍 Fetching tenant config for host: ${cleanHost}`);

  const cfg = await getTenantByHostApi();

  if (!cfg || !cfg.siteConfig) {
    // eslint-disable-next-line no-console
    console.error(`❌ Invalid tenant config received from API for ${cleanHost}:`, cfg);
    throw new Error(`Failed to load tenant configuration for ${cleanHost}`);
  }

  // eslint-disable-next-line no-console
  //console.log(`✅ Tenant config loaded from API for ${cleanHost}:`, cfg.siteConfig.name);
  return cfg;
}