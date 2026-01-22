import type { Locale as ConfigLocale } from "@/i18n.config";
import type { TenantConfig, Dictionary } from "@/types/tenant";

// Static fallback dictionaries (always loaded as base)
const STATIC_SUPPORTED = ["en", "ka"] as const;

type BaseLocale = (typeof STATIC_SUPPORTED)[number];
export type DictionaryType = "storefront" | "admin";

function normalizeLocale(l: string): string {
  return l?.split?.("-")?.[0] ?? "en";
}

// Static file loaders for Storefront
const storefrontLoaders: Record<BaseLocale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/storefront/en.json").then((m) => m.default),
  ka: () => import("@/dictionaries/storefront/ka.json").then((m) => m.default),
};

// Static file loaders for Admin
const adminLoaders: Record<BaseLocale, () => Promise<Dictionary>> = {
  en: () => import("@/dictionaries/admin/en.json").then((m) => m.default),
  ka: () => import("@/dictionaries/admin/ka.json").then((m) => m.default),
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
 * Merges tenant config dictionaries with static files (tenant takes priority for storefront)
 */
export async function getDictionary(
  locale: ConfigLocale | string,
  tenantConfig?: TenantConfig | null,
  type: DictionaryType = "storefront"
): Promise<Dictionary> {
  const normalizedLocale = normalizeLocale(String(locale)).toLowerCase();
  const staticKey = normalizedLocale as BaseLocale;

  // Select appropriate loaders based on type
  const loadMap = type === "admin" ? adminLoaders : storefrontLoaders;

  // 1. Load static dictionary as base (if available for this locale)
  let baseDictionary: Dictionary = {};

  if (STATIC_SUPPORTED.includes(staticKey) && loadMap[staticKey]) {
    try {
      baseDictionary = await loadMap[staticKey]();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Failed to load static ${type} dictionary for ${staticKey}:`, error);
      // Try English as fallback base
      try {
        baseDictionary = await loadMap.en();
      } catch {
        baseDictionary = {};
      }
    }
  } else {
    // Locale not in static files, use English as base
    try {
      baseDictionary = await loadMap.en();
    } catch {
      baseDictionary = {};
    }
  }

  // 2. Merge tenant dictionary on top (Only for storefront)
  // Admin panel should generally NOT respect tenant overrides for its own interface strings,
  // unless explicitly requested. The user requested static admin translations.
  if (type === "storefront") {
    const tenantDictionary = tenantConfig?.dictionaries?.[normalizedLocale];

    if (tenantDictionary && Object.keys(tenantDictionary).length > 0) {
      return deepMerge(baseDictionary, tenantDictionary);
    }
  }

  return baseDictionary;
}
