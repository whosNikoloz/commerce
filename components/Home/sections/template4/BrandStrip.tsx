import type { BrandStripData, Locale } from "@/types/tenant"

import { BrandCard, BrandCardSkeleton } from "../ui/BrandCard"
import { SectionContainer } from "../ui/SectionContainer"

import { tOpt } from "@/lib/i18n"
import { getAllBrands } from "@/app/api/services/brandService"

interface BrandStripProps {
  data: BrandStripData
  locale: Locale
}

export default async function BrandStrip({ data, locale }: BrandStripProps) {
  const template = 4
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
    <div className="py-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        {data.title && (
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-72 mx-auto mb-12 animate-pulse" />
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
      className="py-20 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-y border-slate-200 dark:border-slate-800"
      emptyMessage="No brands available"
      error={error}
      isEmpty={!brandsData || brandsData.length === 0}
      loadingSkeleton={loadingSkeleton}
    >
      <div className="container mx-auto px-6 lg:px-8 xl:px-16">
        {data.title && (
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-center mb-12 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {tOpt(data.title, locale)}
          </h2>
        )}

        {/* Auto-scrolling carousel */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 md:gap-16 lg:gap-20 animate-scroll hover:pause-animation">
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
