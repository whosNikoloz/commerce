/**
 * Get display name for a language code
 */
export function getLanguageName(locale: string): string {
  const names: Record<string, string> = {
    en: "English",
    ka: "ქართული",
    uz: "O'zbek",
    ru: "Русский",
    tr: "Türkçe",
    az: "Azərbaycan",
    hy: "Հայերեն",
    ar: "العربية",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
    it: "Italiano",
    pt: "Português",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
  };

  return names[locale.toLowerCase()] || locale.toUpperCase();
}

/**
 * Get language icon component name (for known languages)
 */
export function getLanguageIconName(locale: string): "en" | "ka" | null {
  const normalized = locale.toLowerCase();

  if (normalized === "en") return "en";
  if (normalized === "ka") return "ka";

  return null;
}

/**
 * Get emoji flag for a language code
 */
export function getLanguageEmoji(locale: string): string {
  const emojis: Record<string, string> = {
    en: "🇬🇧",
    ka: "🇬🇪",
    uz: "🇺🇿",
    ru: "🇷🇺",
    tr: "🇹🇷",
    az: "🇦🇿",
    hy: "🇦🇲",
    ar: "🇸🇦",
    fr: "🇫🇷",
    de: "🇩🇪",
    es: "🇪🇸",
    it: "🇮🇹",
    pt: "🇵🇹",
    zh: "🇨🇳",
    ja: "🇯🇵",
    ko: "🇰🇷",
  };

  return emojis[locale.toLowerCase()] || "🌐";
}

