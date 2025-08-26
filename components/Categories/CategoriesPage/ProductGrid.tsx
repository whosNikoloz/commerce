"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Clock3, Tag, ShoppingCart, Eye, ChevronRight } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { useState, memo } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";
import { CartItem, useCart } from "@/app/context/cartContext";

interface ProductGridProps {
  products: ProductResponseModel[];
  viewMode: "grid" | "list";
}

function formatCondition(c: Condition) {
  switch (c) {
    case Condition.New:
      return "New";
    case Condition.Used:
      return "Used";
    case Condition.LikeNew:
      return "Like New";
    default:
      return "";
  }
}

function formatPrice(p?: number) {
  if (typeof p !== "number") return "";

  return `$${p.toFixed(2)}`;
}

// ✅ Memoized card to cut re-renders
const ProductCard = memo(function ProductCard({
  product,
  viewMode,
  onAdd,
  selectedImageIndex,
  onSelectImage,
}: {
  product: ProductResponseModel;
  viewMode: "grid" | "list";
  onAdd: (id: string) => void;
  selectedImageIndex: number;
  onSelectImage: (productId: string, idx: number) => void;
}) {
  const images = product.images && product.images.length > 0 ? product.images : ["/img1.jpg"];
  const currentImage = images[selectedImageIndex];
  const inStock = product.status === StockStatus.InStock;
  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : undefined;

  const size = product.productFacetValues?.find(
    (f) => f.facetName?.toLowerCase() === "size",
  )?.facetValue;
  const color = product.productFacetValues?.find(
    (f) => f.facetName?.toLowerCase() === "color",
  )?.facetValue;
  const metaLine = [product.brand?.name, color, size, formatCondition(product.condition)]
    .filter(Boolean)
    .join(" • ");

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
    <article itemScope itemType="https://schema.org/Product">
      <meta content={product.name ?? "Product"} itemProp="name" />
      {images?.[0] && <meta content={images[0]} itemProp="image" />}
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-900 rounded-2xl">
        <CardBody className={viewMode === "grid" ? "p-0" : "p-4 flex gap-4"}>
          {viewMode === "grid" ? (
            <div className="relative">
              <div className="relative overflow-hidden rounded-t-2xl">
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

                <Link prefetch href={`/product/${product.id}`} itemProp="url">
                  <div className="relative group/image rounded-t-2xl overflow-hidden">
                    <Image
                      alt={product.name ?? "Product image"}
                      className={`w-full ${viewMode === "grid" ? "aspect-square" : "h-40"} object-cover transition-transform duration-500 group-hover:scale-105`}
                      height={250}
                      src={currentImage}
                      width={250}
                      loading="lazy"
                    // Priority for above-the-fold first few cards is handled by Next.js automatically in list; keep lazy here
                    />
                  </div>
                </Link>

                {images.length > 1 && (
                  <>
                    <button
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectImage(
                          product.id,
                          (selectedImageIndex - 1 + images.length) % images.length,
                        );
                      }}
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectImage(product.id, (selectedImageIndex + 1) % images.length);
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.name ?? "Unnamed Product"}
                  </h3>
                  {metaLine && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{metaLine}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    itemScope
                    className="font-bold text-2xl text-gray-900 dark:text-white"
                    itemProp="offers"
                    itemType="https://schema.org/Offer"
                  >
                    <meta content="USD" itemProp="priceCurrency" />
                    <span itemProp="price">{displayPrice}</span>
                  </span>
                  {typeof originalPrice === "number" && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {/* <Link prefetch href={`/product/${product.id}`}>
                    <Button
                      className="px-4 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl transition-all duration-200"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </Link> */}
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                    disabled={!inStock || showComingSoon}
                    onClick={() => onAdd(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {ctaLabel}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-full rounded-2xl bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm hover:shadow-md transition"
              role="listitem"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <Image
                    alt={product.name ?? "Product image"}
                    className="w-[88px] h-[66px] sm:w-[112px] sm:h-[84px] object-contain rounded-md bg-white"
                    height={84}
                    loading="lazy"
                    src={currentImage}
                    width={112}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="space-y-1">
                    <Link
                      prefetch
                      className="block text-[15px] sm:text-[16px] font-semibold leading-tight line-clamp-1 hover:text-brand-primary transition-colors"
                      href={`/product/${product.id}`}
                    >
                      {product.name ?? "Unnamed Product"}
                    </Link>

                    <p className="text-[13px] sm:text-[13px] text-text-subtle dark:text-text-subtledark leading-snug line-clamp-1">
                      {metaLine || "No additional information available"}
                    </p>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[20px] sm:text-[22px] font-extrabold">
                        {displayPrice} <span className="align-top text-[14px]">₾</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative self-stretch flex flex-col items-end justify-between">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                    disabled={!inStock || showComingSoon}
                    onClick={() => onAdd(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {ctaLabel}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </article>
  );
});

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const { addToCart } = useCart();
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return;
    const item: CartItem = {
      id: product.id,
      name: product.name ?? "Unnamed Product",
      price: product.discountPrice ?? product.price,
      image: product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: product.discountPrice
        ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100))
        : 0,
      originalPrice: product.price,
    };

    addToCart(item);
  };

  const handleImageSelect = (productId: string, imageIndex: number) => {
    setSelectedImages((prev) => ({ ...prev, [productId]: imageIndex }));
  };

  return (
    <div
      aria-label="Products"
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
          : "space-y-4"
      }
      role="list"
    >
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedImageIndex={selectedImages[product.id] || 0}
          viewMode={viewMode}
          onAdd={handleAddToCart}
          onSelectImage={handleImageSelect}
        />
      ))}
    </div>
  );
}
