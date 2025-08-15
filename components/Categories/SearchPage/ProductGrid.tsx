"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles, Clock3, Tag, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@heroui/card";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";
import { CartItem, useCart } from "@/app/context/cartContext";
import { useState } from "react";

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
  const { addToCart } = useCart();
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const item: CartItem = {
      id: product.id,
      name: product.name ?? "Unnamed Product",
      price: product.discountPrice ?? product.price,
      image: product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: product.discountPrice ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100)) : 0,
      originalPrice: product.price,
    };

    addToCart(item);
  }

  const handleImageSelect = (productId: string, imageIndex: number) => {
    setSelectedImages(prev => ({
      ...prev,
      [productId]: imageIndex
    }));
  };

  return (
    <div className={viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
      : "space-y-4"}
    >
      {products.map((product) => {
        const images = product.images && product.images.length > 0 ? product.images : ["/img1.jpg"];
        const selectedImageIndex = selectedImages[product.id] || 0;
        const currentImage = images[selectedImageIndex];
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
            className="group relative overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-900 rounded-2xl"
          >
            <CardBody className={viewMode === "grid" ? "p-0" : "p-4 flex gap-4"}>
              {viewMode === "grid" ? (
                // Grid Layout
                <div className="relative">
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    {/* Status Badges */}
                    <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
                      {showComingSoon && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg backdrop-blur-sm">
                          <Clock3 className="h-3 w-3 mr-1" /> Coming Soon
                        </Badge>
                      )}
                      {showNew && (
                        <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-lg backdrop-blur-sm">
                          <Sparkles className="h-3 w-3 mr-1" /> New
                        </Badge>
                      )}
                      {showClearance && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg backdrop-blur-sm">
                          <Tag className="h-3 w-3 mr-1" /> Clearance
                        </Badge>
                      )}
                      {discountPct > 0 && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg backdrop-blur-sm font-bold">
                          −{discountPct}%
                        </Badge>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 h-9 w-9 rounded-full shadow-lg border-0 transition-all duration-200"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="h-4 w-4 text-gray-600 group-hover:text-red-500 transition-colors" />
                    </Button>

                    {/* Product Image */}
                    {/* Product Image Carousel */}
                    <div className="relative group/image rounded-t-2xl overflow-hidden">
                      <Image
                        src={currentImage}
                        alt={product.name ?? "Product image"}
                        width={400}
                        height={400}
                        className={`w-full ${viewMode === "grid" ? "aspect-square" : "h-40"} object-cover transition-transform duration-500 group-hover:scale-105`}
                      />

                      {/* Left Arrow */}
                      {images.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageSelect(
                              product.id,
                              (selectedImageIndex - 1 + images.length) % images.length
                            );
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-colors"
                        >
                          &#8592;
                        </button>
                      )}

                      {/* Right Arrow */}
                      {images.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageSelect(
                              product.id,
                              (selectedImageIndex + 1) % images.length
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-colors"
                        >
                          &#8594;
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Product Title */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name ?? "Unnamed Product"}
                      </h3>
                      {metaLine && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {metaLine}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-2xl text-gray-900 dark:text-white">
                        {formatPrice(displayPrice)}
                      </span>
                      {typeof originalPrice === "number" && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                        disabled={ctaDisabled}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {ctaLabel}
                      </Button>

                      <Link href={`/product/${product.id}#reviews`}>
                        <Button
                          variant="outline"
                          className="px-4 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="group flex w-full items-stretch p-3 sm:p-4 gap-3 sm:gap-4 flex-col sm:flex-row">
                  {/* Image Section */}
                  <div className="relative w-full sm:w-52 lg:w-64">
                    {/* Status Badges */}
                    <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
                      {showComingSoon && (
                        <Badge className="bg-yellow-500 text-black border-0 text-[10px] sm:text-xs font-bold px-2 py-1">
                          Coming Soon
                        </Badge>
                      )}
                      {showNew && (
                        <Badge className="bg-green-600 text-white border-0 text-[10px] sm:text-xs font-bold px-2 py-1 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {showClearance && (
                        <Badge className="bg-red-600 text-white border-0 text-[10px] sm:text-xs font-bold px-2 py-1 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          Clearance
                        </Badge>
                      )}
                      {discountPct > 0 && (
                        <Badge className="bg-orange-500 text-white border-0 text-[10px] sm:text-xs font-bold px-2 py-1">
                          -{discountPct}%
                        </Badge>
                      )}
                    </div>

                    {/* Product Image */}
                    <Image
                      src={currentImage}
                      alt={product.name ?? "Product image"}
                      width={800}
                      height={600}
                      className="
                        w-full 
                        h-44 xs:h-48 sm:h-40 lg:h-44 
                        object-cover rounded-lg shadow-md 
                        transition-transform duration-300 group-hover:scale-[1.02]
                      "
                    />

                    {/* Left Arrow */}
                    {images.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageSelect(
                            product.id,
                            (selectedImageIndex - 1 + images.length) % images.length
                          );
                        }}
                        className="
                          absolute left-2 top-1/2 -translate-y-1/2 
                          bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg 
                          transition-colors
                        "
                        aria-label="Previous image"
                      >
                        &#8592;
                      </button>
                    )}

                    {/* Right Arrow */}
                    {images.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageSelect(product.id, (selectedImageIndex + 1) % images.length);
                        }}
                        className="
                          absolute right-2 top-1/2 -translate-y-1/2 
                          bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg 
                          transition-colors
                        "
                        aria-label="Next image"
                      >
                        &#8594;
                      </button>
                    )}

                    {/* Out of stock overlay */}
                    {!inStock && !showComingSoon && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                        <span className="text-white font-semibold text-sm text-center">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between mt-2 sm:mt-0">
                    <div className="space-y-2">
                      {/* Title */}
                      <h3
                        className="
                          font-bold text-gray-900 dark:text-white 
                          text-base sm:text-lg lg:text-xl 
                          line-clamp-2 
                          group-hover:text-blue-600 dark:group-hover:text-blue-400 
                          transition-colors leading-tight
                        "
                      >
                        {product.name ?? "Unnamed Product"}
                      </h3>

                      {/* Description/Meta */}
                      <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                        {metaLine ||
                          "High-quality product with excellent features and specifications designed for your needs."}
                      </p>
                    </div>

                    {/* Bottom section with price and actions */}
                    <div
                      className="
                        flex flex-col sm:flex-row sm:items-end sm:justify-between 
                        gap-3 sm:gap-4 
                        mt-3 sm:mt-4 pt-3 
                        border-t border-gray-100 dark:border-gray-700
                      "
                    >
                      {/* Price Section */}
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-white">
                            {formatPrice(displayPrice)}
                          </span>
                          {typeof originalPrice === "number" && (
                            <span className="text-sm sm:text-lg text-gray-400 line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] sm:text-xs text-gray-500 mt-1">
                          Free shipping available
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                            h-9 w-9 sm:h-10 sm:w-10 
                            bg-gray-100 hover:bg-gray-200 rounded-full 
                            transition-all duration-200
                          "
                          aria-label="Add to wishlist"
                        >
                          <Heart className="h-4 w-4 text-gray-600" />
                        </Button>

                        <Link href={`/product/${product.id}`} className="shrink-0">
                          <Button
                            variant="outline"
                            className="
                              h-9 sm:h-10 px-3 sm:px-4 
                              border-2 border-gray-300 
                              hover:border-blue-500 hover:text-blue-600 
                              hover:bg-blue-50 dark:hover:bg-blue-950 
                              rounded-lg transition-all duration-200
                            "
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="text-sm sm:text-[15px]">Quick View</span>
                          </Button>
                        </Link>

                        <Button
                          className="
                            h-10 sm:h-10 px-4 sm:px-6 
                            bg-gradient-to-r from-blue-600 to-blue-700 
                            hover:from-blue-700 hover:to-blue-800 
                            text-white border-0 rounded-lg font-medium 
                            shadow-lg hover:shadow-xl transition-all duration-200
                          "
                          disabled={ctaDisabled}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          <span className="text-sm sm:text-[15px]">{ctaLabel}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}