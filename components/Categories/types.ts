export interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  brand: string
  category: string
  subcategory: string
  color: string
  size: string
  inStock: boolean
  image: string
}

export interface Filters {
  priceRange: [number, number]
  brands: string[]
  colors: string[]
  rating: number
  inStockOnly: boolean
  subcategory: string
}

export interface Subcategory {
  name: string
  count: number
} 