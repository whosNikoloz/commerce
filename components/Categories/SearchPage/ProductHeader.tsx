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
    <header className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border/40 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Search Results
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
        </div>
      </div>
    </header>
  );
}
