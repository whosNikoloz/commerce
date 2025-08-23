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
import { Condition } from "@/types/enums";

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
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
        </div>
      </div>
    </div>
  );
}
