"use client";

import { ShoppingCart, Truck, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Condition, StockStatus } from "@/types/enums";

type Currency = "₾" | "$" | "€";

interface ProductInfoProps {
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
  currency?: Currency;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

/* ---------- helpers ---------- */
const getConditionLabel = (condition?: Condition) => {
  switch (condition) {
    case Condition.New:
      return "ახალი";
    case Condition.Used:
      return "მეორადი";
    case Condition.LikeNew:
      return "როგორც ახალი";
    default:
      return "უცნობი მდგომარეობა";
  }
};

const getStatusLabel = (status?: StockStatus, comingSoon?: boolean) => {
  if (comingSoon) return "მალე";
  switch (status) {
    case StockStatus.InStock:
      return "მარაგშია";
    case StockStatus.OutOfStock:
      return "არ არის მარაგში";
    default:
      return "უცნობი სტატუსი";
  }
};

function formatPrice(v: number, currency: Currency) {
  return v.toFixed(2) + " " + currency;
}

/* =========================================================
   Simplified, responsive ProductInfo
   - No gradients
   - Mobile: minimal info, perfect button alignment
   - Desktop: a bit more detail (brand / condition / shipping)
========================================================= */
export function ProductInfo({
  price,
  originalPrice,
  discount,
  brand,
  condition,
  status,
  stock,
  isComingSoon = false,
  isNewArrival = false,
  isLiquidated = false,
  freeShipping = true,
  currency = "₾",
  onAddToCart,
  onBuyNow,
}: ProductInfoProps) {
  const computedDiscount =
    discount ??
    (originalPrice && originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  const hasDiscount = !!originalPrice && originalPrice > price && computedDiscount > 0;
  const inStock = status === StockStatus.InStock && !isComingSoon;
  const isOut = !inStock;

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
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice!, currency)}
                </span>
                <Badge className="h-6 px-2.5 text-[11px] font-bold leading-none bg-red-600 text-white">
                  -{computedDiscount}%
                </Badge>
              </div>
            )}
          </div>

          {/* Simple status chip (mobile & desktop) */}
          <Badge
            className={`h-7 px-3 text-xs font-semibold ${
              isOut ? "bg-slate-600 text-white" : "bg-emerald-600 text-white"
            }`}
            title={getStatusLabel(status, isComingSoon)}
          >
            {getStatusLabel(status, isComingSoon)}
          </Badge>
        </div>

        {/* Subtle info row (desktop only, mobile hides clutter) */}
        <div className="hidden md:flex flex-wrap items-center gap-2 mt-4">
          {brand && (
            <Badge variant="secondary" className="bg-muted text-foreground border">
              {brand}
            </Badge>
          )}
          {typeof stock === "number" && (
            <>
              {stock <= 0 ? (
                <Badge className="bg-red-600 text-white">
                  მარაგში არ არის
                </Badge>
              ) : stock <= 3 ? (
                <Badge className="bg-amber-600 text-white">
                  ბოლო {stock} ც
                </Badge>
              ) : stock <= 10 ? (
                <Badge className="bg-orange-600 text-white">
                  დარჩა {stock} ც
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white">
                  მარაგშია ({stock} ც)
                </Badge>
              )}
            </>
          )}
          {isLiquidated && (
            <Badge className="bg-blue-700 text-white">
              <Tag className="h-3.5 w-3.5 mr-1" /> ლიკვიდაცია
            </Badge>
          )}
          {condition != null && (
            <Badge variant="secondary" className="bg-muted text-foreground border">
              {getConditionLabel(condition)}
            </Badge>
          )}
        </div>

        {/* Delivery hint (desktop only) */}
        {freeShipping && (
          <div className="hidden md:flex items-center gap-3 mt-4 rounded-lg border px-4 py-3 text-sm bg-muted/40">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <Truck className="h-4 w-4" />
            </span>
            <span className="text-foreground font-medium">სწრაფი მიწოდება მთელ საქართველოში</span>
          </div>
        )}

        {/* Actions — MOBILE (stacked, equal width, no gradients) */}
        <div className="md:hidden mt-5 grid grid-cols-1 gap-2">
          <Button
            aria-disabled={isOut}
            disabled={isOut}
            onClick={onAddToCart}
            className="w-full h-11 justify-center gap-2 rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isComingSoon ? "მალე" : isOut ? "ამოიწურა" : "კალათაში დამატება"}</span>
          </Button>

          <Button
            aria-disabled={isOut}
            disabled={isOut}
            onClick={onBuyNow}
            className="w-full h-11 justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ყიდვა
          </Button>
        </div>

        {/* Actions — DESKTOP (stacked, equal width, no gradients) */}
        <div className="hidden md:grid mt-5 grid-cols-1 gap-2">
          <Button
            aria-disabled={isOut}
            disabled={isOut}
            onClick={onAddToCart}
            className="w-full h-11 justify-center gap-2 rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isComingSoon ? "მალე" : isOut ? "ამოიწურა" : "დამატება"}</span>
          </Button>

          <Button
            aria-disabled={isOut}
            disabled={isOut}
            onClick={onBuyNow}
            className="w-full h-11 justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ყიდვა
          </Button>
        </div>
      </div>
    </div>
  );
}
