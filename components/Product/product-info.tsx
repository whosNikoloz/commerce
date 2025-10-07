"use client";

import { ShoppingCart, Truck, Sparkles, Clock3, Tag, PackageOpen } from "lucide-react";

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
    <div className="space-y-6">
      <div
        className="
          md:sticky relative md:top-20 sm:max-w-72 md:w-full
          p-6 rounded-2xl border-2 border-border/50
          bg-gradient-to-br from-card to-card/90 backdrop-blur-sm
          shadow-2xl shadow-black/10 dark:shadow-black/30
          hover:shadow-3xl hover:shadow-brand-primary/10
          transition-shadow duration-300
        "
      >
        {/* Flags & brand */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isComingSoon && (
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
              <Clock3 className="h-3 w-3 mr-1" /> მალე
            </Badge>
          )}
          {isNewArrival && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" /> ახალი
            </Badge>
          )}
          {isLiquidated && (
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg font-bold">
              <Tag className="h-3 w-3 mr-1" /> ლიკვიდაცია
            </Badge>
          )}
          {brand && (
            <Badge className="bg-muted/50 text-foreground border border-border/50 shadow-sm" variant="secondary">
              {brand}
            </Badge>
          )}
          {typeof stock === "number" && stock <= 3 && stock > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg animate-pulse">
              <PackageOpen className="h-3 w-3 mr-1" /> ბოლო {stock} ც
            </Badge>
          )}
        </div>

        {/* Price row */}
        <div className="min-w-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 p-4 rounded-xl bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 border border-brand-primary/20">
          <span className="text-3xl font-extrabold leading-none text-foreground">
            {formatPrice(price, currency)}
          </span>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through leading-none">
                  {formatPrice(originalPrice!, currency)}
                </span>
                <Badge className="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold leading-none bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
                  {"-" + computedDiscount + "%"}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Status + Condition */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Badge
            className={`inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold leading-none shadow-lg
              ${isOut ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white" : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"}`}
            title={getStatusLabel(status, isComingSoon)}
          >
            {inStock && <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-2" />}
            {getStatusLabel(status, isComingSoon)}
          </Badge>

          {condition != null && (
            <Badge
              className="inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold leading-none shadow-md
                         bg-muted/50 border border-border/50 text-foreground"
              title={getConditionLabel(condition)}
            >
              {getConditionLabel(condition)}
            </Badge>
          )}
        </div>

        {/* Delivery */}
        {freeShipping && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-border/50 px-4 py-3 text-sm bg-gradient-to-r from-blue-500/5 to-cyan-500/5 shadow-md">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Truck className="h-4 w-4 text-white" />
            </span>
            <span className="text-foreground font-medium">
              სწრაფი მიწოდება მთელ საქართველოში
            </span>
          </div>
        )}

        {/* Actions (mobile) */}
        <div className="md:hidden space-y-3 mt-6">
          <Button
            aria-disabled={isOut}
            className="w-full flex items-center justify-center gap-2
                       bg-gradient-to-r from-brand-primary to-brand-primary/90
                       hover:from-brand-primary/90 hover:to-brand-primary/80
                       text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/30
                       hover:shadow-xl hover:shadow-brand-primary/40 transition-all duration-300
                       hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isOut}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isComingSoon ? "მალე" : isOut ? "ამოიწურა" : "კალათაში დამატება"}</span>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              aria-disabled={isOut}
              className="w-full flex items-center justify-center
                         bg-gradient-to-r from-indigo-600 to-purple-600
                         hover:from-indigo-500 hover:to-purple-500
                         text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30
                         hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300
                         hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isOut}
              onClick={onBuyNow}
            >
              <span>ყიდვა</span>
            </Button>
          </div>
        </div>

        {/* Actions (desktop) */}
        <div className="hidden md:block mt-6 space-y-3">
          <Button
            aria-disabled={isOut}
            className="w-full flex items-center justify-center gap-2
                       bg-gradient-to-r from-brand-primary to-brand-primary/90
                       hover:from-brand-primary/90 hover:to-brand-primary/80
                       text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/30
                       hover:shadow-xl hover:shadow-brand-primary/40 transition-all duration-300
                       hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isOut}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isComingSoon ? "მალე" : isOut ? "ამოიწურა" : "დამატება"}</span>
          </Button>

          <div className="grid grid-cols-1 gap-2">
            <Button
              aria-disabled={isOut}
              className="w-full flex items-center justify-center
                         bg-gradient-to-r from-indigo-600 to-purple-600
                         hover:from-indigo-500 hover:to-purple-500
                         text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30
                         hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300
                         hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isOut}
              onClick={onBuyNow}
            >
              <span>ყიდვა</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
