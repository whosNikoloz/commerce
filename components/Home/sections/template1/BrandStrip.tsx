import type { BrandStripData, Locale } from "@/types/tenant"
import { tOpt } from "@/lib/i18n"
import { getAllBrands } from "@/app/api/services/brandService"
import { BrandCard, BrandCardSkeleton } from "../ui/BrandCard"
import { SectionContainer } from "../ui/SectionContainer"

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
    const activeBrands = brands.slice(0, 12)

    // Merge with predefined logo URLs from data
    brandsData = activeBrands.map(brand => {
      const predefinedBrand = data.brands.find(b => b.name === brand.name)
      return {
        brand,
        logoUrl: predefinedBrand?.logoUrl || "/placeholder.svg"
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

  return (
    <SectionContainer
      error={error}
      isEmpty={!brandsData || brandsData.length === 0}
      emptyMessage="No brands available"
      loadingSkeleton={loadingSkeleton}
      className="py-16 bg-muted/30 border-y border-border"
    >
      <div className="container mx-auto px-4">
        {data.title && (
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-heading">
            {tOpt(data.title, locale)}
          </h2>
        )}

        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-12 items-center">
          {brandsData?.map(({ brand, logoUrl }) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              logoUrl={logoUrl}
              template={template}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
