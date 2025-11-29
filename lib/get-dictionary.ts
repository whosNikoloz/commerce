import type { Locale } from "@/i18n.config";
import type { TenantConfig } from "@/types/tenant";

import { getDictionary } from "@/lib/dictionaries";

/**
 * Get translations for a locale, using tenant config dictionaries if available
 * Falls back to static files if tenant config doesn't provide dictionaries
 */
export async function getTranslations(
  lang: Locale | string,
  tenantConfig?: TenantConfig | null
) {
  try {
    const dictionary = await getDictionary(lang, tenantConfig);

    return dictionary;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to load translations for", lang, error);

    // fallback to English dictionary
    const fallback = await getDictionary("en", tenantConfig);

    return fallback;
  }
}
