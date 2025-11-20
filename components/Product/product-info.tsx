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
  stockLoading?: boolean;
  stockError?: string;
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

const getStatusLabel = (
  status?: StockStatus,
  comingSoon?: boolean,
  opts?: { loading?: boolean; error?: boolean }
) => {
  if (opts?.loading) return "მარაგი იტვირთება…";
  if (opts?.error) return "მარაგი ვერ ჩაიტვირთა";
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
  isNewArrival: _isNewArrival = false, 
  isLiquidated = false,
  freeShipping = true,
  stockLoading = false,
  stockError,
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

  const isStockKnown = !stockLoading && !stockError;
  const inStockByStatus = status === StockStatus.InStock && !isComingSoon;
  const hasPositiveQty = typeof stock === "number" ? stock > 0 : true;

  // Disable buying if loading, error, coming soon, status says out, or qty <= 0
  const isBuyingDisabled =
    stockLoading || !!stockError || !inStockByStatus || !hasPositiveQty;

  // Status badge style
  const statusBadgeClass = stockLoading
    ? "bg-slate-500 text-white"
    : stockError
    ? "bg-red-600 text-white"
    : !inStockByStatus
    ? "bg-slate-600 text-white"
    : "bg-emerald-600 text-white";

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
                <Badge className="bg-red-600 text-white">მარაგში არ არის</Badge>
              ) : stock <= 3 ? (
                <Badge className="bg-amber-600 text-white">ბოლო {stock} ც</Badge>
              ) : stock <= 10 ? (
                <Badge className="bg-blue-600 text-white">დარჩა {stock} ც</Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white">მარაგშია ({stock} ც)</Badge>
              )}
            </>
          )}

          {/* While loading / error, show a single neutral badge */}
          {!isStockKnown && (
            <Badge className={stockError ? "bg-red-600 text-white" : "bg-slate-500 text-white"}>
              {stockLoading ? "მარაგი იტვირთება…" : "მარაგი ვერ ჩაიტვირთა"}
            </Badge>
          )}

          {isLiquidated && (
            <Badge className="bg-blue-700 text-white">
              <Tag className="h-3.5 w-3.5 mr-1" /> ლიკვიდაცია
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
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
              <Truck className="h-4 w-4" />
            </span>
            <span className="text-foreground font-medium">სწრაფი მიწოდება მთელ საქართველოში</span>
          </div>
        )}

        {/* Actions — MOBILE */}
        <div className="md:hidden mt-5 grid grid-cols-1 gap-2">
          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-11 justify-center gap-2 rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBuyingDisabled}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {stockLoading
                ? "იტვირთება…"
                : stockError
                ? "ვერ ჩაიტვირთა"
                : isComingSoon
                ? "მალე"
                : !inStockByStatus || !hasPositiveQty
                ? "ამოიწურა"
                : "კალათაში დამატება"}
            </span>
          </Button>

          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-11 justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBuyingDisabled}
            onClick={onBuyNow}
          >
            {stockLoading ? "იტვირთება…" : stockError ? "ვერ ჩაიტვირთა" : "ყიდვა"}
          </Button>
        </div>

        {/* Actions — DESKTOP */}
        <div className="hidden md:grid mt-5 grid-cols-1 gap-2">
          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-11 justify-center gap-2 rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBuyingDisabled}
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {stockLoading
                ? "იტვირთება…"
                : stockError
                ? "ვერ ჩაიტვირთა"
                : isComingSoon
                ? "მალე"
                : !inStockByStatus || !hasPositiveQty
                ? "ამოიწურა"
                : "დამატება"}
            </span>
          </Button>

          <Button
            aria-disabled={isBuyingDisabled}
            className="w-full h-11 justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBuyingDisabled}
            onClick={onBuyNow}
          >
            {stockLoading ? "იტვირთება…" : stockError ? "ვერ ჩაიტვირთა" : "ყიდვა"}
          </Button>
        </div>
      </div>
    </div>
  );
}
