import type { Locale } from "@/types/tenant";

import { Suspense } from "react";

import CustomHTML from "@/components/Home/sections/ui/CustomHTML";

interface InfoPageSection {
  enabled: boolean;
  order: number;
  type: "CustomHTML";
  data: {
    html: string;
    css?: string;
    padding?: "none" | "small" | "medium" | "large";
    fullWidth?: boolean;
    containerClass?: string;
  };
}

interface InfoPageConfig {
  sections: InfoPageSection[];
}

interface InfoPageRendererProps {
  pageConfig: InfoPageConfig;
  locale: Locale;
}

export default function InfoPageRenderer({ pageConfig, locale }: InfoPageRendererProps) {
  // Get enabled sections sorted by order
  const sections = pageConfig.sections
    .filter((section) => section.enabled)
    .slice()
    .sort((a, b) => a.order - b.order);

  if (!pageConfig || sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            No Content Available
          </h2>
          <p className="text-gray-600">
            This page has no configured content sections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="info-page-container">
      {sections.map((section, index) => (
        <Suspense
          key={`${section.type}-${section.order}-${index}`}
          fallback={
            <div className="w-full min-h-[400px] animate-pulse bg-muted rounded-lg" />
          }
        >
          <div className="min-h-[200px]">
            <CustomHTML data={section.data} locale={locale} />
          </div>
        </Suspense>
      ))}
    </div>
  );
}
