import type { HeroData, Locale } from "@/types/tenant"

import HeroClient from "./HeroClient"
import HeroCategoryNav from "./HeroCategoryNav"

import { getAllCategories } from "@/app/api/services/categoryService"
import { t } from "@/lib/i18n"
import { searchProductsByFilter } from "@/app/api/services/productService"

interface HeroProps {
  data: HeroData
  locale: Locale
}

export default async function Hero({ data, locale }: HeroProps) {
  let topCategories = null

  try {
    const allCategories = await getAllCategories()
    const topLevelCategories = allCategories.filter((c) => !c.parentId)

    const categoriesWithData = await Promise.all(
      topLevelCategories.slice(0, data.maxCategories || 8).map(async (category) => {
        try {
          const result = await searchProductsByFilter({
            filter: { categoryIds: [category.id] },
            pageSize: 1,
            page: 1,
          })

          const subcategories = allCategories.filter((c) => c.parentId === category.id)

          return {
            category,
            productCount: result.totalCount || 0,
            subcategories,
          }
        } catch {
          return { category, productCount: 0, subcategories: [] }
        }
      }),
    )

    topCategories = categoriesWithData
  } catch (e) {
    console.error("Failed to load categories for hero:", e)
  }

  const categoryTitle = t(data.categoriesTitle || { ka: "კატეგორიები", en: "Categories" }, locale)

  return (
    <section className="relative w-full to-muted/20 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Categories */}
          <div className="lg:col-span-3  hidden md:block">
            {topCategories && topCategories.length > 0 ? (
              <HeroCategoryNav
                categories={topCategories}
                locale={locale}
                title={categoryTitle}
              />
            ) : (
              <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="bg-primary/10 px-4 py-3 border-b border-border">
                  <h2 className="font-semibold text-lg text-foreground">
                    {categoryTitle}
                  </h2>
                </div>
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No categories available
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Banner Carousel */}
          <div className="lg:col-span-9">
            <HeroClient data={data} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  )
}
