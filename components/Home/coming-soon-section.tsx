"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Bell, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/app/api/services/productService";

export function ComingSoonSection() {
  const [items, setItems] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const filtered = all.filter((p: any) => p.isComingSoon).slice(0, 6);
        setItems(filtered);
      } catch (e) {
        console.error(e);
        setError("ვერ ჩაიტვირთა Coming Soon პროდუქტები");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-brand-muted/30 dark:bg-brand-muteddark/30">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 rounded bg-brand-muted/40 dark:bg-brand-muteddark/40 mb-4 animate-pulse" />
          <div className="h-6 w-[28rem] max-w-full rounded bg-brand-muted/30 dark:bg-brand-muteddark/30 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-brand-surface dark:bg-brand-surfacedark overflow-hidden"
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
    <section className="py-16 px-4 bg-brand-muted/30 dark:bg-brand-muteddark/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-brand-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-lightdark">
              Coming Soon
            </h2>
          </div>
          <p className="text-sm sm:text-base md:text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Be the first to experience the future. Pre-order now and get exclusive early access.
          </p>
        </div>

        {/* Square on mobile, 4:3 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((p) => {
            const launchDate = (p as any).launchDate ?? "TBA";
            const preOrders = (p as any).preOrders ?? 0;
            const features: string[] = (p as any).features ?? [];

            return (
              <div
                key={p.id}
                className="group flex flex-col h-full relative bg-brand-surface dark:bg-brand-surfacedark rounded-2xl overflow-hidden border border-brand-muted/60 dark:border-brand-muteddark/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <div className="relative aspect-square md:aspect-[4/3]">
                    <Image
                      alt={p.name ?? "Product"}
                      src={p.images?.[0] ?? "/placeholder.png"}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>

                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <div className="flex items-center gap-1 bg-brand-primary text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium animate-pulse">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Coming Soon
                    </div>
                  </div>

                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 text-white">
                    <div className="text-[11px] sm:text-sm opacity-90">Launch Date</div>
                    <div className="text-sm sm:text-base font-semibold">{launchDate}</div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <h3 className="font-semibold text-[13px] sm:text-sm md:text-xl mb-1.5 sm:mb-2 text-text-light dark:text-text-lightdark line-clamp-1">
                    {p.name ?? "Unnamed"}
                  </h3>

                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="text-sm sm:text-base md:text-2xl font-extrabold text-brand-primary">
                      Expected {p.discountPrice ?? p.price} ₾
                    </span>
                  </div>

                  {!!features.length && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {features.slice(0, 4).map((f, i) => (
                        <span
                          key={i}
                          className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-sm"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] sm:text-xs text-text-subtle dark:text-text-subtledark mb-3 sm:mb-4">
                    {preOrders} pre-orders already placed
                  </div>

                  <Button className="w-full h-9 sm:h-10 md:h-11 bg-brand-primary hover:bg-brand-primary/90 text-white text-[11px] sm:text-xs md:text-sm mt-auto">
                    <Bell className="h-4 w-4 mr-2" />
                    Notify Me
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
