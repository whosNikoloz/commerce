import type { CategoryGridData, Locale } from "@/types/tenant"

import { CategoryCard, CategoryCardSkeleton } from "../ui/CategoryCard"
import { SectionContainer } from "../ui/SectionContainer"

import { t } from "@/lib/i18n"
import { getAllCategories } from "@/app/api/services/categoryService"
import { searchProductsByFilter } from "@/app/api/services/productService"
import { Sparkles } from "lucide-react"

interface CategoryGridProps {
  data: CategoryGridData
  locale: Locale
  template?: 1 | 2 | 3
}

export default async function CategoryGrid({ data, locale, template = 1 }: CategoryGridProps) {
  let categoriesWithCounts = null
  let error = null

  try {
    const categories = await getAllCategories()
    const topLevelCategories = categories.filter((c) => !c.parentId)

    // Get product counts for each category
    const categoriesWithData = await Promise.all(
      topLevelCategories.slice(0, 8).map(async (category) => {
        try {
          const result = await searchProductsByFilter({
            filter: { categoryIds: [category.id] },
            pageSize: 1,
            page: 1,
          })

          return {
            category,
            productCount: result.totalCount || 0,
            // Use predefined image from data if available
            imageUrl:
              data.categories.find((c) => t(c.name, locale).toLowerCase() === category.name?.toLowerCase())?.imageUrl ||
              "/placeholder.svg",
          }
        } catch {
          return { category, productCount: 0, imageUrl: "/placeholder.svg" }
        }
      }),
    )

    categoriesWithCounts = categoriesWithData
  } catch (e) {
    error = e as Error
    console.error("Failed to load categories:", e)
  }

  const loadingSkeleton = (
    <div className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="h-12 bg-muted rounded-lg w-96 mx-auto mb-20 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {Array.from({ length: 8 }).map((_, idx) => (
            <CategoryCardSkeleton key={idx} template={template} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <SectionContainer
      className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden"
      emptyMessage="No categories available"
      error={error}
      isEmpty={!categoriesWithCounts || categoriesWithCounts.length === 0}
      loadingSkeleton={loadingSkeleton}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Shop by Category</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-center text-foreground text-balance font-heading leading-tight">
            {t(data.title, locale)}
          </h2>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Discover our curated collection of products across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
          {categoriesWithCounts?.map(({ category, productCount, imageUrl }) => (
            <CategoryCard
              key={category.id}
              category={category}
              imageUrl={imageUrl}
              productCount={productCount}
              template={template}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
