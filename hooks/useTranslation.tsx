"use client";

import type { Locale } from "@/i18n.config";

import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { getDictionary } from "@/lib/dictionaries";

const TranslationContext = createContext<any>({});

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadTranslations = async () => {
      const dict = await getDictionary(params.lang as Locale);

      setTranslations(dict);
      setIsLoading(false);
    };

    loadTranslations();
  }, [params.lang]);

  if (isLoading) {
    return <div />;
  }

  return (
    <TranslationContext.Provider value={translations}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
}
