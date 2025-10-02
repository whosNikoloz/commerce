"use client";

import type { ConfiguratorBlockData, Locale } from "@/types/tenant";
import { t, tOpt } from "@/lib/i18n";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ConfiguratorBlockProps {
  data: ConfiguratorBlockData;
  locale: Locale;
  template?: 1 | 2 | 3;
}

export default function ConfiguratorBlock({
  data,
  locale,
  template = 2,
}: ConfiguratorBlockProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>(
    new Array(data.steps.length).fill(0)
  );

  return (
    <section className="py-16 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-home-comfort/30 dark:bg-home-elegant/20 px-4 py-2 rounded-full mb-4 animate-home-sway">
              <Palette className="h-5 w-5 text-home-warm dark:text-home-comfort" />
              <span className="text-sm font-semibold text-home-modern dark:text-home-comfort">
                Customize Your Space
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              {t(data.title, locale)}
            </h2>
            {data.description && (
              <p className="text-lg text-text-subtle dark:text-text-subtledark">
                {tOpt(data.description, locale)}
              </p>
            )}
          </div>

          <div className="space-y-8">
            {data.steps.map((step, stepIdx) => (
              <div
                key={stepIdx}
                className="bg-brand-surface/5 dark:bg-brand-surfacedark/5 rounded-lg p-6"
              >
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
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
                          ? "border-home-warm dark:border-home-comfort bg-home-comfort/20 dark:bg-home-elegant/20"
                          : "border-border hover:border-home-warm/50 dark:hover:border-home-comfort/50"
                      }`}
                    >
                      <span className="text-sm font-medium text-foreground">
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