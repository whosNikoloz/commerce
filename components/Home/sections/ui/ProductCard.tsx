"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Heart, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { ProductResponseModel } from "@/types/product";
import { StockStatus, Condition } from "@/types/enums";

// shadcn/ui
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// services
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/api/services/orderService";
import { useUser } from "@/app/context/userContext";
import { CartItem, useCartStore } from "@/app/context/cartContext";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: ProductResponseModel;
  template?: 1 | 2 | 3;
  className?: string;
  showActions?: boolean;
  priority?: boolean;
}

const templateStyles = {
  1: {
    card:
      "rounded-2xl border bg-white shadow-[0_6px_24px_-8px_rgba(0,0,0,.20)] " +
      "border-black/5 dark:bg-zinc-950 dark:border-white/10 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]",
    imageRadius: "rounded-t-2xl",
    title: "text-[15px] font-semibold leading-snug line-clamp-2",
    cta: "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
    oldPrice: "text-muted-foreground dark:text-zinc-400",
  },
  2: {
    card:
      "rounded-xl border bg-white shadow " +
      "border-black/10 dark:bg-zinc-950 dark:border-white/10 dark:shadow-none",
    imageRadius: "rounded-t-xl",
    title: "text-sm font-semibold leading-snug line-clamp-2",
    cta: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90",
    oldPrice: "text-neutral-400 dark:text-zinc-500",
  },
  3: {
    card:
      "rounded-lg border bg-white border-zinc-200 " +
      "dark:bg-zinc-950 dark:border-zinc-800/80",
    imageRadius: "rounded-t-lg",
    title: "text-sm font-medium leading-snug line-clamp-2",
    cta: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-white/90",
    oldPrice: "text-zinc-400 dark:text-zinc-500",
  },
} as const;

export function ProductCard({
  product,
  template = 1,
  className,
  showActions = true,
  priority = false,
}: ProductCardProps) {
  const { user } = useUser();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    if (user && product.id) {
      isInWishlist(product.id).then(setInWishlist).catch(() => setInWishlist(false));
    }
  }, [user, product.id]);

  const imageUrl = product.images?.[0] || "/placeholder.png";
  const isInStock = product.status === StockStatus.InStock;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercent = hasDiscount
    ? Math.max(0, Math.round(((product.price - (product.discountPrice as number)) / product.price) * 100))
    : 0;

  const conditionLabel =
    product.condition === Condition.New
      ? "New"
      : product.condition === Condition.LikeNew
      ? "Like New"
      : product.condition === Condition.Used
      ? "Used"
      : "";

  const S = templateStyles[template];

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error("გთხოვთ, ჯერ გაიაროთ ავტორიზაცია");
    if (!product.id) return toast.error("Product ID is missing");
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
        toast.success("სურვილების სიიდან წაიშალა");
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
        toast.success("დაემატა სურვილების სიაში");
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (p: ProductResponseModel) => {
    const item: CartItem = {
      id: p.id,
      name: p.name ?? "Unnamed Product",
      price: p.discountPrice ?? p.price,
      image: p.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: discountPercent,
      originalPrice: p.price,
    };

    addToCart(item);
    toast.success("დაემატა კალათაში");
  };

  return (
    <article
      itemScope
      className={cn("group relative overflow-hidden transition-all duration-300", S.card, className)}
      itemType="https://schema.org/Product"
    >
      <meta content={product.name || "Product"} itemProp="name" />
      {imageUrl && <meta content={imageUrl} itemProp="image" />}

      <Link
        aria-label={`View ${product.name || "product"} details`}
        className="absolute inset-0 z-[5]"
        href={`/product/${product.id}`}
        tabIndex={-1}
      />

      {/* IMAGE */}
      <CardContent className="p-0 relative z-10"> {/* ensure image area stays interactive (e.g., heart) */}
        <div className="relative">
          <AspectRatio className={cn("overflow-hidden bg-zinc-100 dark:bg-zinc-900/60", S.imageRadius)} ratio={1}>
            <Image
              fill
              unoptimized
              alt={product.name || "Product image"}
              className="object-cover"
              priority={priority}
              sizes="(max-width:640px) 90vw, (max-width:1024px) 40vw, 20vw"
              src={imageUrl}
            />
          </AspectRatio>

          {discountPercent > 0 && (
            <div className="absolute left-3 top-3 z-20">
              <div className="rounded-full bg-red-500 text-white text-xs font-bold px-2.5 py-1 shadow-sm">
                -{discountPercent}%
              </div>
            </div>
          )}

          {template !== 2 && showActions && (
            <div className="absolute right-3 top-3 z-20">
              <Button
                className={cn(
                  "rounded-full h-9 w-9 shadow-md",
                  "bg-white/90 hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-800",
                  inWishlist && "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                )}
                disabled={wishlistLoading}
                size="icon"
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(e);
                }}
              >
                <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                <span className="sr-only">{inWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* CONTENT */}
      <CardFooter className="relative z-10 flex flex-col items-start gap-2.5 p-4">
        <h3 className={cn(S.title, "text-zinc-900 dark:text-zinc-100 w-full")} itemProp="name">
          {product.name || "Unnamed Product"}
        </h3>

        {conditionLabel && product.condition !== Condition.New && (
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            {conditionLabel}
          </span>
        )}

        <div itemScope className="flex items-baseline gap-2 w-full" itemProp="offers" itemType="https://schema.org/Offer">
          <meta content="USD" itemProp="priceCurrency" />
          <meta content={displayPrice.toString()} itemProp="price" />
          <meta
            content={isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}
            itemProp="availability"
          />
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(displayPrice)}</span>
          {hasDiscount && <span className={cn("text-sm line-through", S.oldPrice)}>{formatPrice(product.price)}</span>}
        </div>

        {template === 2 && showActions ? (
          <div className="mt-1 w-full flex items-stretch gap-2">
            <Button
              className={cn("h-11 flex-1 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2", S.cta)}
              disabled={!isInStock || product.isComingSoon}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>

            <Button
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "h-11 w-11 shrink-0 rounded-full border shadow-sm",
                "bg-white hover:bg-white border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-800 dark:border-zinc-700",
                inWishlist &&
                  "bg-red-500 text-white hover:bg-red-600 border-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-600"
              )}
              disabled={wishlistLoading}
              size="icon"
              type="button"
              variant={inWishlist ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlistToggle(e as any);
              }}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </Button>
          </div>
        ) : (
          <Button
            className={cn("mt-1 w-full h-11 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2", S.cta)}
            disabled={!isInStock || product.isComingSoon}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </Button>
        )}
      </CardFooter>
    </article>
  );
}


export function ProductCardSkeleton({ template = 1 }: { template?: 1 | 2 | 3 }) {
  const S = templateStyles[template];

  return (
    <article className={cn("overflow-hidden", S.card)}>
      <CardContent className="p-4">
        <div className={cn("relative p-2 rounded-xl shadow-inner bg-zinc-100 dark:bg-zinc-900/60", S.imageRadius)}>
          <AspectRatio ratio={1}>
            <div className="h-full w-full rounded-lg animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          </AspectRatio>

          <div className="absolute left-4 top-4 h-6 w-16 rounded-full animate-pulse bg-zinc-200/80 dark:bg-zinc-700/70" />
          <div className="absolute right-4 top-4 h-9 w-9 rounded-full shadow-sm animate-pulse bg-white/80 dark:bg-zinc-800/80" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 rounded animate-pulse bg-zinc-200 dark:bg-zinc-800" />

        <div className="mt-1 flex items-center gap-2 w-full">
          <div className="h-6 w-24 rounded animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-16 rounded animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {template === 2 ? (
          <div className="mt-1 w-full flex items-stretch gap-2">
            <div className="h-11 flex-1 rounded-xl animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-11 w-11 rounded-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ) : (
          <div className="mt-1 h-11 w-full rounded-xl animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        )}
      </CardFooter>
    </article>
  );
}
