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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-brand-muted/30 dark:border-brand-muteddark/30 bg-brand-surface dark:bg-brand-surfacedark overflow-hidden"
              >
                <div className="aspect-square md:aspect-[4/3] animate-pulse" />
                <div className="p-3 sm:p-4">
                  <div className="h-4 w-3/4 bg-brand-muted/30 dark:bg-brand-muteddark/30 rounded mb-2 animate-pulse" />
                  <div className="h-3 w-1/2 bg-brand-muted/20 dark:bg-brand-muteddark/20 rounded animate-pulse" />
                </div>
              </div>
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
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="h-7 w-7 sm:h-8 sm:w-8 text-brand-primary animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-lightdark">
              Liquidation Sale
            </h2>
            <Flame className="h-7 w-7 sm:h-8 sm:w-8 text-brand-primary animate-pulse" />
          </div>
          <p className="text-sm sm:text-base md:text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Final clearance! Massive discounts on remaining inventory. Once they&apos;re gone,
            they&apos;re gone forever.
          </p>
        </div>

        {/* Square cards on mobile, 4:3 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                className="group flex flex-col h-full relative bg-brand-surface dark:bg-brand-surfacedark rounded-2xl overflow-hidden border-2 border-brand-muted/40 dark:border-brand-muteddark/40 hover:border-brand-primary/40 hover:shadow-xl transition-all duration-300"
              >
                <NextLink className="block min-h-0 flex-1" href={`/product/${p.id}`}>
                  {/* Image area */}
                  <div className="relative overflow-hidden">
                    <div className="relative aspect-square md:aspect-[4/3]">
                      <Image
                        alt={p.name ?? "Product"}
                        src={p.images?.[0] ?? "/placeholder.png"}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Badges */}
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <div className="bg-brand-primary text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                          {discount}% OFF
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <div className="bg-brand-primarydark text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium">
                        Only {stock} left!
                      </div>
                    </div>

                    {/* Timer */}
                    {tl && (
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                        <div className="bg-black/70 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-1 text-[11px] sm:text-sm">
                            <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {tl} left
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 md:p-6">
                    <h3 className="font-semibold text-[13px] sm:text-sm md:text-lg mb-1.5 sm:mb-2 text-text-light dark:text-text-lightdark line-clamp-1">
                      {p.name ?? "Unnamed"}
                    </h3>

                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                      <span className="text-base sm:text-lg md:text-2xl font-extrabold text-brand-primary">
                        {priceNow} ₾
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] sm:text-sm md:text-lg text-text-subtle dark:text-text-subtledark line-through">
                          {price} ₾
                        </span>
                      )}
                    </div>

                    {/* Savings + progress */}
                    <div>
                      {hasDiscount && (
                        <div className="text-[11px] sm:text-xs text-text-subtle dark:text-text-subtledark mb-1">
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

                {/* CTA pinned to bottom */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 mt-auto">
                  <Button
                    className="w-full h-9 sm:h-10 md:h-11 bg-brand-primary hover:bg-brand-primary/90 text-white text-[11px] sm:text-xs md:text-sm"
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
