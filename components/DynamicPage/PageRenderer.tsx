import type { TenantConfig, Locale } from "@/types/tenant";

import { Suspense } from "react";

import { getTemplateDefinition } from "@/lib/templates";

interface PageRendererProps {
  tenant: TenantConfig;
  locale: Locale;
  pageSlug: string;
}

export default function PageRenderer({ tenant, locale, pageSlug }: PageRendererProps) {
  // 1) Find the dynamic page configuration
  const dynamicPage = tenant.dynamicPages?.pages.find(page => page.slug === pageSlug);

  if (!dynamicPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page &quot;{pageSlug}&quot; does not exist in your configuration.
          </p>
        </div>
      </div>
    );
  }

  // 2) Get template definition based on templateId
  const templateDefinition = getTemplateDefinition(tenant.templateId);

  // 3) Get enabled sections sorted by order
  const sections = dynamicPage.sections
    .filter((section) => section.enabled)
    .slice() // copy before sort to be safe
    .sort((a, b) => a.order - b.order);

  // 4) Render sections
  return (
    <div className="dynamic-page-container max-w-7xl mx-auto">
      {sections.map((section, index) => {
        const Component = templateDefinition.registry[section.type];

        if (!Component) {
          // eslint-disable-next-line no-console
          console.warn(`Component not found for section type: ${section.type}`);

          return null;
        }

        return (
          <Suspense
            key={`${section.type}-${section.order}-${index}`}
            fallback={
              <div className="w-full h-64 animate-pulse bg-muted" />
            }
          >
            <Component data={section.data} locale={locale} />
          </Suspense>
        );
      })}
    </div>
  );
}
