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
        // ვფილტრავთ მხოლოდ მათ, ვისაც აქვს coming soon
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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl border bg-brand-surface dark:bg-brand-surfacedark animate-pulse"
              />
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-8 w-8 text-brand-primary" />
            <h2 className="text-4xl font-bold text-text-light dark:text-text-lightdark">
              Coming Soon
            </h2>
          </div>
          <p className="text-xl text-text-subtle dark:text-text-subtledark max-w-2xl mx-auto">
            Be the first to experience the future. Pre-order now and get exclusive early access.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => {
            const launchDate = (p as any).launchDate ?? "TBA";
            const preOrders = (p as any).preOrders ?? 0;
            const features: string[] = (p as any).features ?? [];

            return (
              <div
                key={p.id}
                className="group relative bg-brand-surface dark:bg-brand-surfacedark rounded-2xl overflow-hidden border border-brand-muted/60 dark:border-brand-muteddark/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <Image
                    alt={p.name ?? "Product"}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    height={300}
                    src={p.images?.[0] ?? "/placeholder.png"}
                    width={400}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      <Calendar className="h-4 w-4" />
                      Coming Soon
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-sm opacity-90">Launch Date</div>
                    <div className="font-semibold">{launchDate}</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2 text-text-light dark:text-text-lightdark">
                    {p.name ?? "Unnamed"}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-brand-primary">
                      Expected {p.discountPrice ?? p.price} ₾
                    </span>
                  </div>

                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {features.map((f, i) => (
                        <span
                          key={i}
                          className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-sm"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-text-subtle dark:text-text-subtledark mb-4">
                    {preOrders} pre-orders already placed
                  </div>

                  <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white">
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
