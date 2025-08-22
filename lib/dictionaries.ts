import type { Locale as ConfigLocale } from "@/i18n.config";

const SUPPORTED = ["en", "ka"] as const;
type BaseLocale = typeof SUPPORTED[number];

function normalizeLocale(l: string): BaseLocale {
  const base = l?.split?.("-")?.[0] ?? "en";
  return (SUPPORTED as readonly string[]).includes(base as BaseLocale)
    ? (base as BaseLocale)
    : "en";
}

const loaders: Record<BaseLocale, () => Promise<Record<string, any>>> = {
  en: () => import("@/dictionaries/en.json").then(m => m.default),
  ka: () => import("@/dictionaries/ka.json").then(m => m.default),
};

export async function getDictionary(locale: ConfigLocale | string) {
  const key = normalizeLocale(String(locale));
  const load = loaders[key];
  if (typeof load !== "function") return loaders.en();
  return load();
}
