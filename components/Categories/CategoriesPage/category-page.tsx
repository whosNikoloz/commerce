"use client"

import { useState, useMemo } from "react"
import ProductFilters from "./ProductFilters"
import ProductGrid from "./ProductGrid"
import ProductPagination from "./ProductPagination"
import ProductHeader from "./ProductHeader"
import { Product, Filters, Subcategory } from "../types"

const products: Product[] = [
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

const subcategories: Subcategory[] = [
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

export default function CategoryPage() {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    brands: [],
    colors: [],
    rating: 0,
    inStockOnly: false,
    subcategory: "",
  })

  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
          {/* Filters */}
          <ProductFilters
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            subcategories={subcategories}
            brands={brands}
            colors={colors}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Main Content */}
          <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <ProductHeader
              title="Electronics & Gadgets"
              productCount={sortedProducts.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filters={filters}
              onFilterChange={handleFilterChange}
              activeFiltersCount={activeFiltersCount}
            />

            {/* Products Grid */}
            <ProductGrid products={paginatedProducts} viewMode={viewMode} />

            {/* Pagination */}
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
