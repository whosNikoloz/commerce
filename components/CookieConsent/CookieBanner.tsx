"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { useCookieConsent } from "@/app/context/cookieConsentContext";
import { useDictionary } from "@/app/context/dictionary-provider";

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openManageModal, closeBanner } = useCookieConsent();
  const { lang } = useDictionary();

  if (!showBanner) return null;

  const translations = {
    en: {
      title: "We use cookies",
      description: "We use cookies to enhance your experience and analyze traffic.",
      acceptAll: "Accept",
      rejectAll: "Reject",
      manage: "Manage",
      learnMore: "Cookie Policy",
    },
    ka: {
      title: "ჩვენ ვიყენებთ ქუქიებს",
      description: "ქუქიებს ვიყენებთ გამოცდილების გასაუმჯობესებლად და ანალიტიკისთვის.",
      acceptAll: "მიღება",
      rejectAll: "უარყოფა",
      manage: "პარამ.",
      learnMore: "ქუქიების პოლიტიკა",
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.en;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-[420px]">
      <div className="relative bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-in fade-in zoom-in duration-300">

        {/* Close (X) button */}
        <button
          aria-label="Close banner"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          onClick={closeBanner}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          {t.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {t.description}{" "}
          <Link
            className="text-brand-primary hover:text-brand-primarydark hover:underline transition-colors"
            href={`/${lang}/cookie-policy`}
          >
            {t.learnMore}
          </Link>
        </p>

        {/* Buttons on the RIGHT, small + inline */}
        <div className="flex justify-end gap-2">

          <button
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
            text-xs text-gray-900 dark:text-white rounded-md transition-colors"
            onClick={rejectAll}
          >
            {t.rejectAll}
          </button>

          <button
            className="px-3 py-1.5 border border-brand-primary/30 hover:border-brand-primary hover:bg-brand-primary/5
            text-xs text-brand-primary dark:text-brand-primary rounded-md transition-colors"
            onClick={openManageModal}
          >
            {t.manage}
          </button>

          <button
            className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primarydark text-white text-xs rounded-md transition-colors"
            onClick={acceptAll}
          >
            {t.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
