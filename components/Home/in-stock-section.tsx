"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ShoppingCart, Package, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { StockStatus } from "@/types/enums";
import { useCartStore, CartItem } from "@/app/context/cartContext";

type Props = {
  pageSize?: number;
  sortBy?: "featured" | "price-low" | "price-high" | "newest" | "rating" | "name";
};

export function InStockSection({ pageSize = 8, sortBy = "featured" }: Props) {
  const [items, setItems] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);

  const handleAddToCart = (product: ProductResponseModel) => {
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
        const res = await searchProductsByFilter({
          filter: { stockStatus: StockStatus.InStock },
          page: 1,
          pageSize,
          sortBy,
        });

        setItems(res.items ?? []);
      } catch (e) {
        console.error(e);
        setError("მარაგში არსებული პროდუქტების ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    })();
  }, [pageSize, sortBy]);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-52 rounded bg-brand-muted/40 dark:bg-brand-muteddark/40 mb-3 animate-pulse" />
          <div className="h-6 w-[36rem] max-w-full rounded bg-brand-muted/30 dark:bg-brand-muteddark/30 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-brand-muted/60 dark:border-brand-muteddark/60 bg-brand-surface dark:bg-brand-surfacedark overflow-hidden"
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
    <section className="py-16 px-4 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />
            <h2 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-lightdark">
              In Stock Now
            </h2>
          </div>
          <p className="text-sm sm:text-base md:text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Ready to ship immediately. Get your favorites delivered fast with our in-stock
            collection.
          </p>
        </div>

        {/* Square on mobile, 4:3 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((p) => {
            const hasDiscount =
              p.discountPrice != null &&
              Number(p.discountPrice) > 0 &&
              Number(p.discountPrice) < Number(p.price);
            const priceNow = hasDiscount ? Number(p.discountPrice) : Number(p.price);
            const priceOrig = Number(p.price);
            const stockCount =
              (p as any).stockQuantity ?? (p as any).quantity ?? (p as any).stock ?? 1;
            const rating = (p as any).rating ?? (p as any).averageRating ?? 4.7;

            return (
              <div
                key={p.id}
                className="group flex flex-col h-full relative bg-brand-surface dark:bg-brand-surfacedark rounded-2xl overflow-hidden border border-brand-muted/60 dark:border-brand-muteddark/60 hover:shadow-xl transition-all duration-300"
              >
                <NextLink className="block min-h-0 flex-1" href={`/product/${p.id}`}>
                  <div className="relative overflow-hidden">
                    <div className="relative aspect-square md:aspect-[4/3]">
                      <Image
                        fill
                        alt={p.name ?? "Product"}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        src={p.images?.[0] ?? "/placeholder.png"}
                      />
                    </div>

                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        In Stock ({stockCount})
                      </div>
                    </div>

                    {hasDiscount && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold">
                        {Math.round((1 - priceNow / priceOrig) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-6">
                    <h3 className="font-semibold text-[13px] sm:text-sm md:text-lg mb-1.5 sm:mb-2 text-text-light dark:text-text-lightdark group-hover:text-brand-primary transition-colors line-clamp-1">
                      {p.name ?? "Unnamed"}
                    </h3>

                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <span className="text-base sm:text-lg md:text-2xl font-extrabold text-brand-primary">
                        {priceNow} ₾
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] sm:text-sm md:text-lg text-text-subtle dark:text-text-subtledark line-through">
                          {priceOrig} ₾
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-[12px] sm:text-sm ${
                            i < Math.floor(Number(rating))
                              ? "text-yellow-400"
                              : "text-text-subtle/40 dark:text-text-subtledark/40"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-[11px] sm:text-xs text-text-subtle dark:text-text-subtledark ml-1">
                        ({Number(rating).toFixed(1)})
                      </span>
                    </div>
                  </div>
                </NextLink>

                <div className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 mt-auto">
                  <Button
                    className="w-full h-9 sm:h-10 md:h-11 bg-brand-primary hover:bg-brand-primary/90 text-white text-[11px] sm:text-xs md:text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
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
