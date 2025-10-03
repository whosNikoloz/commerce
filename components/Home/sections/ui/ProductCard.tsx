"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductResponseModel } from "@/types/product";
import { StockStatus } from "@/types/enums";

// shadcn/ui
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Icons
import { Heart, ShoppingCart } from "lucide-react";

// utils
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: ProductResponseModel;
  template?: 1 | 2 | 3;
  className?: string;
  showActions?: boolean;
}

/**
 * Polished Product Card
 * - Uses shadcn/ui primitives (Card/Badge/Skeleton/AspectRatio/Button)
 * - Subtle hover, focus ring, and elevation
 * - Consistent paddings/radii across templates
 * - Discount + stock states
 * - Optional actions (wishlist, add to cart) hidden on mobile
 */
export function ProductCard({
  product,
  template = 1,
  className,
  showActions = false,
}: ProductCardProps) {
  const discountPercent = product.discountPrice
    ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100))
    : 0;

  const imageUrl = product.images?.[0] || "/placeholder.svg";
  const isInStock = product.status === StockStatus.InStock;

  const templateClasses: Record<1 | 2 | 3, string> = {
    1: "rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:border-brand-primary/60",
    2: "rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg",
    3: "rounded-xl  border border-border bg-card transition-all duration-300 hover:shadow-md",
  };

  const nameClasses: Record<1 | 2 | 3, string> = {
    1: "text-sm font-semibold tracking-tight line-clamp-2 group-hover:text-brand-primary",
    2: "text-[15px] font-semibold line-clamp-2 group-hover:text-brand-primary",
    3: "text-sm font-medium line-clamp-2 group-hover:text-brand-primary",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/40",
        templateClasses[template],
        className
      )}
    >
      <Link href={`/product/${product.id}`} className="absolute inset-0" aria-label={product.name} />

      {/* Image */}
      <CardContent className="p-4">
        <div className="relative">
          <AspectRatio ratio={1} className="rounded-xl bg-muted/50 overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </AspectRatio>

          {/* Overlays */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
            {product.isNewArrival && (
              <Badge className="bg-brand-primary text-white shadow-sm">NEW</Badge>
            )}
            {discountPercent > 0 && (
              <Badge className="bg-red-500 text-white shadow-sm">-{discountPercent}%</Badge>
            )}
          </div>

          {!isInStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge variant="secondary" className="text-white bg-slate-600/90">Out of stock</Badge>
            </div>
          )}

          {/* Quick actions (optional) */}
          {showActions && (
            <div className="pointer-events-none absolute right-3 top-3 hidden gap-2 md:flex">
              <Button size="icon" variant="secondary" className="pointer-events-auto h-9 w-9 rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Content */}
      <CardFooter className="flex flex-col gap-3 p-4 pt-0">
        {/* Brand */}
        {product.brand?.name && (
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/90">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <h3 className={cn(nameClasses[template], "transition-colors")}>{product.name}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-xl font-bold">{formatPrice(product.discountPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold">{formatPrice(product.price)}</span>
          )}
        </div>

        <Separator className="my-1" />

        {/* Bottom row: stock + CTA (optional) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isInStock ? (
              <Badge variant="outline" className="border-emerald-500 text-emerald-600">In stock</Badge>
            ) : (
              <Badge variant="outline" className="border-slate-400 text-slate-600">Unavailable</Badge>
            )}
          </div>

          {showActions && (
            <Button size="sm" className="gap-2" disabled={!isInStock}>
              <ShoppingCart className="h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const templateClasses: Record<1 | 2 | 3, string> = {
    1: "rounded-2xl border border-border bg-card",
    2: "rounded-2xl border border-border bg-card",
    3: "rounded-xl  border border-border bg-card",
  };

  return (
    <Card className={cn("overflow-hidden", templateClasses[template])}>
      <CardContent className="p-4">
        <AspectRatio ratio={1} className="rounded-xl overflow-hidden">
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 p-4 pt-0">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-1 flex w-full items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
}
