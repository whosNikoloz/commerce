import { locales, type Locale, defaultLocale } from "@/i18n.config";

export const isLocale = (v: string): v is Locale =>
  (locales as readonly string[]).includes(v as Locale);

export const toLocale = (v: string): Locale => (isLocale(v) ? v : defaultLocale);
