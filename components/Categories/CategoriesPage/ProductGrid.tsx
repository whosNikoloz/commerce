"use client"

import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@heroui/card"
import { ProductResponseModel } from "@/types/product"
import { StockStatus, Condition } from "@/types/enums"

interface ProductGridProps {
  products: ProductResponseModel[]
  viewMode: "grid" | "list"
}

function formatCondition(c: Condition) {
  switch (c) {
    case Condition.New: return "New"
    case Condition.Used: return "Used"
    case Condition.LikeNew: return "Like New"
    default: return ""
  }
}

function formatPrice(p: number | undefined) {
  if (typeof p !== "number") return ""
  return `$${p.toFixed(2)}`
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  console.log("Products", products)


  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
          : "space-y-4"
      }
    >
      {products.map((product) => {
        const image = product.images?.[0] ?? "/img1.jpg"
        const inStock = product.status === StockStatus.InStock

        const hasDiscount = typeof product.discountPrice === "number" && product.discountPrice! < product.price
        const displayPrice = hasDiscount ? product.discountPrice! : product.price
        const originalPrice = hasDiscount ? product.price : undefined

        const size = product.productFacetValues?.find(f => f.facetName?.toLowerCase() === "size")?.facetValue
        const color = product.productFacetValues?.find(f => f.facetName?.toLowerCase() === "color")?.facetValue

        const metaLine = [
          product.brand?.name,
          color,
          size,
          formatCondition(product.condition)
        ].filter(Boolean).join(" • ")

        return (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow  bg-brand-muted dark:bg-brand-muteddark">
            <CardBody className={viewMode === "grid" ? "p-3 lg:p-4" : "p-3 lg:p-4 flex gap-4"}>
              <div className={viewMode === "grid" ? "space-y-3" : "flex-shrink-0"}>
                <div className="relative">
                  <Image
                    src={image}
                    alt={product.name ?? "Product image"}
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
                  {!inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                      <span className="text-white font-semibold text-xs lg:text-sm">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={viewMode === "grid" ? "space-y-2" : "flex-1 space-y-1 lg:space-y-2"}>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm lg:text-base line-clamp-2">
                    {product.name ?? "Unnamed Product"}
                  </h3>
                </div>

                {/* ფასი */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base lg:text-lg">
                    {formatPrice(displayPrice)}
                  </span>
                  {typeof originalPrice === "number" && (
                    <span className="text-xs lg:text-sm text-muted-foreground line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>

                {/* ბრენდი / ფეისეტები / მდგომარეობა */}
                {metaLine && (
                  <div className="text-xs text-muted-foreground">
                    {metaLine}
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!inStock}
                  size={viewMode === "grid" ? "default" : "sm"}
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
