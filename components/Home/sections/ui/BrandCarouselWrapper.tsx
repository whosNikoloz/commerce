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

  const limitedBrands = data.maxBrands ? brands.slice(0, data.maxBrands) : brands

  return <BrandCarousel brands={limitedBrands} data={data} locale={locale} />
}
