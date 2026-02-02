"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Truck, Tag, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Condition, StockStatus } from "@/types/enums";
import { useDictionary } from "@/app/context/dictionary-provider";
import { useUser } from "@/app/context/userContext";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/api/services/orderService";

type Currency = "₾" | "$" | "€";

interface ProductInfoProps {
  productId: string;
  price: number;
  originalPrice: number | null;
  brand?: string;
  discount?: number;
  condition?: Condition;
  status?: StockStatus;
  stock?: number;
  isComingSoon?: boolean;
  isNewArrival?: boolean;
  isLiquidated?: boolean;
  freeShipping?: boolean;
  stockLoading?: boolean;
  stockError?: string;
  currency?: Currency;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

function formatPrice(v: number, currency: Currency) {
  // console.log("Currency:", v);
  return v.toFixed(2) + " " + currency;
}

export function ProductInfo({
  productId,
  price,
  originalPrice,
  discount,
  brand,
  condition,
  status,
  stock,
  isComingSoon = false,
  isNewArrival: _isNewArrival = false,
  isLiquidated = false,
  freeShipping = true,
  stockLoading = false,
  stockError,
  currency = "₾",
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const dict = useDictionary();
  const { user } = useUser();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    if (user && productId) {
      isInWishlist(productId)
        .then(setInWishlist)
        .catch(() => setInWishlist(false));
    }
  }, [user, productId]);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error(dict?.product?.errors?.authRequired || "Please log in first");

      return;
    }
    if (!productId) return;

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        setInWishlist(false);
        toast.success(dict?.wishlist?.removed || "Removed from wishlist");
      } else {
        await addToWishlist(productId);
        setInWishlist(true);
        toast.success(dict?.wishlist?.added || "Added to wishlist");
      }
    } catch (error) {
      toast.error(dict?.wishlist?.error || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  /* ---------- helpers ---------- */
  const getConditionLabel = (condition?: Condition) => {
    switch (condition) {
      case Condition.New:
        return dict?.common?.new;
      case Condition.Used:
        return dict?.common?.used;
      case Condition.LikeNew:
        return dict?.common?.likeNew;
      default:
        return dict?.common?.unknownCondition;
    }
  };

  const getStatusLabel = (
    status?: StockStatus,
    comingSoon?: boolean,
    opts?: { loading?: boolean; error?: boolean }
  ) => {
    if (opts?.loading) return dict?.cart?.checkingStock;
    if (opts?.error) return dict?.common?.loadError;
    if (comingSoon) return dict?.common?.comingSoon;
    switch (status) {
      case StockStatus.InStock:
        return dict?.common?.inStock;
      case StockStatus.OutOfStock:
        return dict?.cart?.outOfStock;
      default:
        return dict?.common?.unknownStatus;
    }
  };
  const computedDiscount =
    discount ??
    (originalPrice && originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  const hasDiscount = !!originalPrice && originalPrice > price && computedDiscount > 0;

  const isStockKnown = !stockLoading && !stockError;
  const inStockByStatus = status === StockStatus.InStock && !isComingSoon;
  const hasPositiveQty = typeof stock === "number" ? stock > 0 : true;

  // Disable buying if loading, error, coming soon, status says out, or qty <= 0
  const isBuyingDisabled =
    stockLoading || !!stockError || !inStockByStatus || !hasPositiveQty;

  // Status badge style - Enhanced contrast
  const statusBadgeClass = stockLoading
    ? "bg-slate-700 text-white font-semibold"
    : stockError
      ? "bg-red-700 text-white font-semibold"
      : !inStockByStatus
        ? "bg-slate-700 text-white font-semibold"
        : "bg-emerald-700 text-white font-semibold shadow-sm border border-emerald-800";

  return (
    <div className="space-y-5">
      <div
        className="
          md:sticky md:top-20
          w-full
          p-5 rounded-xl border bg-card
          shadow-sm
        "
      >
        {/* Top row: Price + discount (always visible) */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-2xl md:text-3xl font-extrabold text-foreground">
              {formatPrice(price, currency)}
            </div>

            {hasDiscount && (
              <div className="mt-1 flex items-center gap-2">
                <span className="font-primary text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice!, currency)}
                </span>
                <Badge className="h-6 px-2.5 text-[11px] font-bold leading-none bg-red-600 text-white">
                  -{computedDiscount}%
                </Badge>
              </div>
            )}
          </div>

          {/* Status chip (reflects loading/error/coming soon/stock) */}
          <Badge
            aria-busy={stockLoading || undefined}
            className={`h-7 px-3 text-xs font-semibold ${statusBadgeClass}`}
            title={getStatusLabel(status, isComingSoon, {
              loading: stockLoading,
              error: !!stockError,
            })}
          >
            {getStatusLabel(status, isComingSoon, {
              loading: stockLoading,
              error: !!stockError,
            })}
          </Badge>
        </div>

        {/* Subtle info row (desktop only, mobile hides clutter) */}
        <div className="hidden md:flex flex-wrap items-center gap-2 mt-4">
          {brand && (
            <Badge className="bg-muted text-foreground border" variant="secondary">
              {brand}
            </Badge>
          )}

          {/* Stock chips – only show concrete numbers when stock is known */}
          {isStockKnown && typeof stock === "number" && (
            <>
              {stock <= 0 ? (
                <Badge className="bg-red-600 text-white">
                  {dict?.cart?.outOfStock || "მარაგში არ არის"}
                </Badge>
              ) : stock <= 3 ? (
                <Badge className="bg-amber-600 text-white">
                  {dict?.common?.lastStock?.replace("{count}", stock.toString()) || `ბოლო ${stock} ც`}
                </Badge>
              ) : stock <= 10 ? (
                <Badge className="bg-blue-600 text-white">
                  {dict?.common?.remainingStock?.replace("{count}", stock.toString()) || `დარჩა ${stock} ც`}
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white">
                  {dict?.cart?.stock?.replace("{count}", stock.toString()) || `მარაგშია (${stock} ც)`}
                </Badge>
              )}
            </>
          )}

          {/* While loading / error, show a single neutral badge */}
          {!isStockKnown && (
            <Badge className={stockError ? "bg-red-600 text-white" : "bg-slate-500 text-white"}>
              {stockLoading
                ? dict?.cart?.checkingStock
                : dict?.common?.loadError}
            </Badge>
          )}

          {isLiquidated && (
            <Badge className="bg-blue-700 text-white">
              <Tag className="h-3.5 w-3.5 mr-1" /> {dict?.common?.liquidation}
            </Badge>
          )}
          {condition != null && (
            <Badge className="bg-muted text-foreground border" variant="secondary">
              {getConditionLabel(condition)}
            </Badge>
          )}
        </div>

        {/* Delivery hint (desktop only) */}
        {freeShipping && (
          <div className="hidden md:flex items-center gap-3 mt-4 rounded-lg border px-4 py-3 text-sm bg-muted/40">
            <span className="font-primary inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <Truck className="h-4 w-4" />
            </span>
            <span className="font-primary text-foreground font-medium">
              {dict?.common?.freeShipping}
            </span>
          </div>
        )}

        {/* Actions — MOBILE */}
        <div className="md:hidden mt-5 grid grid-cols-1 gap-3">
          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-12 justify-center gap-2 rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg"
            disabled={isBuyingDisabled}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {stockLoading
                ? dict?.common?.loading
                : stockError
                  ? dict?.common?.loadError
                  : isComingSoon
                    ? dict?.common?.comingSoon
                    : !inStockByStatus || !hasPositiveQty
                      ? dict?.common?.soldOut
                      : dict?.common?.addToCart}
            </span>
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              aria-disabled={isBuyingDisabled}
              className="w-full h-12 justify-center rounded-lg bg-indigo-700 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg"
              disabled={isBuyingDisabled}
              onClick={onBuyNow}
            >
              {stockLoading
                ? dict?.common?.loading
                : stockError
                  ? dict?.common?.loadError
                  : dict?.cart?.buy}
            </Button>

            <Button
              className={`w-full h-12 justify-center gap-2 rounded-lg font-semibold text-base shadow-lg transition-all ${inWishlist
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                }`}
              disabled={wishlistLoading}
              onClick={handleWishlistToggle}
            >
              {wishlistLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
              )}
              <span className="sr-only md:not-sr-only">
                {inWishlist ? dict?.wishlist?.remove : dict?.wishlist?.add}
              </span>
            </Button>
          </div>
        </div>

        {/* Actions — DESKTOP */}
        <div className="hidden md:grid mt-5 grid-cols-1 gap-3">
          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-12 justify-center gap-2 rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg"
            disabled={isBuyingDisabled}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {stockLoading
                ? dict?.common?.loading
                : stockError
                  ? dict?.common?.loadError
                  : isComingSoon
                    ? dict?.common?.comingSoon
                    : !inStockByStatus || !hasPositiveQty
                      ? dict?.common?.soldOut
                      : dict?.common?.addToCartShort}
            </span>
          </Button>
          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-12 justify-center rounded-lg bg-indigo-700 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg"
            disabled={isBuyingDisabled}
            onClick={onBuyNow}
          >
            {stockLoading
              ? dict?.common?.loading
              : stockError
                ? dict?.common?.loadError
                : dict?.cart?.buy}
          </Button>
          <Button
            className={`w-full h-12 justify-center gap-2 rounded-lg font-semibold text-base shadow-lg transition-all ${inWishlist
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-muted text-foreground hover:bg-muted/80 border border-border"
              }`}
            disabled={wishlistLoading}
            onClick={handleWishlistToggle}
          >
            {wishlistLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
            )}
            <span>{inWishlist ? (dict?.wishlist?.remove || "Remove") : (dict?.wishlist?.add || "Wishlist")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
