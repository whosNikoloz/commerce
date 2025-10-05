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
  filter: FilterModel;
  brandLookup?: Record<string, string>;
  categoryLookup?: Record<string, string>;
  facetValueLookup?: Record<string, string>;
  onRemoveBrand?: (id: string) => void;
  onRemoveCategory?: (id: string) => void;
  onRemoveCondition?: (c: Condition) => void;
  onClearStockStatus?: () => void;
  onClearPrice?: () => void;
  onRemoveFacet?: (facetValueId: string) => void;
  onClearAll?: () => void;
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
    <header className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border/40 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>
          <p
            aria-live="polite"
            className="text-sm lg:text-base text-muted-foreground font-medium flex items-center gap-2"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            {productCount} products found
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Sort products"
                className="min-w-[120px] lg:min-w-[140px] border-2 border-border/50 hover:border-brand-primary/40 rounded-xl shadow-md hover:shadow-lg transition-all"
                variant="outline"
              >
                <span className="hidden sm:inline font-medium">Sort by</span>
                <span className="sm:hidden font-medium">Sort</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card/95 backdrop-blur-md border-2 border-border/50 rounded-xl shadow-2xl min-w-[200px]"
            >
              <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                <DropdownMenuRadioItem value="featured" className="cursor-pointer rounded-lg hover:bg-brand-primary/10">Featured</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="newest" className="cursor-pointer rounded-lg hover:bg-brand-primary/10">Newest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-low" className="cursor-pointer rounded-lg hover:bg-brand-primary/10">Price: Low to High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-high" className="cursor-pointer rounded-lg hover:bg-brand-primary/10">Price: High to Low</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating" className="cursor-pointer rounded-lg hover:bg-brand-primary/10">Highest Rated</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            aria-label="View mode"
            className="flex border-2 border-border/50 rounded-xl overflow-hidden shadow-md bg-card/50 backdrop-blur-sm"
            role="tablist"
          >
            <Button
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`rounded-none border-0 transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white shadow-lg"
                  : "hover:bg-brand-primary/10"
              }`}
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`rounded-none border-0 transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-brand-primary to-brand-primary/90 text-white shadow-lg"
                  : "hover:bg-brand-primary/10"
              }`}
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {activeFiltersCount > 0 && (
            <Badge className="ml-1 bg-gradient-to-br from-brand-primary to-brand-primary/80 text-white shadow-lg px-2.5 py-1 text-sm font-semibold" variant="secondary">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </div>

      {hasAnyChip && (
        <nav aria-label="Active filters" className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
          {brandIds.map((id) => (
            <Badge
              key={`b-${id}`}
              className="group gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border border-brand-primary/30 text-foreground hover:from-brand-primary/20 hover:to-brand-primary/10 hover:border-brand-primary/50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
              variant="secondary"
            >
              {brandLookup?.[id] ?? id}
              <button
                aria-label={`Remove brand ${brandLookup?.[id] ?? id}`}
                className="ml-1 w-4 h-4 rounded-full bg-brand-primary/20 hover:bg-brand-primary hover:text-white flex items-center justify-center text-sm font-bold transition-all"
                onClick={() => _removeBrand(id)}
              >
                ×
              </button>
            </Badge>
          ))}

          {conditions.map((c) => (
            <Badge
              key={`cond-${c}`}
              className="gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border border-brand-primary/30 text-foreground hover:from-brand-primary/20 hover:to-brand-primary/10 hover:border-brand-primary/50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
              variant="secondary"
            >
              {conditionLabel(c)}
              <button
                aria-label="Remove condition"
                className="ml-1 w-4 h-4 rounded-full bg-brand-primary/20 hover:bg-brand-primary hover:text-white flex items-center justify-center text-sm font-bold transition-all"
                onClick={() => _removeCondition(c)}
              >
                ×
              </button>
            </Badge>
          ))}

          {hasStock && (
            <Badge
              className="gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 text-foreground hover:from-emerald-500/20 hover:to-emerald-500/10 hover:border-emerald-500/50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
              variant="secondary"
            >
              {stockLabel(filter.stockStatus)}
              <button
                aria-label="Clear stock status"
                className="ml-1 w-4 h-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
                onClick={_clearStock}
              >
                ×
              </button>
            </Badge>
          )}

          {hasPrice && (
            <Badge
              className="gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 text-foreground hover:from-purple-500/20 hover:to-purple-500/10 hover:border-purple-500/50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
              variant="secondary"
            >
              {`${filter.minPrice ?? 0}–${filter.maxPrice ?? "∞"}`}
              <button
                aria-label="Clear price"
                className="ml-1 w-4 h-4 rounded-full bg-purple-500/20 hover:bg-purple-500 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
                onClick={_clearPrice}
              >
                ×
              </button>
            </Badge>
          )}

          {facetFilters.map((ff) => {
            const id = ff.facetValueId;
            const name = facetValueLookup?.[id] ?? id;

            return (
              <Badge
                key={`fv-${id}`}
                className="gap-2 pl-3 pr-2 py-1.5 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 text-foreground hover:from-blue-500/20 hover:to-blue-500/10 hover:border-blue-500/50 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                data-facet-id={id}
                title={`${name} (${id})`}
                variant="secondary"
              >
                <span className="text-sm font-medium">{name}</span>
                <button
                  aria-label={`Remove facet ${name}`}
                  className="ml-1 w-4 h-4 rounded-full bg-blue-500/20 hover:bg-blue-500 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
                  type="button"
                  onClick={() => _removeFacet(id)}
                >
                  ×
                </button>
              </Badge>
            );
          })}

          {activeFiltersCount > 0 && (
            <Badge
              aria-label="Clear all filters"
              className="gap-2 pl-3 pr-2 py-1.5 cursor-pointer border-2 border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg font-semibold"
              variant="outline"
              onClick={_clearAll}
            >
              Clear all ✕
            </Badge>
          )}
        </nav>
      )}
    </header>
  );
}
