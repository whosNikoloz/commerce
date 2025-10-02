import type { ProductRailData, Locale } from "@/types/tenant"
import type { FilterModel } from "@/types/filter"
import type { Condition, StockStatus } from "@/types/enums"
import { t, tOpt } from "@/lib/i18n"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { searchProductsByFilter } from "@/app/api/services/productService"
import { ProductCard, ProductCardSkeleton } from "./ProductCard"
import { SectionContainer } from "./SectionContainer"

interface ProductRailProps {
  data: ProductRailData
  locale: Locale
  template?: 1 | 2 | 3
  className?: string
}

export default async function ProductRail({
  data,
  locale,
  template = 1,
  className
}: ProductRailProps) {
  let products = null
  let error = null

  try {
    // Build filter based on data.filterBy options using actual FilterModel
    const filter: FilterModel = {}

    // Handle category IDs filtering
    if (data.filterBy?.categoryIds && data.filterBy.categoryIds.length > 0) {
      filter.categoryIds = data.filterBy.categoryIds
    }

    // Handle brand IDs filtering
    if (data.filterBy?.brandIds && data.filterBy.brandIds.length > 0) {
      filter.brandIds = data.filterBy.brandIds
    }

    // Handle condition filtering
    if (data.filterBy?.condition && data.filterBy.condition.length > 0) {
      filter.condition = data.filterBy.condition  as Condition[]
    }

    // Handle stock status filtering
    if (data.filterBy?.stockStatus) {
      filter.stockStatus = data.filterBy.stockStatus as StockStatus
    }

    // Handle price range
    if (data.filterBy?.minPrice !== undefined) {
      filter.minPrice = data.filterBy.minPrice
    }
    if (data.filterBy?.maxPrice !== undefined) {
      filter.maxPrice = data.filterBy.maxPrice
    }

    // Fetch products
    const result = await searchProductsByFilter({
      filter,
      pageSize: data.limit * 2, // Fetch more to allow for client-side filtering
      page: 1,
      sortBy: data.sortBy || "featured"
    })

    let filteredProducts = result.items || []

    // Apply additional client-side filters for product flags
    if (data.filterBy?.isNewArrival) {
      filteredProducts = filteredProducts.filter(p => p.isNewArrival === true)
    }
    if (data.filterBy?.isLiquidated) {
      filteredProducts = filteredProducts.filter(p => p.isLiquidated === true)
    }
    if (data.filterBy?.isComingSoon) {
      filteredProducts = filteredProducts.filter(p => p.isComingSoon === true)
    }
    if (data.filterBy?.hasDiscount) {
      filteredProducts = filteredProducts.filter(p => p.discountPrice && p.discountPrice > 0)
    }

    // Limit to requested count
    products = filteredProducts.slice(0, data.limit)
  } catch (e) {
    error = e as Error
    console.error("Failed to load products:", e)
  }

  const loadingSkeleton = (
    <div className={className || "py-20 bg-muted/20"}>
      <div className="container mx-auto px-4">
        <div className="h-12 bg-muted rounded-lg w-64 mb-10 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: data.limit }).map((_, idx) => (
            <ProductCardSkeleton key={idx} template={template} />
          ))}
        </div>
      </div>
    </div>
  )

  // Generate empty message based on filters
  const getEmptyMessage = () => {
    if (data.filterBy?.isNewArrival) return "No new arrivals at the moment"
    if (data.filterBy?.isLiquidated) return "No liquidated items available"
    if (data.filterBy?.isComingSoon) return "No coming soon items"
    if (data.filterBy?.hasDiscount) return "No discounted items available"
    if (data.filterBy?.categoryIds && data.filterBy.categoryIds.length > 0) return "No products found in selected categories"
    if (data.filterBy?.brandIds && data.filterBy.brandIds.length > 0) return "No products found from selected brands"
    return "No products available"
  }

  return (
    <SectionContainer
      error={error}
      isEmpty={!products || products.length === 0}
      emptyMessage={getEmptyMessage()}
      loadingSkeleton={loadingSkeleton}
      className={className || "py-20 bg-muted/20"}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance font-heading">
              {t(data.title, locale)}
            </h2>
            {data.subtitle && (
              <p className="text-muted-foreground mt-3 text-lg">
                {tOpt(data.subtitle, locale)}
              </p>
            )}
          </div>

          <Button variant="ghost" asChild className="group self-start sm:self-auto">
            <Link href={data.viewAllHref} className="flex items-center gap-2 font-semibold">
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} template={template} />
          ))}
        </div>
      </div>
    </SectionContainer>
  )
}
