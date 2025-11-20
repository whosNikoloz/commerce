import type { Locale } from "@/i18n.config";

/* =========================
   Intl caches (perf friendly)
   ========================= */

const CURRENCY_FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat("ka-GE", { style: "currency", currency: "GEL" }),
  ka: new Intl.NumberFormat("ka-GE", { style: "currency", currency: "GEL" }),
};

const DATE_FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }),
  ka: new Intl.DateTimeFormat("ka-GE", { year: "numeric", month: "long", day: "numeric" }),
};

const RELATIVE_FORMATTERS: Record<Locale, Intl.RelativeTimeFormat> = {
  en: new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }),
  ka: new Intl.RelativeTimeFormat("ka-GE", { numeric: "auto" }),
};

const NUMBER_FORMATTERS: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat("en-US"),
  ka: new Intl.NumberFormat("ka-GE"),
};

/* =========================
   Helpers
   ========================= */

type AnyRecord = Record<string, unknown>;

function isPlainObject(v: unknown): v is AnyRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/* =========================
   Formatters
   ========================= */

/** Format currency based on locale */
export function formatCurrency(amount: number, locale: Locale = "en"): string {
  const fmt = CURRENCY_FORMATTERS[locale] ?? CURRENCY_FORMATTERS.en;

  return fmt.format(amount);
}

/** Format date based on locale */
export function formatDate(date: Date | string, locale: Locale = "en"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const fmt = DATE_FORMATTERS[locale] ?? DATE_FORMATTERS.en;

  return fmt.format(dateObj);
}

/** Format relative time (e.g., "2 hours ago") */
export function formatRelativeTime(date: Date | string, locale: Locale = "en"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const fmt = RELATIVE_FORMATTERS[locale] ?? RELATIVE_FORMATTERS.en;

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30; // rough
  const year = day * 365; // rough

  if (Math.abs(diffInSeconds) < minute) {
    return fmt.format(-diffInSeconds, "second");
  } else if (Math.abs(diffInSeconds) < hour) {
    return fmt.format(-Math.floor(diffInSeconds / minute), "minute");
  } else if (Math.abs(diffInSeconds) < day) {
    return fmt.format(-Math.floor(diffInSeconds / hour), "hour");
  } else if (Math.abs(diffInSeconds) < week) {
    return fmt.format(-Math.floor(diffInSeconds / day), "day");
  } else if (Math.abs(diffInSeconds) < month) {
    return fmt.format(-Math.floor(diffInSeconds / week), "week");
  } else if (Math.abs(diffInSeconds) < year) {
    return fmt.format(-Math.floor(diffInSeconds / month), "month");
  } else {
    return fmt.format(-Math.floor(diffInSeconds / year), "year");
  }
}

/** Format numbers based on locale */
export function formatNumber(num: number, locale: Locale = "en"): string {
  const fmt = NUMBER_FORMATTERS[locale] ?? NUMBER_FORMATTERS.en;

  return fmt.format(num);
}

/** Get localized sort order for strings */
export function getCollator(locale: Locale = "en"): Intl.Collator {
  return new Intl.Collator(locale === "ka" ? "ka-GE" : "en-US", {
    sensitivity: "base",
    numeric: true,
  });
}

/** Get direction (LTR/RTL) for locale */
export function getTextDirection(_locale: Locale): "ltr" | "rtl" {
  // Georgian and English are LTR; extend when adding RTL locales.
  return "ltr";
}

/* =========================
   Translation utilities
   ========================= */

/** Validate translation key exists */
export function isValidTranslationKey(key: string, dictionary: Record<string, unknown>): boolean {
  const parts = key.split(".");
  let value: unknown = dictionary;

  for (const p of parts) {
    if (isPlainObject(value) && p in value) {
      value = (value as AnyRecord)[p];
    } else {
      return false;
    }
  }

  return typeof value === "string";
}

/** Get all available translation keys from a dictionary */
export function getAllTranslationKeys(dictionary: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];

  function traverse(obj: unknown, currentPrefix: string) {
    if (!isPlainObject(obj)) return;

    for (const key in obj) {
      const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key;
      const val = obj[key];

      if (typeof val === "string") {
        keys.push(fullKey);
      } else if (isPlainObject(val)) {
        traverse(val, fullKey);
      }
    }
  }

  traverse(dictionary, prefix);

  return keys;
}

/** Replace placeholders in translation strings */
export function interpolateTranslation(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, k) =>
    k in values ? String(values[k]) : match,
  );
}

/** Pluralize based on count and locale rules */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  locale: Locale = "en",
): string {
  if (locale === "ka") {
    return count === 1 ? singular : (plural ?? `${singular}ები`);
  }

  if (count === 1) return singular;
  if (plural) return plural;

  if (singular.endsWith("y")) return singular.slice(0, -1) + "ies";
  if (/(s|sh|ch)$/.test(singular)) return singular + "es";

  return singular + "s";
}

/* =========================
   Error messages (fixed TS7053)
   ========================= */

const ERROR_MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    "validation.required": "This field is required",
    "validation.email": "Please enter a valid email",
    "validation.minLength": "Minimum length is {min} characters",
    "validation.maxLength": "Maximum length is {max} characters",
    "auth.invalid": "Invalid credentials",
    "auth.expired": "Session expired",
    "network.error": "Network error occurred",
    "server.error": "Server error occurred",
  },
  ka: {
    "validation.required": "ეს ველი სავალდებულოა",
    "validation.email": "შეიყვანეთ სწორი ელ-ფოსტა",
    "validation.minLength": "მინიმუმ სიგრძეა {min} სიმბოლო",
    "validation.maxLength": "მაქსიმუმ სიგრძეა {max} სიმბოლო",
    "auth.invalid": "არასწორი მონაცემები",
    "auth.expired": "სესია ამოიწურა",
    "network.error": "ქსელის შეცდომა მოხდა",
    "server.error": "სერვერის შეცდომა მოხდა",
  },
};

export function getErrorMessage(errorCode: string, locale: Locale = "en"): string {
  const dict = ERROR_MESSAGES[locale] ?? ERROR_MESSAGES.en;

  return dict[errorCode] ?? ERROR_MESSAGES.en[errorCode] ?? errorCode;
}

/* =========================
   Deep merge (fixed TS2322)
   ========================= */

export function mergeTranslations<T extends AnyRecord>(base: T, override: Partial<T>): T {
  const result: AnyRecord = { ...base };

  for (const key in override) {
    const o = override[key];

    if (isPlainObject(o)) {
      const current = isPlainObject(result[key]) ? (result[key] as AnyRecord) : {};

      result[key] = mergeTranslations(current, o as AnyRecord);
    } else if (o !== undefined) {
      // Replace primitives & arrays
      result[key] = o;
    }
  }

  return result as T;
}
