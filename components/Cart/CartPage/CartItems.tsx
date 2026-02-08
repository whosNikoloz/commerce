"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { AvailabilityMap } from "./cart-page";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/app/context/cartContext";
import { CartItemType } from "@/types/cart";
import { useDictionary } from "@/app/context/dictionary-provider";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ka-GE", { style: "currency", currency: "GEL" }).format(price).replace("GEL", "₾");

const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
const percent = (o: number, c: number) => Math.max(0, Math.round(((o - c) / o) * 100));

function formatSpecs(facets?: Record<string, string>) {
  if (!facets) return "";
  const entries = Object.entries(facets);

  if (!entries.length) return "";

  return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
}

interface CartItemsProps {
  availability?: AvailabilityMap;
  loading?: boolean;
  stockEnabled?: boolean;
}

export default function CartItems({
  availability = {} as AvailabilityMap,
  loading = false,
  stockEnabled = false,
}: CartItemsProps) {
  const dictionary = useDictionary();
  const cart = useCartStore((s) => s.cart);
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const items = (cart as Array<CartItemType & { originalPrice?: number }>) ?? [];

  useEffect(() => {
    // Only adjust quantities when we have loaded availability data
    if (loading) return;

    for (const it of items) {
      const qty = toNumber(it.quantity);
      const maxAvail = Number(availability[String(it.id)] ?? 0);

      if (qty > maxAvail && maxAvail > 0) {
        updateCartItem(it.id, Math.max(0, maxAvail));
      }
    }
  }, [JSON.stringify(availability), loading]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => {
        const price = toNumber(item.price);
        const originalPrice = item.originalPrice ? toNumber(item.originalPrice) : null;
        const hasDiscount = !!originalPrice && originalPrice > price;
        const discount = hasDiscount ? percent(originalPrice!, price) : 0;
        const quantity = toNumber(item.quantity);
        const specsLine = formatSpecs(item.selectedFacets);

        const available = Number(availability[String(item.id)] ?? 0);
        const isCheckingStock = stockEnabled && (loading || !(String(item.id) in availability));
        const outOfStock = stockEnabled && !isCheckingStock && available <= 0;

        return (
          <div
            key={`${item.id}`}
            className={`relative bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              outOfStock
                ? "border-red-300 dark:border-red-500/30 shadow-sm shadow-red-500/5"
                : "border-gray-200 dark:border-white/10 hover:border-brand-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Left accent bar */}
            <div className={`absolute top-0 left-0 w-1 sm:w-1.5 h-full rounded-l-2xl sm:rounded-l-3xl ${
              outOfStock ? "bg-red-500" : hasDiscount ? "bg-amber-500" : "bg-brand-primary"
            }`} />

            <div className="pl-4 sm:pl-6 pr-3 sm:pr-5 py-3.5 sm:py-5">
              <div className="flex gap-3 sm:gap-4">
                {/* Product image */}
                <div className="relative shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 ring-1 ring-black/[0.03] dark:ring-white/5">
                    <Image
                      fill
                      priority
                      alt={item.name}
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                      src={item.image || "/placeholder.png"}
                    />
                  </div>
                  {hasDiscount && (
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg shadow-sm">
                      -{discount}%
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Name + remove button row */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 dark:text-white tracking-tight">
                      {item.name}
                    </h3>
                    <button
                      aria-label="Remove"
                      className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                    </button>
                  </div>

                  {/* Variant badges */}
                  {!!specsLine && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {Object.entries(item.selectedFacets!).map(([k, v]) => (
                        <span
                          key={k}
                          className="inline-flex items-center text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-brand-primary/8 text-brand-primary border border-brand-primary/15 font-semibold"
                        >
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stock info */}
                  {stockEnabled && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {isCheckingStock ? (
                        <span className="inline-flex items-center text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                          {dictionary.cart.checkingStock}
                        </span>
                      ) : outOfStock ? (
                        <span className="inline-flex items-center text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
                          {dictionary.cart.outOfStock}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">
                          {dictionary.cart.stock.replace("{count}", String(available))}
                        </span>
                      )}
                      {!isCheckingStock && quantity > available && available > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {dictionary.cart.stockLimitExceeded.replace("{count}", String(available))}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom row: Price + Quantity */}
                  <div className="mt-auto pt-2.5 sm:pt-3 flex items-center justify-between gap-2">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-base sm:text-lg dark:text-white">
                        {formatPrice(price * quantity)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">
                          {formatPrice(originalPrice! * quantity)}
                        </span>
                      )}
                      {quantity > 1 && (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          ({formatPrice(price)} x {quantity})
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 overflow-hidden">
                      <button
                        aria-label="Decrease"
                        className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        disabled={quantity <= 1}
                        onClick={() =>
                          updateCartItem(item.id, Math.max(1, quantity - 1))
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2rem] sm:min-w-[2.5rem] text-center text-sm font-bold dark:text-white select-none">
                        {quantity}
                      </span>
                      <button
                        aria-label="Increase"
                        className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        disabled={outOfStock || quantity >= available}
                        onClick={() => {
                          const next = Math.min(quantity + 1, available);

                          updateCartItem(item.id, next);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
