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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl border border-brand-muted/60 dark:border-brand-muteddark/60 bg-brand-surface dark:bg-brand-surfacedark animate-pulse"
              />
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-green-500" />
            <h2 className="text-4xl font-bold text-text-light dark:text-text-lightdark">
              In Stock Now
            </h2>
          </div>
          <p className="text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Ready to ship immediately. Get your favorites delivered fast with our in-stock
            collection.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="group relative bg-brand-surface dark:bg-brand-surfacedark rounded-2xl overflow-hidden border border-brand-muted/60 dark:border-brand-muteddark/60 hover:shadow-xl transition-all duration-300"
              >
                {/* Clickable area */}
                <NextLink className="block" href={`/product/${p.id}`}>
                  <div className="relative overflow-hidden">
                    <Image
                      alt={p.name ?? "Product"}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      height={256}
                      src={p.images?.[0] ?? "/placeholder.png"}
                      width={384}
                    />
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        In Stock ({stockCount})
                      </div>
                    </div>
                    {hasDiscount && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        {Math.round((1 - priceNow / priceOrig) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 text-text-light dark:text-text-lightdark group-hover:text-brand-primary transition-colors">
                      {p.name ?? "Unnamed"}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-brand-primary">{priceNow} ₾</span>
                      {hasDiscount && (
                        <span className="text-lg text-text-subtle dark:text-text-subtledark line-through">
                          {priceOrig} ₾
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(Number(rating))
                              ? "text-yellow-400"
                              : "text-text-subtle/40 dark:text-text-subtledark/40"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-text-subtle dark:text-text-subtledark ml-1">
                        ({Number(rating).toFixed(1)})
                      </span>
                    </div>
                  </div>
                </NextLink>

                {/* Add to Cart: OUTSIDE the link */}
                <div className="px-6 pb-6">
                  <Button
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
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
