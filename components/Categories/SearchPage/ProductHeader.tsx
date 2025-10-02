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

type ViewMode = "grid" | "list";


interface ProductHeaderProps {
  productCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ProductHeader({
  productCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ProductHeaderProps) {
  return (
    <header>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p
            aria-live="polite"
            className="text-sm lg:text-base text-text-subtle dark:text-text-subtledark"
          >
            {productCount} products found
          </p>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Sort products"
                className="min-w-[120px] lg:min-w-[140px] text-text-light dark:text-text-lightdark border-brand-muted dark:border-brand-muteddark"
                variant="outline"
              >
                <span className="hidden sm:inline">Sort by</span>
                <span className="sm:hidden">Sort</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
            >
              <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
                <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rating">Highest Rated</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            aria-label="View mode"
            className="flex border rounded-md border-brand-muted dark:border-brand-muteddark"
            role="tablist"
          >
            <Button
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className="rounded-r-none"
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className="rounded-l-none"
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
