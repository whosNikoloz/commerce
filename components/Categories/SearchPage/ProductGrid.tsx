"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Clock3, Tag, ShoppingCart, ChevronRight } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { useState, memo, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";
import { CartItem, useCartStore } from "@/app/context/cartContext";

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

  return `${p.toFixed(2)} ₾`;
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
  const images =
    product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];
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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    align: "center",
    containScroll: "trimSnaps",
    // draggable: true (default)
    // dragFree: false (default; keeps nice snap)
  });

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(selectedImageIndex);
  }, [emblaApi, selectedImageIndex]);

  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();

    onSelectImage(product.id, idx);
  }, [emblaApi, onSelectImage, product.id]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onEmblaSelect);

    return () => {
      emblaApi.off("select", onEmblaSelect);
    };
  }, [emblaApi, onEmblaSelect]);

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  };

  const imgSrc = images?.[0];

  return (
    <article itemScope itemType="https://schema.org/Product">
      <meta content={product.name ?? "Product"} itemProp="name" />
      {images?.[0] && <meta content={images[0]} itemProp="image" />}

      <Card className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/60">
        <CardBody className={viewMode === "grid" ? "p-0" : "gap-4"}>
          {viewMode === "grid" ? (
            <div className="relative">
              <div
                aria-live="polite"
                className="relative overflow-hidden rounded-t-2xl group/image"
              >
                <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
                  {showComingSoon && (
                    <Badge className="bg-gradient-to-r from-brand-primary to-brand-primarydark text-white border-0 shadow-lg backdrop-blur-sm">
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
                    <Badge className="bg-gradient-to-r from-brand-primary to-brand-primarydark text-white border-0 shadow-lg backdrop-blur-sm font-bold">
                      −{discountPct}%
                    </Badge>
                  )}
                </div>

                <Link prefetch href={`/product/${product.id}`} itemProp="url">
                  <div ref={emblaRef} className="relative rounded-t-2xl overflow-hidden">
                    <div className="flex touch-pan-y">
                      {images.map((src, idx) => (
                        <div key={idx} className="flex-[0_0_100%]">
                          <div className="relative overflow-hidden">
                            <Image
                              alt={`${product.name ?? "Product image"} ${idx + 1}`}
                              className={`w-full ${viewMode === "grid" ? "aspect-square" : "h-40"
                                } object-cover transition-transform duration-500 group-hover/image:scale-105`}
                              height={250}
                              priority={idx === 0}
                              src={src}
                              width={250}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>

                {images.length > 1 && (
                  <>
                    <button
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-opacity opacity-0 pointer-events-none group-hover/image:opacity-100 group-hover/image:pointer-events-auto focus:opacity-100 focus:pointer-events-auto"
                      onClick={goPrev}
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-opacity opacity-0 pointer-events-none group-hover/image:opacity-100 group-hover:image:pointer-events-auto focus:opacity-100 focus:pointer-events-auto"
                      onClick={goNext}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute inset-x-0 bottom-2 items-center justify-center gap-1.5 hidden group-hover:flex transition-all duration-300">
                      <div className="px-2 py-1 rounded-full bg-black/35 backdrop-blur-sm">
                        <ul className="flex items-center gap-1.5">
                          {images.map((_, i) => {
                            const active = i === selectedImageIndex;

                            return (
                              <li key={i}>
                                <button
                                  aria-current={active ? "true" : undefined}
                                  aria-label={`Go to image ${i + 1} of ${images.length}`}
                                  className={`h-2.5 w-2.5 rounded-full transition ${active ? "bg-white" : "bg-white/60 hover:bg-white/80"
                                    }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onSelectImage(product.id, i);
                                    if (emblaApi) emblaApi.scrollTo(i);
                                  }}
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-text-light dark:text-text-lightdark text-lg leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {product.name ?? "Unnamed Product"}
                  </h3>
                  {metaLine && (
                    <p className="text-sm text-text-subtle dark:text-text-subtledark mt-1">
                      {metaLine}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    itemScope
                    className="font-bold text-2xl text-text-light dark:text-text-lightdark"
                    itemProp="offers"
                    itemType="https://schema.org/Offer"
                  >
                    <meta content="USD" itemProp="priceCurrency" />
                    <span itemProp="price">{formatPrice(displayPrice)}</span>
                  </span>
                  <span className="text-lg text-text-subtle dark:text-text-subtledark line-through">
                    {formatPrice(originalPrice)}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-brand-primary to-brand-primarydark hover:opacity-95 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
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
              className="flex flex-row items-center w-full rounded-2xl bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark  shadow-sm hover:shadow-md transition"
              role="listitem"
            >
              <div className="relative w-[100px] h-[100px] md:w-[160px] md:h-[140px] overflow-hidden rounded-xl bg-brand-surface dark:bg-brand-surfacedark">
                {imgSrc && (
                  <Image
                    fill
                    priority
                    alt={product.name ?? "Product image"}
                    className="object-contain"
                    sizes="160px"
                    src={imgSrc}
                  />
                )}
              </div>

              <div className="flex justify-start items-start flex-col px-4 flex-1">
                <Link
                  prefetch
                  className="mt-3 text-center text-sm md:text-base font-semibold leading-tight tracking-wide uppercase hover:text-brand-primary line-clamp-2"
                  href={`/product/${product.id}`}
                >
                  {product.name ?? "Unnamed Product"}
                </Link>

                {metaLine && (
                  <p className="text-xs md:text-sm text-text-subtle dark:text-text-subtledark mt-1">
                    {metaLine}
                  </p>
                )}

                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <span className="text-xl md:text-2xl font-extrabold text-text-light dark:text-text-lightdark">
                    {product.price.toLocaleString()} ₾
                  </span>

                  {typeof originalPrice === "number" && originalPrice > product.price && (
                    <span className="text-sm text-text-subtle dark:text-text-subtledark line-through">
                      {originalPrice.toLocaleString()} ₾
                    </span>
                  )}
                </div>
              </div>

              <button
                aria-label="Add to cart"
                className="mt-4 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-brand-primary text-white shadow-md transition hover:opacity-95"
                onClick={() => onAdd(product.id)}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          )}
        </CardBody>
      </Card>
    </article>
  );
});

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const addToCart = useCartStore((s) => s.checkAndAddToCart);
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
    setSelectedImages((prev) => {
      if (prev[productId] === imageIndex) return prev;

      return { ...prev, [productId]: imageIndex };
    });
  };

  return (
    <div
      aria-label="Products"
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          : "space-y-4"
      }
      role="list"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedImageIndex={selectedImages[product.id] ?? 0}
          viewMode={viewMode}
          onAdd={handleAddToCart}
          onSelectImage={handleImageSelect}
        />
      ))}
    </div>
  );
}
