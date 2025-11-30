"use client";

import { FC, useState, useEffect, useMemo } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";

import { useTenant } from "@/app/context/tenantContext";
import { getLocales, getDefaultLocale } from "@/i18n.config";
import { getLanguageName, getLanguageIconName } from "@/lib/language-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// უკეთესია ეს import გლობალში (layout.tsx / globals.ts-ში) გქონდეს,
// მაგრამ აქაც იმუშავებს ტესტისთვის
import "flag-icons/css/flag-icons.min.css";

export interface LanguageSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

// helper – ვამთხვევთ ენის/იკონის კოდს ფლაგის country code-ს
const getFlagClass = (code?: string) => {
  if (!code) return "";

  switch (code.toLowerCase()) {
    // Georgian language → Georgia flag
    case "ka":
    case "ge":
      return "fi fi-ge";
    // English language → UK flag (შეგიძლია შეცვალო fi-us-ზე, თუ გინდა USA)
    case "en":
      return "fi fi-gb";
    case "ru":
      return "fi fi-ru";
    case "de":
      return "fi fi-de";
    case "fr":
      return "fi fi-fr";
    case "uz":
      return "fi fi-uz";
    case "az":
      return "fi fi-az";
    default:
      return "";
  }
};

// პატარა wrapper ფლაგის span-სთვის
const FlagIcon: FC<{ code?: string; size?: number }> = ({ code, size = 20 }) => {
  if (!code) return null;

  // normalize – "fr-FR" → "fr", "en-US" → "en"
  const normalized = code.toLowerCase().split("-")[0];
  const flagClass = getFlagClass(normalized);

  if (!flagClass) return null;

  return (
    <span
      className={clsx(flagClass, "fis inline-block")}
      // flag-icons ზომას font-size-ზე აგებს, ამიტომ ასე ვზრდით/ვაპატარავებთ
      style={{ fontSize: size }}
    />
  );
};

export const LanguageSwitch: FC<LanguageSwitchProps> = ({ className, classNames }) => {
  const isSSR = useIsSSR();
  const pathname = usePathname();
  const router = useRouter();
  const { config: tenantConfig } = useTenant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get available locales from tenant config or fallback to static
  const availableLocales = useMemo(() => {
    return getLocales(tenantConfig);
  }, [tenantConfig]);

  const defaultLocale = useMemo(() => {
    return getDefaultLocale(tenantConfig);
  }, [tenantConfig]);

  // Detect current language from pathname
  const currentLanguage = useMemo(() => {
    if (!pathname) return defaultLocale;

    // Extract locale from pathname (e.g., /en/... or /ka/...)
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();

    // Check if first segment is a valid locale
    if (firstSegment && availableLocales.includes(firstSegment)) {
      return firstSegment;
    }

    // If no locale in path, it's the default locale
    return defaultLocale;
  }, [pathname, availableLocales, defaultLocale]);

  // Function to change language
  const changeLanguage = (newLang: string) => {
    const segments = pathname?.split("/").filter(Boolean) || [];
    const firstSegment = segments[0]?.toLowerCase();

    let pathWithoutLocale = pathname || "/";

    // Only remove the first segment if it's a valid locale
    if (firstSegment && availableLocales.includes(firstSegment)) {
      // Remove the locale prefix
      pathWithoutLocale = "/" + segments.slice(1).join("/");
    }

    // Ensure we have at least a slash
    if (!pathWithoutLocale || pathWithoutLocale === "") {
      pathWithoutLocale = "/";
    }

    // If switching to default locale, don't add prefix
    if (newLang === defaultLocale) {
      router.push(pathWithoutLocale);
    } else {
      // Add locale prefix for non-default languages
      router.push(`/${newLang}${pathWithoutLocale}`);
    }
  };

  // Show toggle for 2 languages, dropdown for 3+
  const useDropdown = availableLocales.length > 2;

  // Toggle for 2 languages (original behavior) - prepare toggle language
  const toggleLanguage = availableLocales.find((l) => l !== currentLanguage) || defaultLocale;

  const onChange = () => {
    changeLanguage(toggleLanguage);
  };

  // Always call useSwitch hook (required by React Hooks rules)
  // We'll only use it when not using dropdown
  const switchHook = useSwitch({
    isSelected: currentLanguage === defaultLocale || isSSR,
    "aria-label": `Switch to ${getLanguageName(toggleLanguage)}`,
    onChange,
    isDisabled: useDropdown, // Disable when using dropdown
  });

  // Show a static placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    if (useDropdown) {
      return (
        <div
          className={clsx(
            "px-px cursor-pointer flex items-center justify-center p-2 min-w-[100px]",
            className,
          )}
        >
          <span className="font-primary text-sm">{getLanguageName(defaultLocale)}</span>
        </div>
      );
    }

    return (
      <div
        className={clsx(
          "px-px cursor-pointer flex items-center justify-center p-2",
          className,
        )}
      >
        <FlagIcon code="ka" size={24} />
      </div>
    );
  }

  // Dropdown for 3+ languages
  if (useDropdown) {
    // ვცდილობთ `getLanguageIconName`, თუ пустოა → თვითონ currentLanguage
    const iconName = getLanguageIconName(currentLanguage) || currentLanguage;

    return (
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger
          className={clsx(
            "h-auto w-auto min-w-[100px] border-none shadow-none bg-transparent hover:bg-transparent focus:ring-0 px-2 py-1",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            {iconName && <FlagIcon code={iconName} size={18} />}
            <SelectValue placeholder={getLanguageName(currentLanguage)}>
              <span className="font-primary text-sm">{getLanguageName(currentLanguage)}</span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableLocales.map((locale) => {
            const localeIconName = getLanguageIconName(locale) || locale;

            return (
              <SelectItem key={locale} value={locale}>
                <div className="flex items-center gap-2">
                  {localeIconName && <FlagIcon code={localeIconName} size={18} />}
                  <span>{getLanguageName(locale)}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  // Toggle for 2 languages (original behavior)
  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } = switchHook;

  const currentIconName = getLanguageIconName(currentLanguage) || currentLanguage;
  const toggleIconName = getLanguageIconName(toggleLanguage) || toggleLanguage;

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base,
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={clsx("flex items-center justify-center p-2", slots?.wrapper, classNames?.wrapper)}
      >
        {currentIconName && <FlagIcon code={currentIconName} size={24} />}

        {!currentIconName && toggleIconName && <FlagIcon code={toggleIconName} size={24} />}

        {!currentIconName && !toggleIconName && (
          <span className="font-primary text-sm">{getLanguageName(currentLanguage)}</span>
        )}
      </div>
    </Component>
  );
};
