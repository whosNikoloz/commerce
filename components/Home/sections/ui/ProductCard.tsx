"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Heart, ShoppingCart, ArrowLeftRight, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

import { cn, resolveImageUrl, formatPrice, isS3Url } from "@/lib/utils";
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

// Throttle helper for hover events
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

function ProductCardInner({
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

  // Memoized user ID for stable dependency
  const userId = user?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userId && product.id) {
      isInWishlist(product.id).then(setInWishlist).catch(() => setInWishlist(false));
    }
  }, [userId, product.id]);

  // Memoize computed values
  const images = useMemo(() => product.images || [], [product.images]);
  const hasMultipleImages = images.length > 1;
  const imageUrl = resolveImageUrl(images[currentImageIndex]);
  const isInStock = product.status === StockStatus.InStock;

  const { hasDiscount, displayPrice, discountPercent } = useMemo(() => {
    const hasDisc = !!product.discountPrice && product.discountPrice < product.price;
    const dispPrice = hasDisc ? product.discountPrice! : product.price;
    const discPct = hasDisc
      ? Math.max(0, Math.round(((product.price - (product.discountPrice as number)) / product.price) * 100))
      : 0;
    return { hasDiscount: hasDisc, displayPrice: dispPrice, discountPercent: discPct };
  }, [product.discountPrice, product.price]);

  // Limit to max 4 zones
  const maxZones = 4;
  const hasMoreImages = images.length > maxZones;
  const remainingImagesCount = images.length - maxZones;

  const conditionLabel = useMemo(() => {
    return product.condition === Condition.New
      ? "New"
      : product.condition === Condition.LikeNew
        ? "Like New"
        : product.condition === Condition.Used
          ? "Used"
          : "";
  }, [product.condition]);

  // Memoize size-dependent styles
  const sizeStyles = useMemo(() => {
    const isCompact = size === "compact";
    return {
      isCompact,
      titleSize: isCompact ? "text-[12px] sm:text-[13px]" : undefined,
      priceSize: isCompact ? "text-sm sm:text-base" : "text-xl",
      oldPriceSize: isCompact ? "text-[11px] sm:text-xs" : "text-sm",
      footerPadding: isCompact ? "p-2.5" : "p-4",
      actionIconSize: isCompact ? "h-7 w-7" : "h-9 w-9",
      addBtnHeight: isCompact ? "h-9" : "h-11",
      iconDimension: isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-4 w-4",
      minTitleHeight: isCompact ? "min-h-[1.75rem]" : "min-h-[2.5rem]",
      discountBadge: isCompact ? "text-[9px] px-1.5 py-[2px]" : "text-xs px-2.5 py-1",
      imgSizes: "(max-width:640px) 230px, (max-width:1024px) 230px, 230px",
    };
  }, [size]);

  const { titleSize, priceSize, oldPriceSize, footerPadding, actionIconSize, addBtnHeight, iconDimension, minTitleHeight, discountBadge, imgSizes } = sizeStyles;

  // Throttled image index setter - only update every 50ms max
  const throttledSetImageIndex = useMemo(
    () => throttle((index: number) => setCurrentImageIndex(index), 50),
    []
  );

  // Memoized hover handlers
  const handleImageHover = useCallback((index: number) => {
    throttledSetImageIndex(index);
  }, [throttledSetImageIndex]);

  const handleImageLeave = useCallback(() => {
    if (hasMultipleImages) setCurrentImageIndex(0);
  }, [hasMultipleImages]);

  const handleWishlistToggle = useCallback(async (e: React.MouseEvent) => {
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
  }, [user, product.id, inWishlist]);

  const handleAddToCart = useCallback(async () => {
    if (addingToCart) return;

    setAddingToCart(true);

    try {
      const item: CartItem = {
        id: product.id,
        name: product.name ?? "Unnamed Product",
        price: product.discountPrice ?? product.price,
        image: resolveImageUrl(product.images?.[0]),
        quantity: 1,
        discount: discountPercent,
        originalPrice: product.price,
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
  }, [addingToCart, product.id, product.name, product.discountPrice, product.price, product.images, discountPercent, addToCart, flyToCart]);

  const handleCompareToggle = useCallback((e: React.MouseEvent) => {
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
  }, [inCompare, removeFromCompare, product, addToCompare]);

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
            className={cn("overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 rounded-t-2xl relative")}
            ratio={1}
            onMouseLeave={handleImageLeave}
          >
            <Image
              ref={imgRef as any}
              fill
              alt={product.name || "Product image"}
              className="object-cover transition-opacity duration-300"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
              sizes={imgSizes}
              src={imageUrl}
              unoptimized={isS3Url(imageUrl)}
            />

            {/* Hover zones - with subtle visual hints (desktop only) */}
            {hasMultipleImages && (
              <div className="hidden md:flex absolute inset-0 z-10 gap-[2px] pointer-events-none">
                {images.slice(0, 4).map((_, index) => (
                  <Link
                    key={index}
                    href={`/${currentLang}/product/${product.id}`}
                    className="flex-1 hover:bg-white/5 transition-all duration-200 relative pointer-events-auto"
                    onMouseEnter={() => handleImageHover(index)}
                  >
                    {/* Subtle edge highlight on hover */}
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity border-x border-white/10 pointer-events-none" />
                  </Link>
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
          </AspectRatio>

          {discountPercent > 0 && (
            <div className="absolute left-3 top-3 pointer-events-none z-20">
              <div
                className={cn("rounded-full font-bold shadow-lg", discountBadge)}
                style={{
                  backgroundColor: themeColor,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,0.9)',
                  border: '1px solid rgba(0,0,0,0.2)'
                }}
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
                handleAddToCart();
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
                  <span className="font-primary hidden 2xl:inline">{dic?.common?.addToCart || "Add to Cart"}</span>
                  <span className="font-primary 2xl:hidden">{dic?.common?.addToCartShort || "Add"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </article>
  );
}

// Memoized ProductCard - only re-renders when product data actually changes
export const ProductCard = memo(ProductCardInner, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render when necessary
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.discountPrice === nextProps.product.discountPrice &&
    prevProps.product.status === nextProps.product.status &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.priority === nextProps.priority &&
    prevProps.size === nextProps.size &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.className === nextProps.className &&
    // Check images length - don't deep compare array
    (prevProps.product.images?.length || 0) === (nextProps.product.images?.length || 0)
  );
});

ProductCard.displayName = "ProductCard";

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
