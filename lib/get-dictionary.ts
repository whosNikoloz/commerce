import type { Locale } from "@/i18n.config";

import { getDictionary } from "@/lib/dictionaries";

export async function getTranslations(lang: Locale) {
  try {
    const dictionary = await getDictionary(lang);

    return dictionary;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to load translations for", lang, error);

    // fallback to English dictionary
    const fallback = await getDictionary("en");

    return fallback;
  }
}
