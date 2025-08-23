"use client";

import { ChevronDown, Grid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FilterModel } from "@/types/filter";
import { Condition, StockStatus } from "@/types/enums";

type ViewMode = "grid" | "list";

function conditionLabel(c: Condition) {
  switch (c) {
    case Condition.New:
      return "New";
    case Condition.Used:
      return "Used";
    case Condition.LikeNew:
      return "Like New";
    default:
      return String(c);
  }
}

function stockLabel(s?: StockStatus) {
  if (s === undefined) return "";

  return s === StockStatus.InStock ? "In Stock" : "Out of Stock";
}

interface ProductHeaderProps {
  title: string;
  productCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;

  // ✅ Real filter model
  filter: FilterModel;

  // ✅ Optional lookups for pretty chip labels (fallback to IDs if omitted)
  brandLookup?: Record<string, string>;
  categoryLookup?: Record<string, string>;
  facetValueLookup?: Record<string, string>;

  // ✅ Either use granular callbacks...
  onRemoveBrand?: (id: string) => void;
  onRemoveCategory?: (id: string) => void;
  onRemoveCondition?: (c: Condition) => void;
  onClearStockStatus?: () => void;
  onClearPrice?: () => void;
  onRemoveFacet?: (facetValueId: string) => void;
  onClearAll?: () => void;

  // ...or keep your old single handler (we’ll fallback to it if provided)
  onFilterChange?: (filterType: string, value: string | number | boolean | number[]) => void;

  activeFiltersCount: number;
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
  const brandIds = filter.brandIds ?? [];
  const categoryIds = filter.categoryIds ?? [];
  const conditions = filter.condition ?? [];
  const facetFilters = filter.facetFilters ?? [];
  const hasPrice = filter.minPrice !== undefined || filter.maxPrice !== undefined;
  const hasStock = filter.stockStatus !== undefined;

  const hasAnyChip =
    brandIds.length > 0 ||
    categoryIds.length > 0 ||
    conditions.length > 0 ||
    hasStock ||
    hasPrice ||
    facetFilters.length > 0;

  // ---- Fallback shims if only onFilterChange is provided ----
  const _removeBrand = (id: string) =>
    onRemoveBrand ? onRemoveBrand(id) : onFilterChange?.("brandIds:remove", id);
  const _removeCategory = (id: string) =>
    onRemoveCategory ? onRemoveCategory(id) : onFilterChange?.("categoryIds:remove", id);
  const _removeCondition = (c: Condition) =>
    onRemoveCondition ? onRemoveCondition(c) : onFilterChange?.("condition:remove", c);
  const _clearStock = () =>
    onClearStockStatus ? onClearStockStatus() : onFilterChange?.("stockStatus:clear", "");
  const _clearPrice = () => (onClearPrice ? onClearPrice() : onFilterChange?.("price:clear", ""));
  const _removeFacet = (id: string) =>
    onRemoveFacet ? onRemoveFacet(id) : onFilterChange?.("facetFilters:remove", id);
  const _clearAll = () => (onClearAll ? onClearAll() : onFilterChange?.("all:clear", ""));

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
              <Button className="min-w-[120px] lg:min-w-[140px]" variant="outline">
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
              className="rounded-r-none"
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              className="rounded-l-none"
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {activeFiltersCount > 0 && (
            <Badge className="ml-1" variant="secondary">
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
            <Badge key={`b-${id}`} className="gap-1" variant="secondary">
              {brandLookup?.[id] ?? id}
              <button aria-label="Remove brand" onClick={() => _removeBrand(id)}>
                ×
              </button>
            </Badge>
          ))}

          {/* Categories */}
          {categoryIds.map((id) => (
            <Badge key={`c-${id}`} className="gap-1" variant="secondary">
              {categoryLookup?.[id] ?? id}
              <button aria-label="Remove category" onClick={() => _removeCategory(id)}>
                ×
              </button>
            </Badge>
          ))}

          {/* Conditions */}
          {conditions.map((c) => (
            <Badge key={`cond-${c}`} className="gap-1" variant="secondary">
              {conditionLabel(c)}
              <button aria-label="Remove condition" onClick={() => _removeCondition(c)}>
                ×
              </button>
            </Badge>
          ))}

          {/* Stock status */}
          {hasStock && (
            <Badge className="gap-1" variant="secondary">
              {stockLabel(filter.stockStatus)}
              <button aria-label="Clear stock status" onClick={_clearStock}>
                ×
              </button>
            </Badge>
          )}

          {/* Price range */}
          {hasPrice && (
            <Badge className="gap-1" variant="secondary">
              {`${filter.minPrice ?? 0}–${filter.maxPrice ?? "∞"}`}
              <button aria-label="Clear price" onClick={_clearPrice}>
                ×
              </button>
            </Badge>
          )}

          {/* Facet values */}
          {facetFilters.map((ff) => (
            <Badge key={`fv-${ff.facetValueId}`} className="gap-1" variant="secondary">
              {facetValueLookup?.[ff.facetValueId] ?? ff.facetValueId}
              <button aria-label="Remove facet" onClick={() => _removeFacet(ff.facetValueId)}>
                ×
              </button>
            </Badge>
          ))}

          {/* Clear all (optional) */}
          {activeFiltersCount > 0 && (
            <Badge className="gap-1 cursor-pointer" variant="outline" onClick={_clearAll}>
              Clear all
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
