// Static locales for routing (fallback when tenant config is not available)
export const locales = ["en", "ka"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ka";

/**
 * Get locales from tenant config if available, otherwise use static locales
 * This allows dynamic language support from tenant configuration
 */
export function getLocales(tenantConfig?: { siteConfig?: { locales?: string[] } } | null): string[] {
  return tenantConfig?.siteConfig?.locales || [...locales];
}

/**
 * Get default locale from tenant config if available, otherwise use static default
 */
export function getDefaultLocale(tenantConfig?: { siteConfig?: { localeDefault?: string } } | null): string {
  return tenantConfig?.siteConfig?.localeDefault || defaultLocale;
}
