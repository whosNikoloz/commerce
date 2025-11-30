"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenant } from "@/app/context/tenantContext";
import { getLocales, getDefaultLocale } from "@/i18n.config";
import { getLanguageName, getLanguageEmoji } from "@/lib/language-utils";

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { config: tenantConfig } = useTenant();

  // Get available locales and default locale from tenant config
  const availableLocales = useMemo(() => {
    return getLocales(tenantConfig);
  }, [tenantConfig]);

  const defaultLocale = useMemo(() => {
    return getDefaultLocale(tenantConfig);
  }, [tenantConfig]);

  // Detect current language from pathname
  const currentLang = useMemo(() => {
    if (!pathname) return defaultLocale;

    // Extract locale from pathname (e.g., /en/admin or /ka/admin)
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();

    // Check if first segment is a valid locale
    if (firstSegment && availableLocales.includes(firstSegment)) {
      return firstSegment;
    }

    // If no locale in path, it's the default locale
    return defaultLocale;
  }, [pathname, availableLocales, defaultLocale]);

  const switchLanguage = (newLang: string) => {
    if (!pathname) return;

    // Remove any existing locale prefix
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();

    // If first segment is a locale, remove it
    if (firstSegment && availableLocales.includes(firstSegment)) {
      segments.shift(); // Remove the locale
    }

    // Reconstruct path
    const pathWithoutLocale = "/" + segments.join("/");

    // If switching to default locale, use path without locale prefix
    if (newLang === defaultLocale) {
      router.push(pathWithoutLocale);
    } else {
      // Add locale prefix for non-default languages
      router.push(`/${newLang}${pathWithoutLocale}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="font-primary sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className={currentLang === locale ? "bg-accent" : ""}
            onClick={() => switchLanguage(locale)}
          >
            <span className="font-primary mr-2">{getLanguageEmoji(locale)}</span>
            {getLanguageName(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
