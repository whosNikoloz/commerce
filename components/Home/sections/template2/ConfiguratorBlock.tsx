"use client";

import type { ConfiguratorBlockData, Locale } from "@/types/tenant";
import { t, tOpt } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ConfiguratorBlockProps {
  data: ConfiguratorBlockData;
  locale: Locale;
}

export default function ConfiguratorBlock({
  data,
  locale,
}: ConfiguratorBlockProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>(
    new Array(data.steps.length).fill(0)
  );

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-4">
              <Palette className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Customize Your Space
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t(data.title, locale)}
            </h2>
            {data.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {tOpt(data.description, locale)}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {data.steps.map((step, stepIdx) => (
              <div
                key={stepIdx}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
              >
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                  {stepIdx + 1}. {t(step.label, locale)}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {step.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => {
                        const newSelected = [...selectedOptions];
                        newSelected[stepIdx] = optIdx;
                        setSelectedOptions(newSelected);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedOptions[stepIdx] === optIdx
                          ? "border-emerald-600 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(option, locale)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {data.cta && (
            <div className="text-center mt-10">
              <Button size="lg" className="px-8" asChild>
                <a href={data.cta.href}>{t(data.cta.label, locale)}</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}