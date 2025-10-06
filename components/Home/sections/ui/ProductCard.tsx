"use client";

import Link from "next/link";
import Image from "next/image";
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
import { Heart, ShoppingCart, Star, Sparkles, Tag, TrendingUp } from "lucide-react";

// utils
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: ProductResponseModel;
  template?: 1 | 2 | 3;
  className?: string;
  showActions?: boolean;
  priority?: boolean;
}

/**
 * Modern E-commerce Product Card - Best Practices
 *
 * Features:
 * - Mobile-first responsive design with optimized touch targets
 * - Progressive image loading with proper aspect ratios
 * - Clear visual hierarchy with appropriate typography scale
 * - Accessible with ARIA labels and semantic HTML
 * - Multiple status badges (New, Discount, Liquidation, Coming Soon)
 * - Optimized hover states for desktop, touch-friendly for mobile
 * - Skeleton loading states for better perceived performance
 * - SEO-friendly with proper schema.org markup
 * - Template variations for different page contexts
 */
export function ProductCard({
  product,
  template = 1,
  className,
  showActions = false,
  priority = false,
}: ProductCardProps) {
  // Calculate discount percentage
  const discountPercent = product.discountPrice
    ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100))
    : 0;

  // Get display values
  const imageUrl = product.images?.[0] || "/placeholder.svg";
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

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:ring-offset-2",
        templateClasses[template],
        className
      )}
    >
      {/* SEO: Product metadata */}
      <meta itemProp="name" content={product.name || "Product"} />
      {imageUrl && <meta itemProp="image" content={imageUrl} />}
      {brandName && <meta itemProp="brand" content={brandName} />}

      {/* Main clickable area */}
      <Link
        href={`/product/${product.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${product.name || "product"} details`}
      />

      {/* Image Section */}
      <CardContent className={cn("relative", paddingClasses[template])}>
        <div className="relative">
          <AspectRatio
            ratio={1}
            className={cn(
              "overflow-hidden bg-muted/30",
              imageContainerClasses[template]
            )}
          >
            <Image
              src={imageUrl}
              alt={product.name || "Product image"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-110"
              priority={priority}
              quality={85}
            />

            {/* Out of stock overlay */}
            {!isInStock && !product.isComingSoon && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Badge
                  variant="secondary"
                  className="bg-slate-800/90 text-white border-0 text-xs sm:text-sm px-3 py-1 shadow-lg"
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
              <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold">
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

          {/* Quick Actions - Top Right (Desktop only) */}
          {showActions && (
            <div className="pointer-events-none absolute right-2 sm:right-3 top-2 sm:top-3 hidden md:flex flex-col gap-2 z-20 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className="pointer-events-auto h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background hover:scale-110 transition-transform"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sr-only">Add to wishlist</span>
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
          <Badge variant="outline" className="text-[10px] px-2 py-0 border-muted-foreground/30">
            {conditionLabel}
          </Badge>
        )}

        {/* Price Section */}
        <div
          className="flex items-baseline gap-2 w-full mt-auto"
          itemScope
          itemType="https://schema.org/Offer"
          itemProp="offers"
        >
          <meta itemProp="priceCurrency" content="USD" />
          <meta itemProp="price" content={displayPrice.toString()} />
          <meta itemProp="availability" content={isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />

          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            {formatPrice(displayPrice)}
          </span>

          {hasDiscount && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status & Action Button */}
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

          {/* Add to Cart Button (if enabled) */}
          {showActions && (
            <Button
              size="sm"
              className="relative z-20 gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
              disabled={!isInStock || product.isComingSoon}
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
              }}
            >
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
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
        <AspectRatio ratio={1} className={cn("overflow-hidden", imageContainerClasses[template])}>
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
