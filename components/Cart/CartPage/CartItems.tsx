// app/(routes)/cart/CartItems.tsx
"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/app/context/cartContext";
import { CartItemType } from "@/types/cart";
import { useEffect } from "react";
import { AvailabilityMap } from "./cart-page";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ka-GE", { style: "currency", currency: "GEL" }).format(price);

const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
const percent = (o: number, c: number) => Math.max(0, Math.round(((o - c) / o) * 100));

function formatSpecs(facets?: Record<string, string>) {
  if (!facets) return "";
  const entries = Object.entries(facets);
  if (!entries.length) return "";
  return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
}

export default function CartItems({ availability = {} as AvailabilityMap }) {
  const cart = useCartStore((s) => s.cart);
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const items = (cart as Array<CartItemType & { originalPrice?: number }>) ?? [];

  useEffect(() => {
    for (const it of items) {
      const qty = toNumber(it.quantity);
      const maxAvail = Number(availability[String(it.id)] ?? 0);
      if (qty > maxAvail) {
        updateCartItem(it.id, Math.max(0, maxAvail), (it as any).variantKey);
      }
    }
  }, [JSON.stringify(availability)]);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const price = toNumber(item.price);
        const originalPrice = item.originalPrice ? toNumber(item.originalPrice) : null;
        const hasDiscount = !!originalPrice && originalPrice > price;
        const discount = hasDiscount ? percent(originalPrice!, price) : 0;
        const quantity = toNumber(item.quantity);
        const specsLine = formatSpecs(item.selectedFacets);

        const available = Number(availability[String(item.id)] ?? 0);
        const outOfStock = available <= 0;

        return (
          <Card
            key={`${item.id}-${(item as any).variantKey ?? ""}`}
            className={`p-3 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-br from-card to-card/90 border-2 shadow-lg transition-all duration-300 ${outOfStock
              ? "border-red-500/50 shadow-red-500/10"
              : "border-border/50 hover:border-brand-primary/30 hover:shadow-xl"
              }`}
          >
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_160px_48px] md:items-center">
              {/* left */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-brand-muted dark:bg-brand-muteddark">
                    <Image
                      fill
                      priority
                      alt={item.name}
                      className="object-cover"
                      sizes="96px"
                      src={item.image || "/placeholder.png"}
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium leading-snug line-clamp-2 text-sm sm:text-base text-text-light dark:text-text-lightdark">
                    {item.name}
                  </h3>

                  {!!specsLine && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.selectedFacets!).map(([k, v]) => (
                        <Badge
                          key={k}
                          className="h-5 text-[11px] px-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/30 shadow-sm rounded-full"
                          variant="secondary"
                        >
                          {k}: {v}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* stock info */}
                  <div className="mt-2 flex items-center gap-2">
                    {outOfStock ? (
                      <Badge className="text-[11px] px-1.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400">
                        არ არის მარაგში
                      </Badge>
                    ) : (
                      <Badge className="text-[11px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        მარაგი: {available} ც.
                      </Badge>
                    )}
                    {quantity > available && (
                      <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        მოთხოვნილი რაოდენობა აღემატება მარაგს — დავაკლამპე {available}-ზე
                      </span>
                    )}
                  </div>

                  {/* mobile price */}
                  <div className="mt-2 md:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-text-light dark:text-text-lightdark">
                        {formatPrice(price)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-sm text-text-subtle dark:text-text-subtledark line-through">
                            {formatPrice(originalPrice!)}
                          </span>
                          <Badge className="text-[11px] px-1.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400">
                            -{discount}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* qty */}
              <div className="order-3 md:order-none flex md:justify-center">
                <div className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center rounded-lg border border-brand-muted/70 dark:border-brand-muteddark/50 bg-card">
                  <Button
                    aria-label="Decrease"
                    className="h-9 w-10 sm:w-9 p-0 text-text-light dark:text-text-lightdark hover:bg-brand-muted/50 dark:hover:bg-brand-muteddark/40"
                    disabled={quantity <= 1}
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateCartItem(item.id, Math.max(1, quantity - 1), (item as any).variantKey)
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2.75rem] text-center text-sm font-medium text-text-light dark:text-text-lightdark">
                    {quantity}
                  </span>
                  <Button
                    aria-label="Increase"
                    className="h-9 w-10 sm:w-9 p-0 text-text-light dark:text-text-lightdark hover:bg-brand-muted/50 dark:hover:bg-brand-muteddark/40"
                    size="sm"
                    variant="ghost"
                    disabled={outOfStock || quantity >= available}
                    onClick={() => {
                      const next = Math.min(quantity + 1, available);
                      updateCartItem(item.id, next, (item as any).variantKey);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* desktop price */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-lg font-semibold text-text-light dark:text-text-lightdark">
                  {formatPrice(price)}
                </div>
                {hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-subtle dark:text-text-subtledark line-through">
                      {formatPrice(originalPrice!)}
                    </span>
                    <Badge
                      className="text-xs px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400"
                      variant="destructive"
                    >
                      -{discount}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* remove */}
              <div className="order-4 md:order-none flex justify-end">
                <div className="flex items-center gap-1">
                  <Button
                    aria-label="Remove"
                    className="text-text-subtle dark:text-text-subtledark hover:text-red-600 dark:hover:text-red-400"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.id, (item as any).variantKey)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
