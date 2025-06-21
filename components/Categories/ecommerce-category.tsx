"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ChevronDown, Grid, List, Heart, Star, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Card, CardBody } from "@heroui/card"

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.5,
    reviews: 128,
    brand: "TechSound",
    category: "Audio",
    subcategory: "Headphones",
    color: "Black",
    size: "One Size",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.8,
    reviews: 89,
    brand: "FitTech",
    category: "Electronics",
    subcategory: "Wearables",
    color: "Silver",
    size: "42mm",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.2,
    reviews: 256,
    brand: "EcoWear",
    category: "Clothing",
    subcategory: "T-Shirts",
    color: "White",
    size: "M",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 4,
    name: "Professional Camera Lens",
    price: 599.99,
    originalPrice: 699.99,
    rating: 4.9,
    reviews: 45,
    brand: "PhotoPro",
    category: "Photography",
    subcategory: "Lenses",
    color: "Black",
    size: "85mm",
    inStock: false,
    image: "/img1.jpg",
  },
  {
    id: 5,
    name: "Gaming Mechanical Keyboard",
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.6,
    reviews: 312,
    brand: "GameTech",
    category: "Gaming",
    subcategory: "Keyboards",
    color: "RGB",
    size: "Full Size",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 6,
    name: "Yoga Mat Premium",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.4,
    reviews: 178,
    brand: "ZenFit",
    category: "Sports",
    subcategory: "Yoga",
    color: "Purple",
    size: "6mm",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 7,
    name: "Stainless Steel Water Bottle",
    price: 19.99,
    originalPrice: 29.99,
    rating: 4.3,
    reviews: 445,
    brand: "HydroLife",
    category: "Sports",
    subcategory: "Bottles",
    color: "Blue",
    size: "750ml",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 8,
    name: "LED Desk Lamp",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.1,
    reviews: 92,
    brand: "BrightHome",
    category: "Home",
    subcategory: "Lighting",
    color: "White",
    size: "Adjustable",
    inStock: true,
    image: "/img1.jpg",
  },
  {
    id: 9,
    name: "Wireless Phone Charger",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.0,
    reviews: 167,
    brand: "ChargeFast",
    category: "Electronics",
    subcategory: "Chargers",
    color: "Black",
    size: "10W",
    inStock: true,
    image: "/img1.jpg",
  },
]

const subcategories = [
  { name: "Headphones", count: 24 },
  { name: "Wearables", count: 18 },
  { name: "T-Shirts", count: 156 },
  { name: "Lenses", count: 12 },
  { name: "Keyboards", count: 34 },
  { name: "Yoga", count: 28 },
  { name: "Bottles", count: 45 },
  { name: "Lighting", count: 67 },
  { name: "Chargers", count: 89 },
]

const brands = [
  "TechSound",
  "FitTech",
  "EcoWear",
  "PhotoPro",
  "GameTech",
  "ZenFit",
  "HydroLife",
  "BrightHome",
  "ChargeFast",
]
const colors = ["Black", "White", "Silver", "Blue", "Purple", "RGB", "Red", "Green"]

interface Filters {
  priceRange: [number, number]
  brands: string[]
  colors: string[]
  rating: number
  inStockOnly: boolean
  subcategory: string
}

// Sidebar content component moved outside to prevent recreation
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
  subcategories: { name: string; count: number }[]
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

export default function Component() {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    brands: [] as string[],
    colors: [] as string[],
    rating: 0,
    inStockOnly: false,
    subcategory: "",
  })

  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const itemsPerPage = 6

  const handleFilterChange = (filterType: string, value: string | number | boolean | number[]) => {
    setFilters((prev) => {
      if (filterType === "brands" || filterType === "colors") {
        const currentValues = prev[filterType] as string[]
        const newValues = currentValues.includes(value as string)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value as string]
        return { ...prev, [filterType]: newValues }
      }
      return { ...prev, [filterType]: value }
    })
    setCurrentPage(1) // Reset to first page when filters change
  }

  const filteredProducts = useMemo(() => {
    console.log(filters)
    return products.filter((product) => {
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false
      }

      // Color filter
      if (filters.colors.length > 0 && !filters.colors.includes(product.color)) {
        return false
      }

      // Rating filter
      if (product.rating < filters.rating) {
        return false
      }

      // Stock filter
      if (filters.inStockOnly && !product.inStock) {
        return false
      }

      // Subcategory filter
      if (filters.subcategory && product.subcategory !== filters.subcategory) {
        return false
      }

      return true
    })
  }, [filters])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "newest":
        return sorted.sort((a, b) => b.id - a.id)
      default:
        return sorted
    }
  }, [filteredProducts, sortBy])

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      brands: [],
      colors: [],
      rating: 0,
      inStockOnly: false,
      subcategory: "",
    })
    setCurrentPage(1)
  }

  const activeFiltersCount =
    filters.brands.length +
    filters.colors.length +
    (filters.subcategory ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
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

          {/* Main Content */}
          <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">Electronics & Gadgets</h1>
                  <p className="text-sm lg:text-base text-muted-foreground">{sortedProducts.length} products found</p>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[120px] lg:min-w-[140px]">
                        <span className="hidden sm:inline">Sort by</span>
                        <span className="sm:hidden">Sort</span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
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
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
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
                      <button onClick={() => handleFilterChange("subcategory", "")}>×</button>
                    </Badge>
                  )}
                  {filters.brands.map((brand) => (
                    <Badge key={brand} variant="secondary" className="gap-1">
                      {brand}
                      <button onClick={() => handleFilterChange("brands", brand)}>×</button>
                    </Badge>
                  ))}
                  {filters.colors.map((color) => (
                    <Badge key={color} variant="secondary" className="gap-1">
                      {color}
                      <button onClick={() => handleFilterChange("colors", color)}>×</button>
                    </Badge>
                  ))}
                  {filters.rating > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.rating}+ Stars
                      <button onClick={() => handleFilterChange("rating", 0)}>×</button>
                    </Badge>
                  )}
                  {filters.inStockOnly && (
                    <Badge variant="secondary" className="gap-1">
                      In Stock
                      <button onClick={() => handleFilterChange("inStockOnly", false)}>×</button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div
              className={
                viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" : "space-y-4"
              }
            >
              {paginatedProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardBody className={viewMode === "grid" ? "p-3 lg:p-4" : "p-3 lg:p-4 flex gap-4"}>
                    <div className={viewMode === "grid" ? "space-y-3" : "flex-shrink-0"}>
                      <div className="relative">
                        <Image
                          src={product.image || "/img1.jpg"}
                          alt={product.name}
                          width={viewMode === "grid" ? 300 : 120}
                          height={viewMode === "grid" ? 300 : 120}
                          className={`object-cover rounded-md ${
                            viewMode === "grid" ? "w-full aspect-square" : "w-20 h-20 sm:w-30 sm:h-30"
                          }`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8"
                        >
                          <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Button>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                            <span className="text-white font-semibold text-xs lg:text-sm">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={viewMode === "grid" ? "space-y-2" : "flex-1 space-y-1 lg:space-y-2"}>
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm lg:text-base line-clamp-2">{product.name}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base lg:text-lg">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs lg:text-sm text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {product.brand} • {product.color} • {product.size}
                      </div>

                      <Button
                        className="w-full"
                        disabled={!product.inStock}
                        size={viewMode === "grid" ? "default" : "sm"}
                      >
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 lg:gap-2 mt-6 lg:mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  className="lg:size-default"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className="w-8 lg:w-10"
                        size="sm"
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-1 lg:px-2">
                        ...
                      </span>
                    )
                  }
                  return null
                })}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  className="lg:size-default"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
