"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Heart, ShoppingCart, ArrowLeftRight, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { cn, resolveImageUrl, formatPrice } from "@/lib/utils";
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
import { useCompareStore } from "@/app/context/compareContext";
import { useFlyToCart } from "@/hooks/use-fly-to-cart";
import { useDictionary } from "@/app/context/dictionary-provider";
import { useTenant } from "@/app/context/tenantContext";

interface ProductCardProps {
  product: ProductResponseModel;
  className?: string;
  showActions?: boolean;
  priority?: boolean;
  size?: "default" | "compact";
}



export function ProductCard({
  product,
  className,
  showActions = true,
  priority = false,
  size = "default",
}: ProductCardProps) {
  const { user } = useUser();
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang || "en";
  const dic = useDictionary();
  const { config } = useTenant();
  const themeColor = config?.themeColor || "#000000";
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addToCart = useCartStore((s) => s.smartAddToCart);
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const inCompare = mounted ? isInCompare(product.id) : false;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { flyToCart } = useFlyToCart({ durationMs: 800, rotateDeg: 0, scaleTo: 0.1, curve: 0.4 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && product.id) {
      isInWishlist(product.id).then(setInWishlist).catch(() => setInWishlist(false));
    }
  }, [user, product.id]);

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const imageUrl = resolveImageUrl(images[currentImageIndex]);
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
  const isCompact = size === "compact";
  const titleSize = isCompact ? "text-[12px] sm:text-[13px]" : undefined;
  const priceSize = isCompact ? "text-sm sm:text-base" : "text-xl";
  const oldPriceSize = isCompact ? "text-[11px] sm:text-xs" : "text-sm";
  const footerPadding = isCompact ? "p-2.5" : "p-4";
  const actionIconSize = isCompact ? "h-7 w-7" : "h-9 w-9";
  const addBtnHeight = isCompact ? "h-9" : "h-11";
  const iconDimension = isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-4 w-4";
  const minTitleHeight = isCompact ? "min-h-[1.75rem]" : "min-h-[2.5rem]";
  const discountBadge = isCompact ? "text-[9px] px-1.5 py-[2px]" : "text-xs px-2.5 py-1";
  const imgSizes = isCompact
    ? "(max-width:640px) 45vw, (max-width:1024px) 45vw, 45vw,"
    : "(max-width:640px) 90vw, (max-width:1024px) 45vw,, 45vw,";

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

  const handleAddToCart = async (p: ProductResponseModel) => {
    if (addingToCart) return;

    setAddingToCart(true);

    try {
      const item: CartItem = {
        id: p.id,
        name: p.name ?? "Unnamed Product",
        price: p.discountPrice ?? p.price,
        image: resolveImageUrl(p.images?.[0]),
        quantity: 1,
        discount: discountPercent,
        originalPrice: p.price,
      };

      // smartAddToCart will handle stock check for FINA merchants
      // and skip it for CUSTOM merchants
      await addToCart(item);
      await flyToCart(imgRef.current);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error adding to cart:", error);
      toast.error("შეცდომა კალათაში დამატებისას");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inCompare) {
      removeFromCompare(product.id);
      toast.success("შედარებიდან წაიშალა");
    } else {
      const compareItems = useCompareStore.getState().items;

      if (compareItems.length >= 4) {
        toast.error("მაქსიმუმ 4 პროდუქტის შედარება შესაძლებელია");

        return;
      }
      addToCompare(product);
      toast.success("დაემატა შედარებაში");
    }
  };

  return (
    <article
      itemScope
      className={cn(
        "group relative overflow-hidden transition-all duration-300 flex flex-col h-full",
        "rounded-2xl border bg-white border-black/10 dark:bg-zinc-950 dark:border-white/10",
        className
      )}
      itemType="https://schema.org/Product"
    >
      <meta content={product.name || "Product"} itemProp="name" />
      {imageUrl && <meta content={imageUrl} itemProp="image" />}

      <Link
        aria-label={`View ${product.name || "product"} details`}
        className="absolute inset-0 z-0"
        href={`/${currentLang}/product/${product.id}`}
        tabIndex={-1}
      />

      {/* IMAGE */}
      <CardContent className="p-0 relative pointer-events-none"> {/* prevent blocking clicks to link */}
        <div className="relative">
          <AspectRatio
            className={cn("overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 rounded-t-2xl")}
            ratio={1}
            onMouseLeave={() => hasMultipleImages && setCurrentImageIndex(0)}
          >
            {hasMultipleImages && (
              <div className="absolute inset-0 z-10 flex pointer-events-auto">
                {images.map((_, index) => (
                  <button
                    key={index}
                    aria-label={`View image ${index + 1} of ${images.length}`}
                    className="flex-1 cursor-pointer"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    onMouseEnter={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
            <Image
              ref={imgRef as any}
              fill
              alt={product.name || "Product image"}
              className="object-cover transition-opacity duration-300"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              //quality={priority ? 85 : 72}
              sizes={imgSizes}
              src={imageUrl}
            />
          </AspectRatio>

          {/* Image Carousel Indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none z-20">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentImageIndex === index
                      ? "w-6 bg-white shadow-md"
                      : "w-1.5 bg-white/60"
                  )}
                />
              ))}
            </div>
          )}

          {discountPercent > 0 && (
            <div className="absolute left-3 top-3 pointer-events-none z-20">
              <div
                className={cn("rounded-full text-white font-bold shadow-lg", discountBadge)}
                style={{ backgroundColor: themeColor }}
              >
                -{discountPercent}%
              </div>
            </div>
          )}

          {showActions && (
            <div className="absolute right-3 top-3 flex gap-2 pointer-events-auto">
              <Button
                className={cn(
                  "rounded-full shadow-lg transition-all",
                  actionIconSize,
                  "bg-white/95 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
                )}
                size="icon"
                style={inCompare ? { backgroundColor: themeColor, color: 'white' } : {}}
                type="button"
                variant="secondary"
                onClick={handleCompareToggle}
              >
                <ArrowLeftRight className={cn(iconDimension)} />
                <span className="font-primary sr-only">{inCompare ? "Remove from compare" : "Add to compare"}</span>
              </Button>
              <Button
                className={cn(
                  "rounded-full shadow-lg transition-all",
                  actionIconSize,
                  "bg-white/95 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
                )}
                disabled={wishlistLoading}
                size="icon"
                style={inWishlist ? { backgroundColor: '#ef4444', color: 'white' } : {}}
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleWishlistToggle(e);
                }}
              >
                <Heart className={cn(iconDimension, inWishlist && "fill-current")} />
                <span className="font-primary sr-only">{inWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* CONTENT */}
      <CardFooter className={cn("relative pointer-events-none flex flex-col items-start gap-3 flex-1", footerPadding)}>
        <div itemScope className="flex items-baseline gap-2 w-full flex-wrap" itemProp="offers" itemType="https://schema.org/Offer">
          <meta content="GEL" itemProp="priceCurrency" />
          <meta content={displayPrice.toString()} itemProp="price" />
          <meta content={isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} itemProp="availability" />
          <span
            className={cn(priceSize, "font-primary font-extrabold whitespace-nowrap")}
            style={{ color: themeColor }}
          >
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && <span className={cn(oldPriceSize, "font-primary line-through whitespace-nowrap opacity-60 text-muted-foreground dark:text-zinc-400")}>{formatPrice(product.price)}</span>}
        </div>
        <div className="mt-auto w-full space-y-2.5">
          <h3
            className={cn(
              "text-[15px] font-semibold leading-snug",
              titleSize,
              "font-heading text-zinc-900 dark:text-zinc-100 w-full",
              minTitleHeight,
              "line-clamp-2"
            )}
            itemProp="name"
          >
            {product.name || "Unnamed Product"}
          </h3>

          {conditionLabel && product.condition !== Condition.New && (
            <span
              className="font-primary text-[11px] px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300 line-clamp-2"
            >
              {conditionLabel}
            </span>
          )}

          <div className="w-full flex items-stretch gap-2 pointer-events-auto">
            <Button
              className={cn(
                addBtnHeight,
                "flex-1 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 text-white",
                "transition-all",
                // Hide on desktop, show on hover and always show on mobile
                ""
              )}
              disabled={!isInStock || product.isComingSoon || addingToCart}
              style={{ backgroundColor: themeColor }}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              {addingToCart ? (
                <>
                  <Loader2 className={cn(iconDimension, "animate-spin")} />
                  <span className="font-primary hidden sm:inline">Checking...</span>
                  <span className="font-primary sm:hidden">Wait...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className={cn(iconDimension)} />
                  <span className="font-primary hidden sm:inline">{dic?.common?.addToCart || "Add to Cart"}</span>
                  <span className="font-primary sm:hidden">{dic?.common?.addToCartShort || "Add"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </article>
  );
}


export function ProductCardSkeleton() {
  return (
    <article className={cn("overflow-hidden rounded-2xl border bg-white border-black/10 dark:bg-zinc-950 dark:border-white/10")}>
      <CardContent className="p-4">
        <div className={cn("relative p-2 rounded-xl shadow-inner bg-zinc-100 dark:bg-zinc-900/60 rounded-t-2xl")}>
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

        <div className="mt-1 w-full flex items-stretch gap-2">
          <div className="h-11 flex-1 rounded-xl animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-11 w-11 rounded-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </CardFooter>
    </article>
  );
}
