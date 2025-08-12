"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles, Clock3, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@heroui/card";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";

interface ProductGridProps {
  products: ProductResponseModel[];
  viewMode: "grid" | "list";
}

function formatCondition(c: Condition) {
  switch (c) {
    case Condition.New: return "New";
    case Condition.Used: return "Used";
    case Condition.LikeNew: return "Like New";
    default: return "";
  }
}

function formatPrice(p?: number) {
  if (typeof p !== "number") return "";
  return `$${p.toFixed(2)}`;
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  return (
    <div className={viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      : "space-y-4"}
    >
      {products.map((product) => {
        const image = product.images?.[0] ?? "/img1.jpg";
        const inStock = product.status === StockStatus.InStock;

        const hasDiscount =
          typeof product.discountPrice === "number" &&
          product.discountPrice < product.price;

        const displayPrice = hasDiscount ? product.discountPrice! : product.price;
        const originalPrice = hasDiscount ? product.price : undefined;

        const size = product.productFacetValues?.find(
          f => f.facetName?.toLowerCase() === "size"
        )?.facetValue;
        const color = product.productFacetValues?.find(
          f => f.facetName?.toLowerCase() === "color"
        )?.facetValue;

        const metaLine = [
          product.brand?.name,
          color,
          size,
          formatCondition(product.condition)
        ].filter(Boolean).join(" • ");

        const showComingSoon = product.isComingSoon === true;
        const showNew = product.isNewArrival === true;
        const showClearance = product.isLiquidated === true;

        const discountPct = hasDiscount
          ? Math.max(0, Math.round(((product.price - product.discountPrice!) / product.price) * 100))
          : 0;

        // Decide CTA state & label
        let ctaLabel = "Add to Cart";
        let ctaDisabled = !inStock;
        if (showComingSoon) {
          ctaLabel = "Coming Soon";
          ctaDisabled = true;
        } else if (!inStock) {
          ctaLabel = "Out of Stock";
        }

        return (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-shadow bg-brand-muted dark:bg-brand-muteddark"
          >
            <CardBody className={viewMode === "grid" ? "p-3 lg:p-4" : "p-3 lg:p-4 flex gap-4"}>
              <div className={viewMode === "grid" ? "space-y-3" : "flex-shrink-0"}>
                <div className="relative">
                  {/* Ribbons / badges (top-left) */}
                  <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                    {showComingSoon && (
                      <Badge className="bg-yellow-500 text-black hover:bg-yellow-500">
                        <Clock3 className="h-3 w-3 mr-1" /> Coming Soon
                      </Badge>
                    )}
                    {showNew && (
                      <Badge className="bg-green-600 text-white hover:bg-green-600">
                        <Sparkles className="h-3 w-3 mr-1" /> New Arrival
                      </Badge>
                    )}
                    {showClearance && (
                      <Badge className="bg-red-600 text-white hover:bg-red-600">
                        <Tag className="h-3 w-3 mr-1" /> Clearance
                      </Badge>
                    )}
                    {discountPct > 0 && (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        −{discountPct}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist (top-right) */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white h-8 w-8 rounded-full"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>

                  {/* Image */}
                  <Image
                    src={image}
                    alt={product.name ?? "Product image"}
                    width={viewMode === "grid" ? 300 : 120}
                    height={viewMode === "grid" ? 300 : 120}
                    className={`object-cover rounded-md ${viewMode === "grid"
                      ? "w-full aspect-square"
                      : "w-24 h-24 sm:w-28 sm:h-28"
                      }`}
                  />

                  {/* Out of stock overlay */}
                  {!inStock && !showComingSoon && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
                      <span className="text-white font-semibold text-xs lg:text-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={viewMode === "grid" ? "space-y-2" : "flex-1 space-y-1 lg:space-y-2"}>
                {/* Name */}
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm lg:text-base line-clamp-2">
                    {product.name ?? "Unnamed Product"}
                  </h3>
                </div>

                {/* Price */}
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

                {/* Meta */}
                {metaLine && (
                  <div className="text-xs text-muted-foreground">
                    {metaLine}
                  </div>
                )}

                {/* Status chips (under price) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {showComingSoon && <Badge variant="secondary">Coming Soon</Badge>}
                  {showNew && <Badge variant="outline">New</Badge>}
                  {showClearance && <Badge className="bg-red-600 text-white hover:bg-red-600">Clearance</Badge>}
                </div>

                {/* Actions */}
                <div className="mt-2 flex flex-col gap-2">
                  <Button className="w-full" disabled={ctaDisabled} size={viewMode === "grid" ? "default" : "sm"}>
                    {ctaLabel}
                  </Button>

                  <Link href={`/product/${product.id}#reviews`} className="w-full">
                    <Button className="w-full" variant="outline" size={viewMode === "grid" ? "default" : "sm"}>
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
