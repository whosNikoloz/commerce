"use client"

import { ChevronDown, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { FilterModel } from "@/types/filter"
import { Condition, StockStatus } from "@/types/enums"

type ViewMode = "grid" | "list"

function conditionLabel(c: Condition) {
  switch (c) {
    case Condition.New: return "New"
    case Condition.Used: return "Used"
    case Condition.LikeNew: return "Like New"
    default: return String(c)
  }
}

function stockLabel(s?: StockStatus) {
  if (s === undefined) return ""
  return s === StockStatus.InStock ? "In Stock" : "Out of Stock"
}

interface ProductHeaderProps {
  title: string
  productCount: number
  sortBy: string
  onSortChange: (sort: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void

  // ✅ Real filter model
  filter: FilterModel

  // ✅ Optional lookups for pretty chip labels (fallback to IDs if omitted)
  brandLookup?: Record<string, string>
  categoryLookup?: Record<string, string>
  facetValueLookup?: Record<string, string>

  // ✅ Either use granular callbacks...
  onRemoveBrand?: (id: string) => void
  onRemoveCategory?: (id: string) => void
  onRemoveCondition?: (c: Condition) => void
  onClearStockStatus?: () => void
  onClearPrice?: () => void
  onRemoveFacet?: (facetValueId: string) => void
  onClearAll?: () => void

  // ...or keep your old single handler (we’ll fallback to it if provided)
  onFilterChange?: (filterType: string, value: string | number | boolean | number[]) => void

  activeFiltersCount: number
}

export default function ProductHeader({
  title,
  productCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filter,
  brandLookup,
  categoryLookup,
  facetValueLookup,
  onRemoveBrand,
  onRemoveCategory,
  onRemoveCondition,
  onClearStockStatus,
  onClearPrice,
  onRemoveFacet,
  onClearAll,
  onFilterChange,
  activeFiltersCount,
}: ProductHeaderProps) {
  const brandIds = filter.brandIds ?? []
  const categoryIds = filter.categoryIds ?? []
  const conditions = filter.condition ?? []
  const facetFilters = filter.facetFilters ?? []
  const hasPrice = filter.minPrice !== undefined || filter.maxPrice !== undefined
  const hasStock = filter.stockStatus !== undefined

  const hasAnyChip =
    brandIds.length > 0 ||
    categoryIds.length > 0 ||
    conditions.length > 0 ||
    hasStock ||
    hasPrice ||
    facetFilters.length > 0

  // ---- Fallback shims if only onFilterChange is provided ----
  const _removeBrand = (id: string) =>
    onRemoveBrand ? onRemoveBrand(id) : onFilterChange?.("brandIds:remove", id)
  const _removeCategory = (id: string) =>
    onRemoveCategory ? onRemoveCategory(id) : onFilterChange?.("categoryIds:remove", id)
  const _removeCondition = (c: Condition) =>
    onRemoveCondition ? onRemoveCondition(c) : onFilterChange?.("condition:remove", c)
  const _clearStock = () =>
    onClearStockStatus ? onClearStockStatus() : onFilterChange?.("stockStatus:clear", "")
  const _clearPrice = () =>
    onClearPrice ? onClearPrice() : onFilterChange?.("price:clear", "")
  const _removeFacet = (id: string) =>
    onRemoveFacet ? onRemoveFacet(id) : onFilterChange?.("facetFilters:remove", id)
  const _clearAll = () =>
    onClearAll ? onClearAll() : onFilterChange?.("all:clear", "")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">{title}</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {productCount} products found
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px] lg:min-w-[140px]">
                <span className="hidden sm:inline">Sort by</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">Highest Rated</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Active Filter Chips (FilterModel-based) */}
      {hasAnyChip && (
        <div className="flex flex-wrap gap-2">
          {/* Brands */}
          {brandIds.map((id) => (
            <Badge key={`b-${id}`} variant="secondary" className="gap-1">
              {brandLookup?.[id] ?? id}
              <button onClick={() => _removeBrand(id)} aria-label="Remove brand">×</button>
            </Badge>
          ))}

          {/* Categories */}
          {categoryIds.map((id) => (
            <Badge key={`c-${id}`} variant="secondary" className="gap-1">
              {categoryLookup?.[id] ?? id}
              <button onClick={() => _removeCategory(id)} aria-label="Remove category">×</button>
            </Badge>
          ))}

          {/* Conditions */}
          {conditions.map((c) => (
            <Badge key={`cond-${c}`} variant="secondary" className="gap-1">
              {conditionLabel(c)}
              <button onClick={() => _removeCondition(c)} aria-label="Remove condition">×</button>
            </Badge>
          ))}

          {/* Stock status */}
          {hasStock && (
            <Badge variant="secondary" className="gap-1">
              {stockLabel(filter.stockStatus)}
              <button onClick={_clearStock} aria-label="Clear stock status">×</button>
            </Badge>
          )}

          {/* Price range */}
          {hasPrice && (
            <Badge variant="secondary" className="gap-1">
              {`${filter.minPrice ?? 0}–${filter.maxPrice ?? "∞"}`}
              <button onClick={_clearPrice} aria-label="Clear price">×</button>
            </Badge>
          )}

          {/* Facet values */}
          {facetFilters.map((ff) => (
            <Badge key={`fv-${ff.facetValueId}`} variant="secondary" className="gap-1">
              {facetValueLookup?.[ff.facetValueId] ?? ff.facetValueId}
              <button onClick={() => _removeFacet(ff.facetValueId)} aria-label="Remove facet">×</button>
            </Badge>
          ))}

          {/* Clear all (optional) */}
          {activeFiltersCount > 0 && (
            <Badge variant="outline" className="gap-1 cursor-pointer" onClick={_clearAll}>
              Clear all
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
