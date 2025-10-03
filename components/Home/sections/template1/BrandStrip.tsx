import type { BrandStripData, Locale } from "@/types/tenant"

import { BrandCard, BrandCardSkeleton } from "../ui/BrandCard"
import { SectionContainer } from "../ui/SectionContainer"

import { tOpt } from "@/lib/i18n"
import { getAllBrands } from "@/app/api/services/brandService"

interface BrandStripProps {
  data: BrandStripData
  locale: Locale
  template?: 1 | 2 | 3
}

export default async function BrandStrip({ data, locale, template = 1 }: BrandStripProps) {
  let brandsData = null
  let error = null

  try {
    const brands = await getAllBrands()

    brandsData = brands.map(brand => {
      return {
        brand,
        logoUrl: "/placeholder.svg"
      }
    })
  } catch (e) {
    error = e as Error
    console.error("Failed to load brands:", e)
  }

  const loadingSkeleton = (
    <div className="py-16 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        {data.title && (
          <div className="h-10 bg-muted rounded-lg w-64 mx-auto mb-12 animate-pulse" />
        )}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 items-center">
          {Array.from({ length: 12 }).map((_, idx) => (
            <BrandCardSkeleton key={idx} template={template} />
          ))}
        </div>
      </div>
    </div>
  )

  // Duplicate brands for infinite scroll effect
  const duplicatedBrands = brandsData ? [...brandsData, ...brandsData] : []

  return (
    <SectionContainer
      className="py-16 border-y border-border"
      emptyMessage="No brands available"
      error={error}
      isEmpty={!brandsData || brandsData.length === 0}
      loadingSkeleton={loadingSkeleton}
    >
      <div className="container mx-auto px-4">
        {data.title && (
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 text-foreground">
            {tOpt(data.title, locale)}
          </h2>
        )}

        {/* Auto-scrolling carousel */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 md:gap-16 animate-scroll hover:pause-animation">
            {duplicatedBrands.map(({ brand, logoUrl }, index) => (
              <div key={`${brand.id}-${index}`} className="flex-shrink-0">
                <BrandCard
                  brand={brand}
                  logoUrl={logoUrl}
                  template={template}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
