import type { TenantConfig } from "@/types/tenant";

import { getTenantByHostApi } from "@/app/api/services/tenantService";

export async function getTenantByHost(host: string): Promise<TenantConfig> {
  const cleanHost = host.replace(/^www\./, "").toLowerCase();

  try {
    // eslint-disable-next-line no-console
    //console.log(`🔍 Fetching tenant config for host: ${cleanHost}`);

    const cfg = await getTenantByHostApi();

    if (!cfg || !cfg.siteConfig) {
      // eslint-disable-next-line no-console
      console.error(`❌ Invalid tenant config received from API for ${cleanHost}:`, cfg);
      throw new Error(`Failed to load tenant configuration for ${cleanHost}: Invalid response structure`);
    }

    // eslint-disable-next-line no-console
    //console.log(`✅ Tenant config loaded from API for ${cleanHost}:`, cfg.siteConfig.name);
    return cfg;
  } catch (error) {
    // Provide more context about the error
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's an environment variable issue
    if (errorMessage.includes("NEXT_PUBLIC_API_URL")) {
      throw new Error(
        `Configuration error: ${errorMessage}. Please check your Vercel environment variables.`
      );
    }
    
    // Check if it's a network/API issue
    if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("ECONNREFUSED")) {
      throw new Error(
        `Failed to connect to API server. Please verify that NEXT_PUBLIC_API_URL is correct and the API is accessible. Original error: ${errorMessage}`
      );
    }
    
    // Re-throw with additional context
    throw new Error(
      `Failed to load tenant configuration for ${cleanHost}: ${errorMessage}`
    );
  }
}