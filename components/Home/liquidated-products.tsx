"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllProducts } from "@/app/api/services/productService";
import { ProductResponseModel } from "@/types/product";

export function Liquidated() {
  const [items, setItems] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const filtered = all.filter((p) => p.isLiquidated).slice(0, 8);

        setItems(filtered);
      } catch (e) {
        console.error(e);
        setError("Failed to load liquided products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <section className="px-4">
        <div className="max-w-7xl mx-auto py-10 text-text-subtle dark:text-text-subtledark">
          Loading liquidated products…
        </div>
      </section>
    );

  if (error)
    return (
      <section className="px-4">
        <div className="max-w-7xl mx-auto py-10 text-red-500">{error}</div>
      </section>
    );

  if (!items.length) return null;

  return (
    <section className="px-4 bg-surface dark:bg-surfacedark">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-text-light dark:text-text-lightdark mb-2">
              Liquidated Products
            </h2>
            <p className="font-sans text-text-subtle dark:text-text-subtledark">
              Deep discounts on final items
            </p>
          </div>
          <Button
            asChild
            className="hidden md:flex border-primary dark:border-primarydark text-primary dark:text-primarydark hover:bg-primary hover:text-white dark:hover:bg-primarydark dark:hover:text-white transition-colors"
            variant="outline"
          >
            <NextLink href="/products?tab=new">View All Liquided Items</NextLink>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <NextLink key={p.id} className="group cursor-pointer block" href={`/product/${p.id}`}>
              <div className="relative overflow-hidden rounded-lg bg-muted dark:bg-muteddark mb-4">
                <Badge className="absolute top-3 left-3 z-10 bg-primary dark:bg-brand-primarydark text-white">
                  Liquided
                </Badge>
                <Image
                  alt={p?.name ?? "Product"}
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  height={800}
                  src={p?.images?.[0] ?? "/placeholder.svg"}
                  width={800}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <h3 className="font-sans font-medium text-text-light dark:text-text-lightdark mb-1">
                {p.name ?? "Unnamed"}
              </h3>
              <p className="font-sans text-lg font-semibold text-text-light dark:text-text-lightdark">
                {p.discountPrice ?? p.price} ₾
                {p.discountPrice && (
                  <span className="ml-2 text-sm text-text-subtle dark:text-text-subtledark line-through">
                    {p.price}₾
                  </span>
                )}
              </p>
            </NextLink>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button
            asChild
            className="border-primary dark:border-primarydark text-primary dark:text-primarydark hover:bg-primary hover:text-white dark:hover:bg-primarydark dark:hover:text-white transition-colors"
            variant="outline"
          >
            <NextLink href="/products?tab=new">View All New Items</NextLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
