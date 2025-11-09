import type { TenantConfig, Locale } from "@/types/tenant";

import { Suspense } from "react";

import { getTemplateDefinition, validateHomepage } from "@/lib/templates";

interface HomeRendererProps {
  tenant: TenantConfig;
  locale: Locale;
}

export default function HomeRenderer({ tenant, locale }: HomeRendererProps) {
  // 1) Validate homepage configuration
  let validatedHomepage;

  try {
    validatedHomepage = validateHomepage(
      tenant.homepage,
      tenant.templateId
    ) as { sections: Array<{ enabled: boolean; order: number; type: string; data: any }> };
  } catch (error) {
    console.error("Homepage validation failed:", error);
    validatedHomepage = null;
  }

  // 2) Get template definition
  const templateDefinition = getTemplateDefinition(tenant.templateId);

  // 3) Get enabled sections sorted by order
  const list = validatedHomepage?.sections ?? [];
  const sections = list
    .filter((section) => section.enabled)
    .slice() // copy before sort to be safe
    .sort((a, b) => a.order - b.order);

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

  // Create loading skeleton based on section type
  const getLoadingSkeleton = (sectionType: string) => {
    const commonClasses = "w-full animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900";

    switch (sectionType) {
      case 'Hero':
      case 'HeroLifestyle':
      case 'HeroBanner':
      case 'HeroCategoryGrid':
        return <div className={`${commonClasses} h-[400px] md:h-[500px] rounded-xl mb-4`} />;
      case 'ProductRail':
      case 'ProductGrid':
        return (
          <div className="py-8">
            <div className={`${commonClasses} h-12 w-64 rounded-lg mb-6`} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${commonClasses} h-80 rounded-lg`} />
              ))}
            </div>
          </div>
        );
      case 'CommercialBanner':
        return <div className={`${commonClasses} h-64 rounded-xl mb-4`} />;
      case 'BrandCarousel':
      case 'BrandStrip':
        return <div className={`${commonClasses} h-32 rounded-lg mb-4`} />;
      default:
        return <div className={`${commonClasses} h-64 rounded-lg mb-4`} />;
    }
  };

  return (
    <div className="homepage-container max-w-7xl mx-auto">
      {sections.map((section, index) => {
        const Component = templateDefinition.registry[section.type];

        if (!Component) {
          console.warn(`Component not found for section type: ${section.type}`);
          return null;
        }

        // First section (usually Hero) gets priority, rest are lazy loaded
        const isPriority = index === 0;

        return (
          <Suspense
            key={`${section.type}-${section.order}-${index}`}
            fallback={getLoadingSkeleton(section.type)}
          >
            <div className={isPriority ? "" : "animate-fadeIn"}>
              <Component data={section.data} locale={locale} />
            </div>
          </Suspense>
        );
      })}
    </div>
  );
}
