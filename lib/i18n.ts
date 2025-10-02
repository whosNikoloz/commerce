import type { Locale, LocalizedText, LocalizedRich } from "@/types/tenant";

/**
 * Helper to extract localized text based on current locale
 */
export function t(field: LocalizedText | LocalizedRich, locale: Locale): string {
  return field[locale] || field.en;
}

/**
 * Helper to extract localized text from optional field
 */
export function tOpt(
  field: LocalizedText | LocalizedRich | undefined,
  locale: Locale
): string | undefined {
  if (!field) return undefined;
  return field[locale] || field.en;
}

/**
 * Helper to get localized array
 */
export function tArray(
  fields: (LocalizedText | LocalizedRich)[],
  locale: Locale
): string[] {
  return fields.map((field) => t(field, locale));
}