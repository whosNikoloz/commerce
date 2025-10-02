"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Star, Heart, ShoppingCart } from "lucide-react";

import { getAllProducts } from "@/app/api/services/productService";
import { useCartStore, CartItem } from "@/app/context/cartContext";

type PopularProductsProps = {
  count?: number;
  onlyDiscounted?: boolean;
};

function sampleArray<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, n);
}

export function PopularProducts({ count = 4, onlyDiscounted = false }: PopularProductsProps) {
  const [items, setItems] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddToCart = (productId: string) => {
    const product = items.find((p) => p.id === productId);

    if (!product) return;

    const item: CartItem = {
      id: product.id,
      name: product.name ?? "Unnamed Product",
      price: product.discountPrice ?? product.price,
      image: product.images?.[0] ?? "/placeholder.png",
      quantity: 1,
      discount: product.discountPrice
        ? Math.max(0, Math.round(((product.price - product.discountPrice) / product.price) * 100))
        : 0,
      originalPrice: product.price,
    };

    addToCart(item);
  };

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const pool = onlyDiscounted
          ? all.filter((p) => Boolean(p.discountPrice) && Number(p.discountPrice) < Number(p.price))
          : all;

        setItems(sampleArray(pool, count));
      } catch (e) {
        console.error(e);
        setError("ვერ ჩაიტვირთა პროდუქტები");
      } finally {
        setLoading(false);
      }
    })();
  }, [count, onlyDiscounted]);

  if (loading) {
    return (
      <section className="py-16 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-text-light dark:text-text-lightdark mb-4">
              POPULAR NOW
            </h2>
            <p className="text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
              იტვირთება…
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="h-[200px] sm:h-[280px] rounded-2xl border-2 border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !items.length) return null;

  return (
    <section className="py-16 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-wider text-text-light dark:text-text-lightdark mb-2 sm:mb-4">
            POPULAR NOW
          </h2>
          <p className="text-sm sm:text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Most loved products by our customers
          </p>
        </div>

        {/* SQUARE CARDS ON MOBILE */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((p) => {
            const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);
            const priceNow = hasDiscount ? p.discountPrice : p.price;
            const image = p.images?.[0] ?? "/placeholder.png";
            const rating = (p as any).rating ?? (p as any).averageRating ?? 4.7;

            return (
              <div
                key={p.id}
                className="group flex flex-col h-full bg-brand-surface dark:bg-brand-surfacedark border-2 border-brand-muted dark:border-brand-muteddark rounded-2xl overflow-hidden hover:border-brand-primary transition-all duration-300 hover:shadow-2xl"
              >
                <NextLink className="block min-h-0 flex-1" href={`/product/${p.id}`}>
                  {/* Image becomes perfect square on mobile; taller on md+ */}
                  <div className="relative aspect-square md:aspect-[4/3]">
                    <Image
                      fill
                      alt={p.name ?? "Product"}
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      src={image}
                    />
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <span className="bg-brand-primary text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase">
                          {Math.round((1 - Number(p.discountPrice) / Number(p.price)) * 100)}% OFF
                        </span>
                      </div>
                    )}
                    <button
                      aria-label="Add to wishlist"
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-brand-surface/80 dark:bg-brand-surfacedark/80 backdrop-blur-sm hover:bg-brand-surface dark:hover:bg-brand-surfacedark transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-4 h-4 text-text-light dark:text-text-lightdark" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                    <div>
                      <h3 className="font-bold text-[13px] sm:text-sm md:text-lg text-text-light dark:text-text-lightdark mb-1 sm:mb-2 line-clamp-1">
                        {p.name ?? "Unnamed"}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 md:w-4 md:h-4 ${
                                i < Math.floor(rating)
                                  ? "fill-brand-primary text-brand-primary"
                                  : "text-text-subtle/40 dark:text-text-subtledark/40"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] sm:text-xs md:text-sm text-text-subtle dark:text-text-subtledark">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-base md:text-2xl font-extrabold text-text-light dark:text-text-lightdark">
                        {priceNow} ₾
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] sm:text-xs md:text-lg text-text-subtle dark:text-text-subtledark line-through">
                          {p.price} ₾
                        </span>
                      )}
                    </div>
                  </div>
                </NextLink>

                {/* Button pinned to bottom via flex column */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 mt-auto">
                  <Button
                    className="w-full h-9 sm:h-10 md:h-11 bg-brand-primary text-white hover:bg-brand-primary/90 font-bold uppercase tracking-wide rounded-xl text-[11px] sm:text-xs md:text-sm"
                    onPress={() => handleAddToCart(p.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    ADD TO CART
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
