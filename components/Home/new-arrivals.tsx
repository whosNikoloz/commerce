"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllProducts } from "@/app/api/services/productService";
import { ProductResponseModel } from "@/types/product";

export function NewArrivals() {
  const [items, setItems] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const filtered = all.filter((p) => p.isNewArrival).slice(0, 8);
        setItems(filtered);
      } catch (e) {
        console.error(e);
        setError("Failed to load new arrivals");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <section className="px-4">
        <div className="max-w-7xl mx-auto py-10 text-text-subtle dark:text-text-subtledark">
          Loading new arrivals…
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
    <section className="px-4 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light dark:text-text-lightdark mb-1 sm:mb-2">
              New Arrivals
            </h2>
            <p className="font-sans text-sm sm:text-base text-text-subtle dark:text-text-subtledark">
              Fresh styles just landed
            </p>
          </div>
          <Button
            asChild
            className="hidden md:flex border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white dark:border-brand-primarydark dark:text-brand-primarydark dark:hover:bg-brand-primarydark dark:hover:text-white transition-colors"
            variant="outline"
          >
            <NextLink href="/products?tab=new">View All New Items</NextLink>
          </Button>
        </div>

        {/* Square cards on mobile, roomy on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((p) => (
            <NextLink key={p.id} className="group block" href={`/product/${p.id}`}>
              <div className="flex flex-col h-full">
                {/* Image block */}
                <div className="relative overflow-hidden rounded-xl bg-brand-muted dark:bg-brand-muteddark">
                  <Badge className="absolute top-2 left-2 z-10 bg-brand-primary dark:bg-brand-primarydark text-white">
                    New
                  </Badge>

                  {/* Square on mobile, 4:3 on md+ */}
                  <div className="relative aspect-square md:aspect-[4/3]">
                    <Image
                      alt={p?.name ?? "Product"}
                      src={p?.images?.[0] ?? "/placeholder.png"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                </div>

                {/* Text block */}
                <div className="mt-2 sm:mt-3">
                  <h3 className="font-sans font-semibold text-[13px] sm:text-sm md:text-base text-text-light dark:text-text-lightdark mb-0.5 line-clamp-1">
                    {p.name ?? "Unnamed"}
                  </h3>
                  <p className="font-sans text-sm sm:text-base md:text-lg font-bold text-text-light dark:text-text-lightdark">
                    {p.discountPrice ?? p.price} ₾
                    {p.discountPrice && (
                      <span className="ml-2 text-[11px] sm:text-xs md:text-sm text-text-subtle dark:text-text-subtledark line-through">
                        {p.price} ₾
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </NextLink>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="text-center mt-6 md:hidden">
          <Button
            asChild
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white dark:border-brand-primarydark dark:text-brand-primarydark dark:hover:bg-brand-primarydark dark:hover:text-white transition-colors"
            variant="outline"
          >
            <NextLink href="/products?tab=new">View All New Items</NextLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
