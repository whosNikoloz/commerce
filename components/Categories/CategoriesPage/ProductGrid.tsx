"use client"

import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardBody } from "@heroui/card"
import { Product } from "../types"

interface ProductGridProps {
  products: Product[]
  viewMode: "grid" | "list"
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  return (
    <div
      className={
        viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 bg-brand-muted dark:bg-brand-muteddark" : "space-y-4 bg-brand-muted dark:bg-brand-muteddark"
      }
    >
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow ">
          <CardBody className={viewMode === "grid" ? "p-3 lg:p-4" : "p-3 lg:p-4 flex gap-4"}>
            <div className={viewMode === "grid" ? "space-y-3" : "flex-shrink-0"}>
              <div className="relative">
                <Image
                  src={product.image || "/img1.jpg"}
                  alt={product.name}
                  width={viewMode === "grid" ? 300 : 120}
                  height={viewMode === "grid" ? 300 : 120}
                  className={`object-cover rounded-md ${viewMode === "grid" ? "w-full aspect-square" : "w-20 h-20 sm:w-30 sm:h-30"
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
                      className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
  )
} 