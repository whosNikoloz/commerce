"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Zap, Timer, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/app/api/services/productService";
import { useCartStore, CartItem } from "@/app/context/cartContext";

function calcDiscountPercent(price: number, discountPrice?: number | null) {
  if (discountPrice == null || discountPrice <= 0 || discountPrice >= price) return 0;

  return Math.round((1 - discountPrice / price) * 100);
}

function timeLeftLabel(iso?: string | null) {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = end - now;

  if (diffMs <= 0) return "ending soon";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days} day${days > 1 ? "s" : ""}`;

  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}

export function LiquidationSection() {
  const [items, setItems] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);

  const add = (p: ProductResponseModel) => {
    const item: CartItem = {
      id: p.id,
      name: p.name ?? "Unnamed Product",
      price: p.discountPrice ?? p.price,
      image: p.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: p.discountPrice ? calcDiscountPercent(p.price, p.discountPrice) : 0,
      originalPrice: p.price,
    };

    addToCart(item);
  };

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const filtered = all.filter((p) => (p as any).isLiquidated).slice(0, 8);

        setItems(filtered);
      } catch (e) {
        console.error(e);
        setError("Failed to load liquided products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-brand-primary/5 to-brand-primarydark/5 dark:from-brand-primarydark/10 dark:to-brand-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-brand-muted/40 dark:bg-brand-muteddark/40 rounded mb-3 animate-pulse" />
          <div className="h-6 w-[34rem] max-w-full bg-brand-muted/30 dark:bg-brand-muteddark/30 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl border-2 border-brand-muted/30 dark:border-brand-muteddark/30 bg-brand-surface dark:bg-brand-surfacedark animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !items.length) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-brand-primary/5 to-brand-primarydark/5 dark:from-brand-primarydark/10 dark:to-brand-primary/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-8 w-8 text-brand-primary animate-pulse" />
            <h2 className="text-4xl font-bold text-text-light dark:text-text-lightdark">
              Liquidation Sale
            </h2>
            <Flame className="h-8 w-8 text-brand-primary animate-pulse" />
          </div>
          <p className="text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Final clearance! Massive discounts on remaining inventory. Once they&apos;re gone,
            they&apos;re gone forever.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => {
            const price = Number(p.price);
            const priceNow = Number(p.discountPrice ?? p.price);
            const hasDiscount = priceNow > 0 && priceNow < price;
            const discount = calcDiscountPercent(price, p.discountPrice);
            const stock = (p as any).stockQuantity ?? (p as any).quantity ?? (p as any).stock ?? 1;
            const endsAt = (p as any).liquidationEndsAt as string | undefined;
            const tl = timeLeftLabel(endsAt);

            return (
              <div
                key={p.id}
                className="group relative bg-brand-surface dark:bg-brand-surfacedark rounded-2xl overflow-hidden border-2 border-brand-muted/40 dark:border-brand-muteddark/40 hover:border-brand-primary/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Clickable area */}
                <NextLink className="block" href={`/product/${p.id}`}>
                  <div className="relative overflow-hidden">
                    <Image
                      alt={p.name ?? "Product"}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      height={300}
                      src={p.images?.[0] ?? "/placeholder.png"}
                      width={400}
                    />
                    {hasDiscount && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                          {discount}% OFF
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <div className="bg-brand-primarydark text-white px-2 py-1 rounded-lg text-xs font-medium">
                        Only {stock} left!
                      </div>
                    </div>
                    {tl && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <Timer className="h-4 w-4" />
                            {tl} left
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 text-text-light dark:text-text-lightdark">
                      {p.name ?? "Unnamed"}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-brand-primary">{priceNow} ₾</span>
                      {hasDiscount && (
                        <span className="text-lg text-text-subtle dark:text-text-subtledark line-through">
                          {price} ₾
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      {hasDiscount && (
                        <div className="text-xs text-text-subtle dark:text-text-subtledark mb-1">
                          Savings: {Math.max(price - priceNow, 0).toFixed(2)} ₾
                        </div>
                      )}
                      <div className="w-full rounded-full h-2 bg-brand-muted/30 dark:bg-brand-muteddark/30">
                        <div
                          className="bg-gradient-to-r from-brand-primary to-brand-primarydark h-2 rounded-full transition-all duration-300"
                          style={{ width: `${hasDiscount ? discount : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </NextLink>

                {/* Add to cart: OUTSIDE the link */}
                <div className="px-6 pb-6">
                  <Button
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      add(p);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Grab Now!
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
