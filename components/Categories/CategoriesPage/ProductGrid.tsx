"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Clock3, Tag, ShoppingCart, ChevronRight, Heart } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { useState, memo, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";
import { CartItem, useCartStore } from "@/app/context/cartContext";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/api/services/orderService";
import { useUser } from "@/app/context/userContext";

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
  const { user } = useUser();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (user && product.id) {
      isInWishlist(product.id).then(setInWishlist).catch(() => setInWishlist(false));
    }
  }, [user, product.id]);

  const images = product.images?.length ? product.images : ["/placeholder.png"];
  const imgSrc = images?.[0];
  const inStock = product.status === StockStatus.InStock;

  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : undefined;

  const size = product.productFacetValues?.find((f) => f.facetName?.toLowerCase() === "size")?.facetValue;
  const color = product.productFacetValues?.find((f) => f.facetName?.toLowerCase() === "color")?.facetValue;
  const metaLine = [product.brand?.name, color, size, formatCondition(product.condition)]
    .filter(Boolean)
    .join(" • ");

  const showComingSoon = product.isComingSoon === true;
  const showNew = product.isNewArrival === true;
  const showClearance = product.isLiquidated === true;

  const discountPct = hasDiscount
    ? Math.max(0, Math.round(((product.price - product.discountPrice!) / product.price) * 100))
    : 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    align: "center",
    containScroll: "trimSnaps",
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
    emblaApi?.scrollPrev();
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollNext();
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to add items to your wishlist");

      return;
    }
    if (!product.id) {
      toast.error("Product ID is missing");

      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const stopAll = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // @ts-ignore — native event may exist
    e.nativeEvent?.stopImmediatePropagation?.();
  };

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "flex flex-col gap-2" : "absolute top-2 right-2 flex flex-col gap-2 z-30"}>
      <Button
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          compact ? "h-10 w-10 sm:h-12 sm:w-12 rounded-xl" : "h-8 w-8 sm:h-9 sm:w-9 rounded-full",
          "backdrop-blur-md shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60",
          inWishlist ? "bg-red-500 hover:bg-red-600 text-white" : "bg-background/80 hover:bg-background"
        )}
        disabled={wishlistLoading}
        size="icon"
        variant="secondary"
        onClick={handleWishlistToggle}
      >
        <Heart className={compact ? "h-5 w-5" : "h-4 w-4"} />
      </Button>

      <Button
        aria-label="Add to cart"
        className={cn(
          compact ? "h-10 w-10 sm:h-12 sm:w-12 rounded-xl" : "h-8 w-8 sm:h-9 sm:w-9 rounded-full",
          "bg-gradient-to-br from-brand-primary to-brand-primary/90 text-white shadow-lg transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
        )}
        disabled={!inStock || showComingSoon}
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAdd(product.id);
        }}
      >
        <ShoppingCart className={compact ? "h-5 w-5" : "h-4 w-4"} />
      </Button>
    </div>
  );

  return (
    <article itemScope itemType="https://schema.org/Product" className={viewMode === "grid" ? "flex flex-col h-full" : ""}>
      <meta content={product.name ?? "Product"} itemProp="name" />
      {imgSrc && <meta content={imgSrc} itemProp="image" />}

      <Card className={cn("group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg transition-all duration-500 md:hover:-translate-y-2 md:hover:border-brand-primary/30 md:hover:shadow-2xl", viewMode === "grid" && "flex flex-col h-full")}>
        {viewMode === "grid" ? (
          <>
            {/* Clickable area only (inside Card, wrapped by Link) */}
            <Link
              className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 rounded-2xl"
              href={`/product/${product.id}`}
            >
              <CardBody className="p-0 flex flex-col h-full">
                <div className="relative flex-1 flex flex-col">
                  <div
                    aria-live="polite"
                    className="relative overflow-hidden rounded-t-2xl group/image bg-gradient-to-br from-muted/30 to-muted/10"
                  >
                    {/* Badges (left top) */}
                    <div className="absolute left-2 sm:left-3 top-2 sm:top-3 z-20 flex flex-col gap-1.5 sm:gap-2">
                      {showComingSoon && (
                        <Badge className="bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 text-white border-0 shadow-xl backdrop-blur-md text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold">
                          <Clock3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Coming Soon
                        </Badge>
                      )}
                      {showNew && (
                        <Badge className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white border-0 shadow-xl backdrop-blur-md text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold">
                          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> NEW
                        </Badge>
                      )}
                      {showClearance && (
                        <Badge className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-xl backdrop-blur-md text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> CLEARANCE
                        </Badge>
                      )}
                      {discountPct > 0 && (
                        <Badge className="bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white border-0 shadow-xl backdrop-blur-md text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold">
                          −{discountPct}%
                        </Badge>
                      )}
                    </div>

                    {/* Carousel */}
                    <div ref={emblaRef} className="relative rounded-t-2xl overflow-hidden">
                      <div className="flex touch-pan-y">
                        {images.map((src, idx) => (
                          <div key={idx} className="flex-[0_0_100%]">
                            <div className="relative overflow-hidden">
                              <Image
                                alt={`${product.name ?? "Product image"} ${idx + 1}`}
                                className={cn(
                                  "w-full object-cover transition-transform duration-500 md:group-hover/image:scale-105",
                                  viewMode === "grid" ? "aspect-square" : "h-40"
                                )}
                                height={800}
                                priority={idx === 0}
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                src={src}
                                width={800}
                              />
                              {/* Subtle bottom gradient for legibility */}
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          aria-label="Previous image"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-opacity opacity-0 pointer-events-none group-hover/image:opacity-100 group-hover/image:pointer-events-auto focus:opacity-100 focus:pointer-events-auto z-10"
                          onClick={(e) => { stopAll(e); goPrev(e); }}
                        >
                          <ChevronRight className="h-5 w-5 rotate-180" />
                        </button>
                        <button
                          aria-label="Next image"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 shadow-lg transition-opacity opacity-0 pointer-events-none group-hover/image:opacity-100 group-hover/image:pointer-events-auto focus:opacity-100 focus:pointer-events-auto z-10"
                          onClick={(e) => { stopAll(e); goNext(e); }}
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
                                      className={cn(
                                        "h-2.5 w-2.5 rounded-full transition",
                                        active ? "bg-white" : "bg-white/60 hover:bg-white/80"
                                      )}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onSelectImage(product.id, i);
                                        emblaApi?.scrollTo(i);
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

                  <div className="p-1 sm:p-2 md:p-3 bg-gradient-to-b from-background/50 to-background mt-auto">
                    <div className="space-y-1">
                      {metaLine && (
                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium truncate">
                          {metaLine}
                        </p>
                      )}
                      <h3 className="font-semibold text-foreground text-xs sm:text-sm md:text-base lg:text-lg leading-tight line-clamp-2 min-h-[2.5rem] md:group-hover:text-brand-primary transition-colors duration-300">
                        {product.name ?? "Unnamed Product"}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                      <span
                        itemScope
                        className="font-bold text-base sm:text-xl md:text-xl lg:text-2xl text-foreground bg-clip-text"
                        itemProp="offers"
                        itemType="https://schema.org/Offer"
                      >
                        <meta content="GEL" itemProp="priceCurrency" />
                        <span itemProp="price">{formatPrice(displayPrice)}</span>
                      </span>
                      {originalPrice && (
                        <span className="text-xs sm:text-sm md:text-base text-muted-foreground/70 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {inStock ? (
                        <>
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                          <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            In Stock
                          </span>
                        </>
                      ) : showComingSoon ? (
                        <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Coming Soon
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-muted-foreground">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Link>

            {/* ACTIONS OUTSIDE LINK (absolute in grid) */}
            <ActionButtons />
          </>
        ) : (
          // LIST VIEW
          <div className="flex items-center gap-3 sm:gap-4 w-full p-3 sm:p-4 rounded-2xl bg-card">
            <Link
              className="flex flex-1 items-center gap-3 sm:gap-4 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 rounded-xl"
              href={`/product/${product.id}`}
            >
              {/* Image */}
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                {imgSrc && (
                  <Image
                    fill
                    priority
                    alt={product.name ?? "Product image"}
                    className="object-cover transition-transform duration-300 md:group-hover:scale-110"
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
                    src={imgSrc}
                  />
                )}
                {(showNew || showClearance || showComingSoon || discountPct > 0) && (
                  <div className="absolute left-1 top-1 z-10 space-y-1">
                    {showComingSoon && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg text-[8px] sm:text-[10px] px-1 py-0.5">
                        <Clock3 className="h-2 w-2 mr-0.5" /> Soon
                      </Badge>
                    )}
                    {showNew && !showComingSoon && (
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg text-[8px] sm:text-[10px] px-1 py-0.5">
                        <Sparkles className="h-2 w-2 mr-0.5" /> NEW
                      </Badge>
                    )}
                    {discountPct > 0 && (
                      <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg text-[8px] sm:text-[10px] px-1 py-0.5 font-bold">
                        -{discountPct}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center flex-1 min-w-0 space-y-1.5">
                <div className="space-y-0.5">
                  {metaLine && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
                      {metaLine}
                    </p>
                  )}
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
                    {product.name ?? "Unnamed Product"}
                  </h3>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {formatPrice(displayPrice)}
                  </span>
                  {originalPrice && (
                    <span className="text-xs sm:text-sm text-muted-foreground/70 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {inStock ? (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                      <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        In Stock
                      </span>
                    </>
                  ) : showComingSoon ? (
                    <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Out of Stock</span>
                  )}
                </div>
              </div>
            </Link>

            {/* ACTIONS OUTSIDE LINK (right column in list) */}
            <ActionButtons compact />
          </div>
        )}
      </Card>
    </article>
  );
});


export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const addToCart = useCartStore((s) => s.addToCart);
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
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3"
          : "space-y-3 sm:space-y-4"
      }
      role="list"
    >
      {products.map((product) => (
        viewMode === "grid" ? (
          <div key={product.id} className="h-full">
            <ProductCard
              product={product}
              selectedImageIndex={selectedImages[product.id] ?? 0}
              viewMode={viewMode}
              onAdd={handleAddToCart}
              onSelectImage={handleImageSelect}
            />
          </div>
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            selectedImageIndex={selectedImages[product.id] ?? 0}
            viewMode={viewMode}
            onAdd={handleAddToCart}
            onSelectImage={handleImageSelect}
          />
        )
      ))}
    </div>
  );
}
