"use client";

import type { Locale } from "@/i18n.config";

import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { getDictionary } from "@/lib/dictionaries";
import { useTenant } from "@/app/context/tenantContext";

const TranslationContext = createContext<any>({});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { config: tenantConfig } = useTenant();
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // Use tenant config dictionaries if available, fallback to static files
      const dict = await getDictionary(params.lang as Locale, tenantConfig);

      setTranslations(dict);
      setIsLoading(false);
    };

    loadTranslations();
  }, [params.lang, tenantConfig]);

  if (isLoading) {
    return <div />;
  }

  return <TranslationContext.Provider value={translations}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
}
