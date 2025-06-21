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
import { Filters } from "../types"

interface ProductHeaderProps {
  title: string
  productCount: number
  sortBy: string
  onSortChange: (sort: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  filters: Filters
  onFilterChange: (filterType: string, value: string | number | boolean | number[]) => void
  activeFiltersCount: number
}

export default function ProductHeader({
  title,
  productCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  activeFiltersCount
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold">{title}</h1>
          <p className="text-sm lg:text-base text-muted-foreground">{productCount} products found</p>
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
        </div>
      </div>

      {/* Active Filters */}
      {(filters.brands.length > 0 ||
        filters.colors.length > 0 ||
        filters.subcategory ||
        filters.rating > 0 ||
        filters.inStockOnly) && (
        <div className="flex flex-wrap gap-2">
          {filters.subcategory && (
            <Badge variant="secondary" className="gap-1">
              {filters.subcategory}
              <button onClick={() => onFilterChange("subcategory", "")}>×</button>
            </Badge>
          )}
          {filters.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <button onClick={() => onFilterChange("brands", brand)}>×</button>
            </Badge>
          ))}
          {filters.colors.map((color) => (
            <Badge key={color} variant="secondary" className="gap-1">
              {color}
              <button onClick={() => onFilterChange("colors", color)}>×</button>
            </Badge>
          ))}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {filters.rating}+ Stars
              <button onClick={() => onFilterChange("rating", 0)}>×</button>
            </Badge>
          )}
          {filters.inStockOnly && (
            <Badge variant="secondary" className="gap-1">
              In Stock
              <button onClick={() => onFilterChange("inStockOnly", false)}>×</button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
} 