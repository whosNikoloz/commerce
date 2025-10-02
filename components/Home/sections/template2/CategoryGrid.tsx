import type { CategoryGridData, Locale } from "@/types/tenant"
import { t } from "@/lib/i18n"
import { getAllCategories } from "@/app/api/services/categoryService"
import { searchProductsByFilter } from "@/app/api/services/productService"
import { CategoryCard, CategoryCardSkeleton } from "../ui/CategoryCard"
import { SectionContainer } from "../ui/SectionContainer"

interface CategoryGridProps {
  data: CategoryGridData
  locale: Locale
  template?: 1 | 2 | 3
}

export default async function CategoryGrid({ data, locale, template = 2 }: CategoryGridProps) {
  let categoriesWithCounts = null
  let error = null

  try {
    const categories = await getAllCategories()
    const topLevelCategories = categories.filter(c => !c.parentId && c.isActive)

    const categoriesWithData = await Promise.all(
      topLevelCategories.slice(0, 8).map(async (category) => {
        try {
          const result = await searchProductsByFilter({
            filter: { categoryIds: [category.id] },
            pageSize: 1,
            page: 1
          })
          return {
            category,
            productCount: result.totalCount || 0,
            imageUrl: data.categories.find(c =>
              t(c.name, locale).toLowerCase() === category.name?.toLowerCase()
            )?.imageUrl || "/placeholder.svg"
          }
        } catch {
          return { category, productCount: 0, imageUrl: "/placeholder.svg" }
        }
      })
    )

    categoriesWithCounts = categoriesWithData
  } catch (e) {
    error = e as Error
    console.error("Failed to load categories:", e)
  }

  const loadingSkeleton = (
    <div className="py-16 bg-home-comfort dark:bg-home-modern/10">
      <div className="container mx-auto px-4">
        <div className="h-10 bg-muted rounded-lg w-96 mx-auto mb-12 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <CategoryCardSkeleton key={idx} template={template} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <SectionContainer
      error={error}
      isEmpty={!categoriesWithCounts || categoriesWithCounts.length === 0}
      emptyMessage="No categories available"
      loadingSkeleton={loadingSkeleton}
      className="py-16 bg-home-comfort dark:bg-home-modern/10"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground font-heading">
          {t(data.title, locale)}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
