import type { Locale as ConfigLocale } from "@/i18n.config";
import type { TenantConfig, Dictionary } from "@/types/tenant";

// Static fallback dictionaries (always loaded as base)
const STATIC_SUPPORTED = ["en", "ka"] as const;

type BaseLocale = (typeof STATIC_SUPPORTED)[number];

function normalizeLocale(l: string): string {
  return l?.split?.("-")?.[0] ?? "en";
}

// Static file loaders
const staticLoaders: Record<BaseLocale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ka: () => import("@/dictionaries/ka.json").then((m) => m.default),
};

/**
 * Deep merge two objects - source overrides target
 */
function deepMerge(target: any, source: any): any {
  if (!source) return target;
  if (!target) return source;

  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Get dictionary for a locale
 * Merges tenant config dictionaries with static files (tenant takes priority)
 */
export async function getDictionary(
  locale: ConfigLocale | string,
  tenantConfig?: TenantConfig | null
): Promise<Dictionary> {
  const normalizedLocale = normalizeLocale(String(locale)).toLowerCase();
  const staticKey = normalizedLocale as BaseLocale;

  // 1. Load static dictionary as base (if available for this locale)
  let baseDictionary: Dictionary = {};

  if (STATIC_SUPPORTED.includes(staticKey) && staticLoaders[staticKey]) {
    try {
      baseDictionary = await staticLoaders[staticKey]();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Failed to load static dictionary for ${staticKey}:`, error);
      // Try English as fallback base
      try {
        baseDictionary = await staticLoaders.en();
      } catch {
        baseDictionary = {};
      }
    }
  } else {
    // Locale not in static files, use English as base
    try {
      baseDictionary = await staticLoaders.en();
    } catch {
      baseDictionary = {};
    }
  }

  // 2. Merge tenant dictionary on top (if available)
  const tenantDictionary = tenantConfig?.dictionaries?.[normalizedLocale];

  if (tenantDictionary && Object.keys(tenantDictionary).length > 0) {
    return deepMerge(baseDictionary, tenantDictionary);
  }

  return baseDictionary;
}
