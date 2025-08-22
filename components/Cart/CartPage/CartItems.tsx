"use client";

import Image from "next/image";
import { Minus, Plus, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/app/context/cartContext";
import type { CartItem as CartItemType } from "@/app/context/cartContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ka-GE", { style: "currency", currency: "GEL" }).format(price);

const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
const percent = (o: number, c: number) => Math.max(0, Math.round(((o - c) / o) * 100));
const monthly = (price: number, months = 24) => Math.ceil(price / months);

export default function CartItems() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const items = cart as Array<CartItemType & { originalPrice?: number }>;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const price = toNumber(item.price);
        const originalPrice = item.originalPrice ? toNumber(item.originalPrice) : null;
        const hasDiscount = !!originalPrice && originalPrice > price;
        const discount = hasDiscount ? percent(originalPrice!, price) : 0;
        const quantity = toNumber(item.quantity);

        return (
          <Card key={`${item.id}-${(item as any).variantKey ?? ""}`} className="p-3 sm:p-4 md:p-5 dark:bg-brand-muteddark bg-brand-muted">
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px_160px_48px] md:items-center">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium leading-snug line-clamp-2 text-sm sm:text-base">
                    {item.name}
                  </h3>

                  {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.selectedFacets).map(([k, v]) => (
                        <Badge key={k} variant="secondary" className="h-5 text-[11px] px-1.5">
                          {k}: {v}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground">
                    თვეში:{" "}
                    <span className="text-foreground font-medium">{monthly(price)}₾</span>-დან
                  </div>

                  <div className="mt-2 md:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold">{formatPrice(price)}</span>
                      {hasDiscount && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(originalPrice!)}
                          </span>
                          <Badge variant="destructive" className="text-[11px] px-1.5 py-0.5">
                            -{discount}%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-3 md:order-none flex md:justify-center">
                <div className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center rounded-lg border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-10 sm:w-9 p-0"
                    onClick={() => updateCartItem(item.id, Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2.75rem] text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-10 sm:w-9 p-0"
                    onClick={() => updateCartItem(item.id, quantity + 1)}
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-lg font-semibold">{formatPrice(price)}</div>
                {hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(originalPrice!)}
                    </span>
                    <Badge variant="destructive" className="text-xs px-2 py-0.5">
                      -{discount}%
                    </Badge>
                  </div>
                )}
              </div>

              <div className="order-4 md:order-none flex justify-end">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
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
