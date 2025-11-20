"use client";

import { Tag, Filter, X } from "lucide-react";

import { BrandModel } from "@/types/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrandFilterProps {
  brands: BrandModel[];
  selectedBrandId: string | null;
  onSelectBrand: (id: string | null) => void;
}

export default function BrandFilter({
  brands,
  selectedBrandId,
  onSelectBrand,
}: BrandFilterProps) {
  const handleBrandSelect = (brandId: string) => {
    // "all" is treated as null
    onSelectBrand(brandId === "all" ? null : brandId);
  };

  const clearSelection = () => {
    onSelectBrand(null);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-sm">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
              Brands
            </CardTitle>
            <Badge
              className="text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
              variant="outline"
            >
              {brands.length}
            </Badge>
          </div>

          {selectedBrandId !== null && (
            <Button
              aria-label="Clear selection"
              className="h-7 w-7 p-0 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative">
        {brands.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No brands found</p>
          </div>
        ) : (
          <Select
            value={selectedBrandId || "all"}
            onValueChange={handleBrandSelect}
          >
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500 text-slate-900 dark:text-slate-100 font-medium shadow-sm">
              <div className="flex items-center gap-2 flex-1">
                <Tag className={`h-4 w-4 ${selectedBrandId ? "text-purple-600 dark:text-purple-400" : "text-slate-500 dark:text-slate-400"}`} />
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
                  <span className="font-semibold">All Brands</span>
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
                    <span className="font-semibold truncate">{brand.name || "Unnamed Brand"}</span>
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
      </CardContent>
    </Card>
  );
}
