import type { Locale as ConfigLocale } from "@/i18n.config";
import type { TenantConfig, Dictionary } from "@/types/tenant";

// Static fallback dictionaries (only used if tenant config doesn't provide them)
const STATIC_SUPPORTED = ["en", "ka"] as const;

type BaseLocale = (typeof STATIC_SUPPORTED)[number];

function normalizeLocale(l: string): string {
  return l?.split?.("-")?.[0] ?? "en";
}

// Static file loaders (fallback only)
const staticLoaders: Record<BaseLocale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ka: () => import("@/dictionaries/ka.json").then((m) => m.default),
};

/**
 * Get dictionary for a locale, prioritizing tenant config dictionaries
 * Falls back to static files if tenant config doesn't have the locale
 */
export async function getDictionary(
  locale: ConfigLocale | string,
  tenantConfig?: TenantConfig | null
): Promise<Dictionary> {
  const normalizedLocale = normalizeLocale(String(locale)).toLowerCase();

  // 1. First priority: Check tenant config dictionaries
  if (tenantConfig?.dictionaries?.[normalizedLocale]) {
    return tenantConfig.dictionaries[normalizedLocale];
  }

  // 2. Second priority: Static files (only for supported static locales)
  const staticKey = normalizedLocale as BaseLocale;

  if (STATIC_SUPPORTED.includes(staticKey) && staticLoaders[staticKey]) {
    try {
      return await staticLoaders[staticKey]();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Failed to load static dictionary for ${staticKey}:`, error);
    }
  }

  // 3. Final fallback: English (from tenant config or static)
  if (tenantConfig?.dictionaries?.["en"]) {
    return tenantConfig.dictionaries["en"];
  }

  // Last resort: static English
  return staticLoaders.en();
}
