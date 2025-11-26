import type { CategoryCarouselData, Locale } from "@/types/tenant"

import CategoryCarousel from "./CategoryCarousel"

import { getAllCategories } from "@/app/api/services/categoryService"

interface CategoryCarouselWrapperProps {
  data: CategoryCarouselData
  locale: Locale
}

export default async function CategoryCarouselWrapper({ data, locale }: CategoryCarouselWrapperProps) {
  let categories = []

  try {
    categories = await getAllCategories()
  } catch (error) {
    return null
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return <CategoryCarousel categories={categories} data={data} locale={locale} />
}
