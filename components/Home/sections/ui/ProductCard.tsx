"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Heart, ShoppingCart, Sparkles, Tag, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";

// shadcn/ui
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Icons

// utils
import { formatPrice } from "@/lib/utils";

// services
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/api/services/orderService";
import { useUser } from "@/app/context/userContext";
import { CartItem, useCartStore } from "@/app/context/cartContext";

interface ProductCardProps {
  product: ProductResponseModel;
  template?: 1 | 2 | 3;
  className?: string;
  showActions?: boolean;
  priority?: boolean;
}


export function ProductCard({
  product,
  template = 1,
  className,
  showActions = false,
  priority = false,
}: ProductCardProps) {
  const { user } = useUser();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  

  useEffect(() => {
    if (user && product.id) {
      isInWishlist(product.id)
        .then(setInWishlist)
        .catch(() => setInWishlist(false));
    }
  }, [user, product.id]);

  // Calculate discount percentage
  const discountPercent = product.discountPrice
    ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100))
    : 0;

  // Get display values
  const imageUrl = product.images?.[0] || "/placeholder.png";
  const isInStock = product.status === StockStatus.InStock;
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  // Product metadata
  const brandName = product.brand?.name;
  const categoryName = product.category?.name;
  const conditionLabel = product.condition === Condition.New ? "New" :
                        product.condition === Condition.LikeNew ? "Like New" :
                        product.condition === Condition.Used ? "Used" : "";

  // Template-specific styling
  const templateClasses: Record<1 | 2 | 3, string> = {
    1: "rounded-2xl border border-border/50 bg-card md:hover:border-brand-primary/40 md:hover:shadow-2xl",
    2: "rounded-xl border border-border/50 bg-card md:hover:border-brand-primary/30 md:hover:shadow-lg",
    3: "rounded-lg border border-border/40 bg-card md:hover:border-brand-primary/20 md:hover:shadow-md",
  };

  const imageContainerClasses: Record<1 | 2 | 3, string> = {
    1: "rounded-t-2xl",
    2: "rounded-t-xl",
    3: "rounded-t-lg",
  };

  const nameClasses: Record<1 | 2 | 3, string> = {
    1: "text-sm md:text-base font-semibold tracking-tight line-clamp-2 min-h-[2.5rem]",
    2: "text-sm font-semibold line-clamp-2 min-h-[2.5rem]",
    3: "text-sm font-medium line-clamp-2 min-h-[2.5rem]",
  };

  const paddingClasses: Record<1 | 2 | 3, string> = {
    1: "p-3 sm:p-4",
    2: "p-3",
    3: "p-2.5 sm:p-3",
  };

  // Handle wishlist toggle
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

  const handleAddToCart = (product: ProductResponseModel) => {
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
    <article
      itemScope
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:ring-offset-2",
        templateClasses[template],
        className
      )}
      itemType="https://schema.org/Product"
    >
      {/* SEO: Product metadata */}
      <meta content={product.name || "Product"} itemProp="name" />
      {imageUrl && <meta content={imageUrl} itemProp="image" />}
      {brandName && <meta content={brandName} itemProp="brand" />}

      {/* Main clickable area */}
      <Link
        aria-label={`View ${product.name || "product"} details`}
        className="absolute inset-0 z-10"
        href={`/product/${product.id}`}
      />

      {/* Image Section */}
      <CardContent className={cn("relative", paddingClasses[template])}>
        <div className="relative">
          <AspectRatio
            className={cn(
              "overflow-hidden bg-muted/30",
              imageContainerClasses[template]
            )}
            ratio={1}
          >
            <Image
              fill
              alt={product.name || "Product image"}
              className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-110"
              priority={priority}
              quality={85}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              src={imageUrl}
            />

            {/* Out of stock overlay */}
            {!isInStock && !product.isComingSoon && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Badge
                  className="bg-slate-800/90 text-white border-0 text-xs sm:text-sm px-3 py-1 shadow-lg"
                  variant="secondary"
                >
                  Out of Stock
                </Badge>
              </div>
            )}
          </AspectRatio>

          {/* Status Badges - Top Left */}
          <div className="pointer-events-none absolute left-2 sm:left-3 top-2 sm:top-3 flex flex-col gap-1.5 sm:gap-2 z-20">
            {/* Coming Soon Badge */}
            {product.isComingSoon && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                Coming Soon
              </Badge>
            )}

            {/* New Arrival Badge */}
            {product.isNewArrival && !product.isComingSoon && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                NEW
              </Badge>
            )}

            {/* Liquidation Badge */}
            {product.isLiquidated && (
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                CLEARANCE
              </Badge>
            )}

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Quick Actions - Top Right (Desktop and Mobile) */}
          {showActions && (
            <div className="pointer-events-none absolute right-2 sm:right-3 top-2 sm:top-3 flex flex-col gap-2 z-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <Button
                className={cn(
                  "pointer-events-auto h-8 w-8 sm:h-9 sm:w-9 rounded-full backdrop-blur-md shadow-lg hover:scale-110 transition-all",
                  inWishlist
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-background/80 hover:bg-background"
                )}
                disabled={wishlistLoading}
                size="icon"
                variant="secondary"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all",
                    inWishlist && "fill-current"
                  )}
                />
                <span className="sr-only">
                  {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                </span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Content Section */}
      <CardFooter className={cn("flex flex-col items-start gap-2 sm:gap-2.5 pt-0", paddingClasses[template])}>
        {/* Brand & Category */}
        {(brandName || categoryName) && (
          <div className="flex items-center gap-2 w-full">
            {brandName && (
              <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground font-medium truncate">
                {brandName}
              </p>
            )}
            {brandName && categoryName && (
              <span className="text-muted-foreground/50">•</span>
            )}
            {categoryName && (
              <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 truncate">
                {categoryName}
              </p>
            )}
          </div>
        )}

        {/* Product Name */}
        <h3
          className={cn(
            nameClasses[template],
            "text-foreground transition-colors duration-200 md:group-hover:text-brand-primary w-full"
          )}
          itemProp="name"
        >
          {product.name || "Unnamed Product"}
        </h3>

        {/* Condition Badge (if applicable) */}
        {conditionLabel && product.condition !== Condition.New && (
          <Badge className="text-[10px] px-2 py-0 border-muted-foreground/30" variant="outline">
            {conditionLabel}
          </Badge>
        )}

        {/* Price Section */}
        <div
          itemScope
          className="flex items-baseline gap-2 w-full mt-auto"
          itemProp="offers"
          itemType="https://schema.org/Offer"
        >
          <meta content="USD" itemProp="priceCurrency" />
          <meta content={displayPrice.toString()} itemProp="price" />
          <meta content={isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} itemProp="availability" />

          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            {formatPrice(displayPrice)}
          </span>

          {hasDiscount && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status & Action Buttons */}
        <div className="flex items-center justify-between gap-2 w-full mt-1">
          {/* Stock indicator */}
          <div className="flex items-center gap-1.5">
            {isInStock ? (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  In Stock
                </span>
              </>
            ) : product.isComingSoon ? (
              <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium">
                Coming Soon
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Buttons (if enabled) */}
          {showActions && (
            <div className="flex items-center gap-2 relative z-20">
              {/* Wishlist Button - Visible on mobile */}
              <Button
                className={cn(
                  "md:hidden h-8 w-8 rounded-lg shadow-sm transition-all",
                  inWishlist
                    ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                    : "hover:bg-muted"
                )}
                disabled={wishlistLoading}
                size="icon"
                variant="outline"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 transition-all",
                    inWishlist && "fill-current"
                  )}
                />
              </Button>

              {/* Add to Cart Button */}
              <Button
                className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                disabled={!isInStock || product.isComingSoon}
                size="sm"
                onClick={(e) => {
                  handleAddToCart(product);
                }}
              >
                <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </article>
  );
}

export function ProductCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const templateClasses: Record<1 | 2 | 3, string> = {
    1: "rounded-2xl border border-border/50 bg-card",
    2: "rounded-xl border border-border/50 bg-card",
    3: "rounded-lg border border-border/40 bg-card",
  };

  const imageContainerClasses: Record<1 | 2 | 3, string> = {
    1: "rounded-t-2xl",
    2: "rounded-t-xl",
    3: "rounded-t-lg",
  };

  const paddingClasses: Record<1 | 2 | 3, string> = {
    1: "p-3 sm:p-4",
    2: "p-3",
    3: "p-2.5 sm:p-3",
  };

  return (
    <Card className={cn("overflow-hidden animate-pulse", templateClasses[template])}>
      <CardContent className={paddingClasses[template]}>
        <AspectRatio className={cn("overflow-hidden", imageContainerClasses[template])} ratio={1}>
          <Skeleton className="h-full w-full bg-muted/50" />
        </AspectRatio>
      </CardContent>
      <CardFooter className={cn("flex flex-col gap-2 sm:gap-2.5 pt-0", paddingClasses[template])}>
        {/* Brand/Category skeleton */}
        <Skeleton className="h-3 w-24 sm:w-28 bg-muted/50" />

        {/* Product name skeleton */}
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-full bg-muted/50" />
          <Skeleton className="h-4 w-3/4 bg-muted/50" />
        </div>

        {/* Price skeleton */}
        <div className="flex items-baseline gap-2 w-full mt-1">
          <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 bg-muted/50" />
          <Skeleton className="h-3 sm:h-4 w-14 sm:w-16 bg-muted/50" />
        </div>

        {/* Stock/Action skeleton */}
        <div className="flex items-center justify-between gap-2 w-full mt-1">
          <Skeleton className="h-4 w-16 sm:w-20 bg-muted/50" />
          <Skeleton className="h-8 sm:h-9 w-16 sm:w-20 bg-muted/50 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  );
}
