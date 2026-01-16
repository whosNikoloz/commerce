"use client";

import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Clock3, Tag, ShoppingCart, Heart } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { useState, memo, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

import { cn, isS3Url } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";
import { CartItem, useCartStore } from "@/app/context/cartContext";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/api/services/orderService";
import { useUser } from "@/app/context/userContext";
import { useTenant } from "@/app/context/tenantContext";

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
  size = "default",
}: {
  product: ProductResponseModel;
  viewMode: "grid" | "list";
  onAdd: (id: string) => void;
  size?: "default" | "compact";
}) {
  const { user } = useUser();
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang || "en";
  const { config } = useTenant();
  const themeColor = config?.themeColor || "#000000";
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (user && product.id) {
      isInWishlist(product.id).then(setInWishlist).catch(() => setInWishlist(false));
    }
  }, [user, product.id]);

  const images = product.images?.length ? product.images : ["/placeholder.png"];
  const hasMultipleImages = images.length > 1;
  const imageUrl = images[currentImageIndex] || images[0];
  const inStock = product.status === StockStatus.InStock;

  const hasDiscount =
    typeof product.discountPrice === "number" && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const originalPrice = hasDiscount ? product.price : undefined;

  // Limit to max 4 zones
  const maxZones = 4;
  const displayZones = Math.min(images.length, maxZones);
  const hasMoreImages = images.length > maxZones;
  const remainingImagesCount = images.length - maxZones;

  // const color = product.productFacetValues?.find(
  //   (f) => f.facetName?.toLowerCase() === "color"
  // )?.facetValue;
  // const metaLine = [product.brand?.name, color, formatCondition(product.condition)]
  //   .filter(Boolean)
  //   .join(" • ");

  const showComingSoon = product.isComingSoon === true;
  const showNew = product.isNewArrival === true;
  const showClearance = product.isLiquidated === true;

  const discountPct = hasDiscount
    ? Math.max(0, Math.round(((product.price - product.discountPrice!) / product.price) * 100))
    : 0;

  const isCompact = size === "compact";
  const cardPadding = isCompact ? "p-1 sm:p-1.5 md:p-2" : "p-1 sm:p-2 md:p-3";
  const titleSize = isCompact
    ? "text-[10px] sm:text-xs md:text-sm"
    : "text-xs sm:text-sm md:text-base lg:text-lg";
  const priceSize = isCompact
    ? "text-sm sm:text-base md:text-lg"
    : "text-base sm:text-xl md:text-xl lg:text-2xl";
  const metaSize = isCompact ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs";
  const badgeSize = isCompact
    ? "text-[8px] sm:text-[9px] px-1.5 py-0.5"
    : "text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1";
  const minTitleHeight = isCompact ? "min-h-[1.5rem] sm:min-h-[2rem]" : "min-h-[2.5rem]";

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

  const ActionButtons = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={
        compact
          ? "flex flex-col gap-2"
          : "absolute top-2 right-2 flex flex-col gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      }
    >
      <Button
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          compact ? "h-10 w-10 sm:h-12 sm:w-12 rounded-xl" : "h-8 w-8 sm:h-9 sm:w-9 rounded-full",
          "backdrop-blur-md shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
        )}
        disabled={wishlistLoading}
        size="icon"
        style={inWishlist ? { backgroundColor: "#ef4444", color: "white" } : {}}
        variant="secondary"
        onClick={handleWishlistToggle}
      >
        <Heart className={cn(compact ? "h-5 w-5" : "h-4 w-4", inWishlist && "fill-current")} />
      </Button>

      <Button
        aria-label="Add to cart"
        className={cn(
          compact ? "h-10 w-10 sm:h-12 sm:w-12 rounded-xl" : "h-8 w-8 sm:h-9 sm:w-9 rounded-full",
          "text-white shadow-lg transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
        )}
        disabled={!inStock || showComingSoon}
        size="icon"
        style={{ backgroundColor: themeColor }}
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
    <article
      itemScope
      className={viewMode === "grid" ? "flex flex-col h-full" : ""}
      itemType="https://schema.org/Product"
    >
      <meta content={product.name ?? "Product"} itemProp="name" />
      {imageUrl && <meta content={imageUrl} itemProp="image" />}
      {product.description && <meta content={product.description} itemProp="description" />}

      <Card
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg transition-all duration-500 md:hover:-translate-y-2 md:hover:border-brand-primary/30 md:hover:shadow-2xl",
          viewMode === "grid" && "flex flex-col h-full"
        )}
      >
        {viewMode === "grid" ? (
          <>
            {/* GRID VIEW */}
            <Link
              className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 rounded-2xl"
              href={`/${currentLang}/product/${product.id}`}
              onMouseLeave={() => setCurrentImageIndex(0)}
            >
              <CardBody className="p-0 flex flex-col h-full">
                <div className="relative flex-1 flex flex-col">
                  <div
                    aria-live="polite"
                    className={cn(
                      "relative overflow-hidden rounded-t-2xl group/image bg-gradient-to-br from-muted/30 to-muted/10"
                    )}
                  >
                    {/* Badges (left top) */}
                    <div className="absolute left-2 sm:left-3 top-2 sm:top-3 z-20 flex flex-col gap-1.5 sm:gap-2">
                      {showComingSoon && (
                        <Badge
                          className={cn(
                            "bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 text-white border-0 shadow-xl backdrop-blur-md font-semibold",
                            badgeSize
                          )}
                        >
                          <Clock3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Coming Soon
                        </Badge>
                      )}
                      {showNew && (
                        <Badge
                          className={cn(
                            "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white border-0 shadow-xl backdrop-blur-md font-semibold",
                            badgeSize
                          )}
                        >
                          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> NEW
                        </Badge>
                      )}
                      {showClearance && (
                        <Badge
                          className={cn(
                            "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-xl backdrop-blur-md font-bold",
                            badgeSize
                          )}
                        >
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> CLEARANCE
                        </Badge>
                      )}
                      {discountPct > 0 && (
                        <Badge
                          className={cn(
                            "text-white border-0 shadow-xl backdrop-blur-md font-bold",
                            badgeSize
                          )}
                          style={{ backgroundColor: themeColor }}
                        >
                          −{discountPct}%
                        </Badge>
                      )}
                    </div>

                    {/* Image with hover/click areas for multiple images */}
                    <div className="relative rounded-t-2xl overflow-hidden">
                      <Image
                        alt={product.name ?? "Product image"}
                        className={cn(
                          "w-full object-cover transition-opacity duration-300",
                          viewMode === "grid" ? (isCompact ? "h-full" : "aspect-square") : "h-40"
                        )}
                        height={800}
                        priority={false}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        src={imageUrl}
                        unoptimized={isS3Url(imageUrl)}
                        width={800}
                      />

                      {/* Hover zones - with subtle visual hints (desktop only) */}
                      {hasMultipleImages && (
                        <div className="hidden md:flex absolute inset-0 z-10 gap-[2px] pointer-events-none">
                          {images.slice(0, 4).map((_, index) => (
                            <div
                              key={index}
                              className="flex-1 hover:bg-white/5 transition-all duration-200 relative pointer-events-auto cursor-pointer"
                              onMouseEnter={() => setCurrentImageIndex(index)}
                            >
                              {/* Subtle edge highlight on hover */}
                              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity border-x border-white/10 pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show "+X" overlay on entire image when hovering 4th zone (desktop only) */}
                      {hasMultipleImages && hasMoreImages && currentImageIndex === 3 && (
                        <div className="hidden md:flex absolute inset-0 bg-black/90 items-center justify-center backdrop-blur-sm z-20 pointer-events-none">
                          <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold">
                            +{remainingImagesCount}
                          </span>
                        </div>
                      )}

                      {/* Bottom line indicators (desktop only) */}
                      {hasMultipleImages && (
                        <div className="hidden md:flex absolute bottom-3 left-0 right-0 items-center justify-center gap-1 pointer-events-none z-20 px-4">
                          {images.slice(0, 4).map((_, index) => (
                            <div
                              key={index}
                              className={cn(
                                "h-1 flex-1 max-w-16 rounded-full transition-all duration-200",
                                currentImageIndex === index
                                  ? "shadow-md"
                                  : "bg-white/40"
                              )}
                              style={
                                currentImageIndex === index
                                  ? { backgroundColor: themeColor }
                                  : { backgroundColor: 'rgba(255, 255, 255, 0.4)' }
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "bg-gradient-to-b from-background/50 to-background mt-auto",
                      cardPadding
                    )}
                  >
                    <div className="space-y-1">
                      {/* {metaLine && (
                        <p
                          className={cn(
                            "uppercase tracking-wider text-muted-foreground font-medium truncate",
                            metaSize
                          )}
                        >
                          {metaLine}
                        </p>
                      )} */}
                      <h3
                        className={cn(
                          "font-semibold text-foreground leading-tight line-clamp-2 md:group-hover:text-brand-primary transition-colors duration-300",
                          titleSize,
                          minTitleHeight
                        )}
                      >
                        {product.name ?? "Unnamed Product"}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                      <span
                        itemScope
                        className={cn("font-bold text-foreground bg-clip-text", priceSize)}
                        itemProp="offers"
                        itemType="https://schema.org/Offer"
                      >
                        <meta content="GEL" itemProp="priceCurrency" />
                        <meta content={displayPrice.toString()} itemProp="price" />
                        <meta content={inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} itemProp="availability" />
                        {formatPrice(displayPrice)}
                      </span>
                      {originalPrice && (
                        <span className={cn("text-muted-foreground/70 line-through", metaSize)}>
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {inStock ? (
                        <>
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                          <span
                            className={cn(
                              "text-emerald-700 dark:text-emerald-400 font-medium",
                              metaSize
                            )}
                          >
                            In Stock
                          </span>
                        </>
                      ) : showComingSoon ? (
                        <span className="font-primary text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
                          Coming Soon
                        </span>
                      ) : (
                        <span className="font-primary text-[10px] sm:text-xs text-muted-foreground">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Link>

            {/* GRID ACTIONS */}
            <ActionButtons />
          </>
        ) : (
          // LIST VIEW
          <div className="flex items-center gap-3 sm:gap-4 w-full p-3 sm:p-4 rounded-2xl bg-card">
            <Link
              className="flex flex-1 items-center gap-3 sm:gap-4 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 rounded-xl"
              href={`/${currentLang}/product/${product.id}`}
            >
              {/* Image */}
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                {imageUrl && (
                  <Image
                    fill
                    priority
                    alt={product.name ?? "Product image"}
                    className="object-cover transition-transform duration-300 md:group-hover:scale-110"
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
                    src={imageUrl}
                    unoptimized={isS3Url(imageUrl)}
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
                  {/* {metaLine && (
                    <p className="font-primary text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
                      {metaLine}
                    </p>
                  )} */}
                  <h3 className="font-heading text-sm sm:text-base md:text-lg font-semibold leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
                    {product.name ?? "Unnamed Product"}
                  </h3>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-primary text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    {formatPrice(displayPrice)}
                  </span>
                  {originalPrice && (
                    <span className="font-primary text-xs sm:text-sm text-muted-foreground/70 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {inStock ? (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                      <span className="font-primary text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        In Stock
                      </span>
                    </>
                  ) : showComingSoon ? (
                    <span className="font-primary text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="font-primary text-[10px] sm:text-xs text-muted-foreground">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* LIST ACTIONS */}
            <ActionButtons compact />
          </div>
        )}
      </Card>
    </article>
  );
});

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const addToCart = useCartStore((s) => s.smartAddToCart);

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

  return (
    <div
      aria-label="Products"
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3"
          : "space-y-3 sm:space-y-4"
      }
      role="list"
    >
      {products.map((product) =>
        viewMode === "grid" ? (
          <div key={product.id} className="h-full">
            <ProductCard
              product={product}
              size="compact"
              viewMode={viewMode}
              onAdd={handleAddToCart}
            />
          </div>
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            onAdd={handleAddToCart}
          />
        )
      )}
    </div>
  );
}
