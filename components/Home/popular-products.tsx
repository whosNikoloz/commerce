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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="h-[360px] rounded-2xl border-2 border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !items.length) {
    return null;
  }

  return (
    <section className="py-16 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-text-light dark:text-text-lightdark mb-4">
            POPULAR NOW
          </h2>
          <p className="text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Most loved products by our customers
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => {
            const hasDiscount = p.discountPrice && Number(p.discountPrice) < Number(p.price);
            const priceNow = hasDiscount ? p.discountPrice : p.price;
            const image = p.images?.[0] ?? "/placeholder.png";
            const rating = (p as any).rating ?? (p as any).averageRating ?? 4.7; // თუ არ გაქვს რეიტინგი, fallback

            return (
              <div
                key={p.id}
                className="group bg-brand-surface dark:bg-brand-surfacedark border-2 border-brand-muted dark:border-brand-muteddark rounded-2xl overflow-hidden hover:border-brand-primary transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                {/* Clickable area → goes to product page */}
                <NextLink href={`/product/${p.id}`} className="block">
                  <div className="relative">
                    <Image
                      alt={p.name ?? "Product"}
                      className="w-full h-48 object-cover"
                      height={300}
                      src={image}
                      width={400}
                    />
                    {hasDiscount && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {Math.round((1 - Number(p.discountPrice) / Number(p.price)) * 100)}% OFF
                        </span>
                      </div>
                    )}
                    <button
                      aria-label="Add to wishlist"
                      className="absolute top-4 right-4 p-2 rounded-full bg-brand-surface/80 dark:bg-brand-surfacedark/80 backdrop-blur-sm hover:bg-brand-surface dark:hover:bg-brand-surfacedark transition-colors"
                      onClick={(e) => {
                        e.preventDefault(); // prevent triggering link
                        e.stopPropagation();
                      }}
                    >
                      <Heart className="w-4 h-4 text-text-light dark:text-text-lightdark" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-text-light dark:text-text-lightdark mb-2 line-clamp-1">
                        {p.name ?? "Unnamed"}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(rating)
                                  ? "fill-brand-primary text-brand-primary"
                                  : "text-text-subtle/40 dark:text-text-subtledark/40"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-text-subtle dark:text-text-subtledark">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-text-light dark:text-text-lightdark">
                        {priceNow} ₾
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-text-subtle dark:text-text-subtledark line-through">
                          {p.price} ₾
                        </span>
                      )}
                    </div>
                  </div>
                </NextLink>

                <div className="px-6 pb-6">
                  <Button
                    className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 font-bold uppercase tracking-wide rounded-xl"
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
