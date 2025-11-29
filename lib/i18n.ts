import type { LocalizedText, LocalizedRich } from "@/types/tenant";

/**
 * Helper to extract localized text based on current locale
 * Supports dynamic locales from tenant config (e.g., "en", "ka", "de", "uz", "ru")
 * Falls back to "en" if locale not found
 */
export function t(field: LocalizedText | LocalizedRich, locale: string): string {
  // Try current locale first
  if (field[locale]) {
    return field[locale];
  }
  
  // Fallback to English
  if (field.en) {
    return field.en;
  }
  
  // Last resort: return first available value
  const firstKey = Object.keys(field)[0];
  return firstKey ? field[firstKey] : "";
}

/**
 * Helper to extract localized text from optional field
 * Supports dynamic locales from tenant config
 */
export function tOpt(
  field: LocalizedText | LocalizedRich | undefined,
  locale: string
): string | undefined {
  if (!field) return undefined;

  return t(field, locale) || undefined;
}

/**
 * Helper to get localized array
 * Supports dynamic locales from tenant config
 */
export function tArray(
  fields: (LocalizedText | LocalizedRich)[],
  locale: string
): string[] {
  return fields.map((field) => t(field, locale));
}