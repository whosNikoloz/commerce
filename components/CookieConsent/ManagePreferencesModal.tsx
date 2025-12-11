"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, BarChart3, Target, Settings } from "lucide-react";

import { useCookieConsent, CookieConsent } from "@/app/context/cookieConsentContext";
import { useDictionary } from "@/app/context/dictionary-provider";

export default function ManagePreferencesModal() {
  const { showManageModal, closeManageModal, updateConsent, consent } = useCookieConsent();
  const { lang } = useDictionary();

  const [preferences, setPreferences] = useState<CookieConsent>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Initialize with current consent
  useEffect(() => {
    if (consent) {
      setPreferences(consent);
    }
  }, [consent]);

  if (!showManageModal) return null;

  const translations = {
    en: {
      title: "Manage Cookie Preferences",
      description: "We use cookies to enhance your experience. You can choose which types of cookies to accept.",
      savePreferences: "Save Preferences",
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      categories: {
        essential: {
          title: "Essential Cookies",
          description: "Required for the website to function. These cannot be disabled.",
          always: "Always Active",
        },
        analytics: {
          title: "Analytics Cookies",
          description: "Help us understand how visitors interact with our website (Google Analytics, Hotjar, Clarity).",
        },
        marketing: {
          title: "Marketing Cookies",
          description: "Used to deliver personalized advertisements and track campaign performance (Facebook Pixel, Google Ads).",
        },
        preferences: {
          title: "Preference Cookies",
          description: "Remember your settings and preferences for a better experience (language, theme, region).",
        },
      },
    },
    ka: {
      title: "ქუქიების პარამეტრების მართვა",
      description: "ჩვენ ვიყენებთ ქუქიებს თქვენი გამოცდილების გასაუმჯობესებლად. შეგიძლიათ აირჩიოთ რომელი ტიპის ქუქიების მიღება გსურთ.",
      savePreferences: "პარამეტრების შენახვა",
      acceptAll: "ყველას მიღება",
      rejectAll: "ყველას უარყოფა",
      categories: {
        essential: {
          title: "აუცილებელი ქუქიები",
          description: "საჭიროა ვებსაიტის ფუნქციონირებისთვის. ეს ვერ გაითიშება.",
          always: "ყოველთვის აქტიური",
        },
        analytics: {
          title: "ანალიტიკური ქუქიები",
          description: "დაგვეხმარება გავიგოთ როგორ ურთიერთობენ მომხმარებლები ჩვენს ვებსაიტთან (Google Analytics, Hotjar, Clarity).",
        },
        marketing: {
          title: "მარკეტინგული ქუქიები",
          description: "გამოიყენება პერსონალიზებული რეკლამის მისაწოდებლად და კამპანიის ეფექტურობის თვალყურის დევნებისთვის (Facebook Pixel, Google Ads).",
        },
        preferences: {
          title: "პრეფერენციული ქუქიები",
          description: "იმახსოვრებს თქვენს პარამეტრებს და პრეფერენციებს უკეთესი გამოცდილებისთვის (ენა, თემა, რეგიონი).",
        },
      },
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.en;

  const handleToggle = (category: keyof CookieConsent) => {
    if (category === "essential") return; // Cannot disable essential
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    updateConsent(preferences);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    setPreferences(allAccepted);
    updateConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    setPreferences(allRejected);
    updateConsent(allRejected);
  };

  const categories = [
    {
      key: "essential" as const,
      icon: Shield,
      title: t.categories.essential.title,
      description: t.categories.essential.description,
      alwaysActive: true,
    },
    {
      key: "analytics" as const,
      icon: BarChart3,
      title: t.categories.analytics.title,
      description: t.categories.analytics.description,
      alwaysActive: false,
    },
    {
      key: "marketing" as const,
      icon: Target,
      title: t.categories.marketing.title,
      description: t.categories.marketing.description,
      alwaysActive: false,
    },
    {
      key: "preferences" as const,
      icon: Settings,
      title: t.categories.preferences.title,
      description: t.categories.preferences.description,
      alwaysActive: false,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <button
        aria-label="Close modal"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200 cursor-default"
        type="button"
        onClick={closeManageModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t.description}
              </p>
            </div>
            <button
              aria-label="Close modal"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2"
              onClick={closeManageModal}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isEnabled = preferences[category.key];

                return (
                  <div
                    key={category.key}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg">
                          <Icon className="w-5 h-5 text-brand-primary dark:text-brand-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center">
                        {category.alwaysActive ? (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {t.categories.essential.always}
                          </span>
                        ) : (
                          <button
                            aria-label={`Toggle ${category.title}`}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isEnabled
                                ? "bg-brand-primary"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                            onClick={() => handleToggle(category.key)}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={handleRejectAll}
            >
              {t.rejectAll}
            </button>
            <div className="flex gap-3">
              <button
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                onClick={handleAcceptAll}
              >
                {t.acceptAll}
              </button>
              <button
                className="px-6 py-2 bg-brand-primary hover:bg-brand-primarydark text-white rounded-lg font-medium transition-colors"
                onClick={handleSave}
              >
                {t.savePreferences}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
