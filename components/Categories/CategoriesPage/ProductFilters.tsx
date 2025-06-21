"use client"

import { useState } from "react"
import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet"
import { Input } from "../../ui/input"
import { Checkbox } from "../../ui/checkbox"
import { Badge } from "../../ui/badge"
import { Star } from "lucide-react"
import { Filters, Subcategory } from "../types"

interface ProductFiltersProps {
  filters: Filters
  handleFilterChange: (filterType: string, value: string | number | boolean | number[]) => void
  clearFilters: () => void
  subcategories: Subcategory[]
  brands: string[]
  colors: string[]
  activeFiltersCount: number
}

// Sidebar content component
const SidebarContent = ({ 
  filters, 
  handleFilterChange, 
  clearFilters, 
  subcategories, 
  brands, 
  colors 
}: {
  filters: Filters
  handleFilterChange: (filterType: string, value: string | number | boolean | number[]) => void
  clearFilters: () => void
  subcategories: Subcategory[]
  brands: string[]
  colors: string[]
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <div className="space-y-2">
        {subcategories.map((sub) => (
          <button
            key={sub.name}
            onClick={() => handleFilterChange("subcategory", filters.subcategory === sub.name ? "" : sub.name)}
            className={`flex items-center justify-between w-full p-2 text-left rounded-md hover:bg-muted transition-colors ${
              filters.subcategory === sub.name ? "bg-muted" : ""
            }`}
          >
            <span className="text-sm">{sub.name}</span>
            <span className="text-xs text-muted-foreground">({sub.count})</span>
          </button>
        ))}
      </div>
    </div>

    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="price">
        <AccordionTrigger>Price Range</AccordionTrigger>
        <AccordionContent>
          <div
            className="space-y-4"
            onPointerDown={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Slider
              value={filters.priceRange}
              onValueChange={(value: number[]) => {
                handleFilterChange("priceRange", value)
              }}
              max={1000}
              min={0}
              step={10}
              className="w-full"
              defaultValue={[0, 1000]}
            />
            <div className="flex items-center justify-between text-sm">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0].toString()}
                onChange={(e) =>
                  handleFilterChange("priceRange", [Number.parseInt(e.target.value) || 0, filters.priceRange[1]])
                }
                className="w-20"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1].toString()}
                onChange={(e) =>
                  handleFilterChange("priceRange", [filters.priceRange[0], Number.parseInt(e.target.value) || 1000])
                }
                className="w-20"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="brands">
        <AccordionTrigger>Brands</AccordionTrigger>
        <AccordionContent>
          <div 
            className="space-y-3"
            onPointerDown={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => {
                    handleFilterChange("brands", brand)
                  }}
                />
                <label 
                  htmlFor={brand} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="colors">
        <AccordionTrigger>Colors</AccordionTrigger>
        <AccordionContent>
          <div 
            className="space-y-3"
            onPointerDown={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={color}
                  checked={filters.colors.includes(color)}
                  onCheckedChange={(checked) => {
                    handleFilterChange("colors", color)
                  }}
                />
                <label 
                  htmlFor={color} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {color}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rating">
        <AccordionTrigger>Rating</AccordionTrigger>
        <AccordionContent>
          <div 
            className="space-y-3"
            onPointerDown={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {[4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={(e) => {
                  e.stopPropagation()
                  handleFilterChange("rating", rating)
                }}
                className={`flex items-center space-x-2 w-full p-2 rounded-md hover:bg-muted transition-colors ${
                  filters.rating === rating ? "bg-muted" : ""
                }`}
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm">& Up</span>
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <div 
      className="space-y-3"
      onPointerDown={(e) => e.stopPropagation()}
      onFocusCapture={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={filters.inStockOnly}
          onCheckedChange={(checked: any) => handleFilterChange("inStockOnly", checked)}
        />
        <label 
          htmlFor="inStock" 
          className="text-sm font-normal cursor-pointer"
        >
          In Stock Only
        </label>
      </div>
    </div>

    <Button onClick={clearFilters} variant="outline" className="w-full">
      Clear All Filters
    </Button>
  </div>
)

export default function ProductFilters({
  filters,
  handleFilterChange,
  clearFilters,
  subcategories,
  brands,
  colors,
  activeFiltersCount
}: ProductFiltersProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto border rounded-lg bg-card p-6 shadow-sm">
        <SidebarContent 
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          subcategories={subcategories}
          brands={brands}
          colors={colors}
        />
      </div>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">{activeFiltersCount}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <SidebarContent 
              filters={filters}
              handleFilterChange={handleFilterChange}
              clearFilters={clearFilters}
              subcategories={subcategories}
              brands={brands}
              colors={colors}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 