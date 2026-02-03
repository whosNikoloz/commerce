"use client";

import type { LocalizedText } from "@/types/product";

import { useMemo } from "react";

// Language display mapping
const LOCALE_DISPLAY: Record<string, { flag: string; name: string }> = {
  en: { flag: "EN", name: "English" },
  ka: { flag: "KA", name: "Georgian" },
  ru: { flag: "RU", name: "Russian" },
  de: { flag: "DE", name: "German" },
  fr: { flag: "FR", name: "French" },
  uz: { flag: "UZ", name: "Uzbek" },
  az: { flag: "AZ", name: "Azerbaijani" },
};

interface LocalizedTextInputProps {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  placeholder?: Record<string, string>;
  required?: boolean;
  multiline?: boolean;
  locales?: string[];
}

export function LocalizedTextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
  locales = ["ka", "en"],
}: LocalizedTextInputProps) {
  const InputComponent = multiline ? "textarea" : "input";

  // Ensure value has all required locales
  const safeValue = useMemo(() => {
    const result: Record<string, string> = {};

    locales.forEach((locale) => {
      result[locale] = (value as Record<string, string>)?.[locale] || "";
    });

    return result;
  }, [value, locales]);

  const handleChange = (locale: string, newValue: string) => {
    onChange({
      ...safeValue,
      [locale]: newValue,
    } as LocalizedText);
  };

  // Get locale display info
  const getLocaleInfo = (locale: string) => {
    return LOCALE_DISPLAY[locale] || { flag: locale.toUpperCase(), name: locale };
  };

  // Calculate grid columns based on number of locales
  const gridCols =
    locales.length === 1
      ? "grid-cols-1"
      : locales.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
      </label>

      <div className={`grid ${gridCols} gap-3`}>
        {locales.map((locale) => {
          const { flag, name } = getLocaleInfo(locale);

          return (
            <div key={locale}>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {flag} {name}
              </label>
              <InputComponent
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-200 text-sm"
                placeholder={placeholder?.[locale] || `Enter ${label.toLowerCase()} in ${name}`}
                rows={multiline ? 3 : undefined}
                type={multiline ? undefined : "text"}
                value={safeValue[locale] || ""}
                onChange={(e) => handleChange(locale, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
