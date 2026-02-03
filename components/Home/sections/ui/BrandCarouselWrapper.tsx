import type { BrandCarouselData, Locale } from "@/types/tenant"
import type { BrandModel } from "@/types/brand"

import BrandCarousel from "./BrandCarousel"

import { getAllBrands } from "@/app/api/services/brandService"

interface BrandCarouselWrapperProps {
  data: BrandCarouselData
  locale: Locale
}

export default async function BrandCarouselWrapper({ data, locale }: BrandCarouselWrapperProps) {
  let brands: BrandModel[] = []

  try {
    brands = await getAllBrands()
  } catch (error) {
    // If brands cannot be loaded, silently skip rendering the section
    return null
  }

  if (!brands || brands.length === 0) {
    return null
  }

  // Filter by brandIds if provided
  let filteredBrands = brands

  if (data.brandIds && data.brandIds.length > 0) {
    filteredBrands = brands.filter(brand => data.brandIds!.includes(brand.id))
  }

  // Apply maxBrands limit
  const limitedBrands = data.maxBrands ? filteredBrands.slice(0, data.maxBrands) : filteredBrands

  return <BrandCarousel brands={limitedBrands} data={data} locale={locale} />
}
