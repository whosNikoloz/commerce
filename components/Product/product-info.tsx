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
      <div className="md:sticky relative md:top-20 max-w-72 p-6 rounded-lg shadow-sm border dark:bg-brand-muteddark bg-brand-muted">
        {/* Top chips: flags & brand */}
        <div className="flex flex-wrap gap-2 mb-3">
          {isComingSoon && (
            <Badge className="bg-yellow-500 text-black">
              <Clock3 className="h-3 w-3 mr-1" /> მალე
            </Badge>
          )}
          {isNewArrival && (
            <Badge className="bg-green-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" /> ახალი
            </Badge>
          )}
          {isLiquidated && (
            <Badge className="bg-red-600 text-white">
              <Tag className="h-3 w-3 mr-1" /> ლიკვიდაცია
            </Badge>
          )}
          {brand && <Badge variant="secondary">{brand}</Badge>}
          {typeof stock === "number" && stock <= 3 && stock > 0 && (
            <Badge className="bg-orange-600 text-white">
              <PackageOpen className="h-3 w-3 mr-1" /> ბოლო {stock} ც
            </Badge>
          )}
        </div>

        {/* Price row */}
        <div className="min-w-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-2xl font-extrabold leading-none">
            {formatPrice(price, currency)}
          </span>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through leading-none">
                  {formatPrice(originalPrice!, currency)}
                </span>
                <Badge className="inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold leading-none bg-red-500 text-white">
                  {"-" + computedDiscount + "%"}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Status + Condition */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <Badge
            className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold leading-none shadow-sm ${
              isOut ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
            }`}
            title={getStatusLabel(status, isComingSoon)}
          >
            {getStatusLabel(status, isComingSoon)}
          </Badge>

          {condition != null && (
            <Badge
              className="inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold leading-none shadow-sm"
              title={getConditionLabel(condition)}
            >
              {getConditionLabel(condition)}
            </Badge>
          )}
        </div>

        {/* Delivery info */}
        {freeShipping && (
          <div className="mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">
              <Truck className="h-4 w-4" />
            </span>
            <span className="text-foreground/90">სწრაფი მიწოდება მთელ საქართველოში</span>
          </div>
        )}

        {/* Actions (mobile) */}
        <div className="md:hidden space-y-2 mt-4">
          <Button
            aria-disabled={isOut}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md disabled:opacity-60"
            disabled={isOut}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isComingSoon ? "მალე" : isOut ? "ამოიწურა" : "კალათაში დამატება"}</span>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              aria-disabled={isOut}
              className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-md disabled:opacity-60"
              disabled={isOut}
              onClick={onBuyNow}
            >
              <span>ყიდვა</span>
            </Button>
          </div>
        </div>

        {/* Actions (desktop) */}
        <div className="hidden md:block mt-4 space-y-3">
          <Button
            aria-disabled={isOut}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md disabled:opacity-60"
            disabled={isOut}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isComingSoon ? "მალე" : isOut ? "ამოიწურა" : "დამატება"}</span>
          </Button>
          <div className="grid grid-cols-1 gap-2">
            <Button
              aria-disabled={isOut}
              className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-md disabled:opacity-60"
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
