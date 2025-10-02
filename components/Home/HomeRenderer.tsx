"use client";

import type { TenantConfig, Locale } from "@/types/tenant";

import { Suspense, useMemo } from "react";

import { getTemplateDefinition, validateHomepage } from "@/lib/templates";

interface HomeRendererProps {
  tenant: TenantConfig;
  locale: Locale;
}

export default function HomeRenderer({ tenant, locale }: HomeRendererProps) {
  // 1) Always call hooks in a stable order
  const validatedHomepage = useMemo(() => {
    try {
      return validateHomepage(
        tenant.homepage,
        tenant.templateId
      ) as { sections: Array<{ enabled: boolean; order: number; type: string; data: any }> };
    } catch (error) {
      console.error("Homepage validation failed:", error);

      return null;
    }
  }, [tenant.homepage, tenant.templateId]);

  // Optional: memoize template definition (cheap, but safe)
  const templateDefinition = useMemo(
    () => getTemplateDefinition(tenant.templateId),
    [tenant.templateId]
  );

  // 2) This hook depends on validatedHomepage but handles null safely
  const sections = useMemo(() => {
    const list = validatedHomepage?.sections ?? [];

    return list
      .filter((section) => section.enabled)
      .slice() // copy before sort to be safe
      .sort((a, b) => a.order - b.order);
  }, [validatedHomepage?.sections]);

  // 3) Render
  if (!validatedHomepage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Configuration Error
          </h2>
          <p className="text-gray-600">
            The homepage configuration is invalid. Please check the console for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      {sections.map((section, index) => {
        const Component = templateDefinition.registry[section.type];

        if (!Component) {
          console.warn(`Component not found for section type: ${section.type}`);

          return null;
        }

        return (
          <Suspense
            key={`${section.type}-${section.order}-${index}`}
            fallback={
              <div className="w-full h-64 animate-pulse bg-gray-100 dark:bg-gray-800" />
            }
          >
            <Component data={section.data} locale={locale} />
          </Suspense>
        );
      })}
    </div>
  );
}
