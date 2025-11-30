"use client";

import { useState } from "react";
import { Filter, X, Search, Tag } from "lucide-react";

import { ProductGroupCategoryTree } from "./product-group-category-tree";

import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductGroupFiltersProps {
  categories: CategoryModel[];
  brands: BrandModel[];
  selectedCategoryId: string | null;
  selectedBrandId: string | null;
  onSelectCategory: (id: string | null) => void;
  onSelectBrand: (id: string | null) => void;
}

export default function ProductGroupFilters({
  categories,
  brands,
  selectedCategoryId,
  selectedBrandId,
  onSelectCategory,
  onSelectBrand,
}: ProductGroupFiltersProps) {
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  const handleBrandSelect = (brandId: string) => {
    onSelectBrand(brandId === "all" ? null : brandId);
  };

  const clearCategorySelection = () => {
    onSelectCategory(null);
  };

  const clearBrandSelection = () => {
    onSelectBrand(null);
  };

  const clearAllFilters = () => {
    onSelectCategory(null);
    onSelectBrand(null);
    setCategorySearchTerm("");
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const hasActiveFilters = selectedCategoryId !== null || selectedBrandId !== null;

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden h-full flex flex-col h-min">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-pink-500/5 pointer-events-none" />

      <CardHeader className="pb-3 relative flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-lg shadow-sm">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
              Filters
            </CardTitle>
          </div>

          {hasActiveFilters && (
            <Button
              aria-label="Clear all filters"
              className="h-7 px-2 text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              size="sm"
              variant="ghost"
              onClick={clearAllFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative flex-1 flex flex-col overflow-hidden space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Brands
              </h3>
              <Badge
                className="text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                variant="outline"
              >
                {brands.length}
              </Badge>
            </div>
            {selectedBrandId !== null && (
              <Button
                aria-label="Clear brand selection"
                className="h-6 w-6 p-0 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                size="sm"
                variant="ghost"
                onClick={clearBrandSelection}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-6">
              <Tag className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-primary text-slate-600 dark:text-slate-400 text-xs font-medium">
                No brands found
              </p>
            </div>
          ) : (
            <Select
              value={selectedBrandId || "all"}
              onValueChange={handleBrandSelect}
            >
              <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 text-slate-900 dark:text-slate-100 font-medium shadow-sm">
                <div className="flex items-center gap-2 flex-1">
                  <Tag
                    className={`h-4 w-4 ${selectedBrandId ? "text-purple-600 dark:text-purple-400" : "text-slate-500 dark:text-slate-400"}`}
                  />
                  <SelectValue placeholder="Select a brand">
                    {selectedBrand?.name || "All Brands"}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 max-h-[300px]">
                <SelectItem
                  className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30"
                  value="all"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="font-primary font-semibold">All Brands</span>
                    <Badge
                      className="ml-auto text-xs px-2 py-0.5 h-5 font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      variant="secondary"
                    >
                      {brands.length}
                    </Badge>
                  </div>
                </SelectItem>
                {brands.map((brand) => (
                  <SelectItem
                    key={brand.id}
                    className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30"
                    value={brand.id}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-primary font-semibold truncate">
                        {brand.name || "Unnamed Brand"}
                      </span>
                      {brand.origin && (
                        <Badge
                          className="ml-auto text-xs px-2 py-0.5 h-5 font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          variant="secondary"
                        >
                          {brand.origin}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex-1 flex flex-col overflow-hidden h-min">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                  Categories
                </h3>
                <Badge
                  className="text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  variant="outline"
                >
                  {categories.filter((c) => c.parentId === null).length}
                </Badge>
              </div>
              {selectedCategoryId !== null && (
                <Button
                  aria-label="Clear category selection"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  size="sm"
                  variant="ghost"
                  onClick={clearCategorySelection}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 h-3.5 w-3.5" />
              <Input
                aria-label="Search categories"
                className="pl-9 h-8 text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm"
                placeholder="Search..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
              />
            </div>

              <ProductGroupCategoryTree
                categories={categories}
                searchTerm={categorySearchTerm}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={onSelectCategory}
              />
          </div>
      </CardContent>
    </Card>
  );
}
