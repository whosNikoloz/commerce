import type { TenantConfig } from "@/types/tenant";

import { DEFAULT_TENANT, TENANTS } from "../config/tenat";

export function getTenantByHostStatic(host: string): TenantConfig {
  return TENANTS[host] ?? DEFAULT_TENANT;
}
