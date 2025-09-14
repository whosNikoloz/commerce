"use client";

import type { ProductResponseModel } from "@/types/product";

import { ArrowDown, Star, Zap, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/app/api/services/productService";

// 1) Always-available local fallback shown instantly
const FALLBACK: Array<Pick<ProductResponseModel, "name"> & { price?: number; images?: string[] }> =
  [
    { name: "Premium Headphones", price: 299, images: ["/placeholder.png"] },
    { name: "Smart Watch", price: 599, images: ["/placeholder.png"] },
    { name: "Wireless Speaker", price: 199, images: ["/placeholder.png"] },
  ];

// helper: pick n random items
function pickRandom<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, n);
}

export function ModernHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);

  // 2) Start with fallback displayed; swap to real products when fetched
  const [items, setItems] = useState<ProductResponseModel[] | null>(null);

  const handleScroll = () => {
    window.scrollBy({ top: window.innerHeight - 50, behavior: "smooth" });
  };

  // fetch in background
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const picked = pickRandom(all, 3);

        if (picked?.length) setItems(picked);
      } catch (e) {
        console.error("Failed to fetch products", e);
        // keep showing FALLBACK silently
      }
    })();
  }, []);

  // rotate whichever list is active
  const activeList =
    items && items.length > 0
      ? items.map((p) => ({
          name: p.name ?? "Product",
          price: (p.discountPrice ?? p.price) as number | undefined,
          images: Array.isArray(p.images) && p.images.length ? p.images : ["/placeholder.png"],
        }))
      : FALLBACK;

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % activeList.length);
    }, 4000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); // restart when we switch from FALLBACK→real products

  const active = activeList[current];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* floating bg shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary/10 rounded-full animate-float" />
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-brand-primarydark/10 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-brand-muted/5 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-brand-primary/20 rounded-full animate-parallax" />
      </div>

      <div className="relative z-10 flex items-center min-h-screen">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* left */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-primary">
                <Star className="w-4 h-4 fill-current" />
                <span>Premium Collection 2024</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="block text-text-light dark:text-text-lightdark">Experience</span>
                <span className="block bg-gradient-to-r from-brand-primary via-brand-primarydark to-brand-muted bg-clip-text text-transparent animate-pulse">
                  Innovation
                </span>
              </h1>

              <p className="text-xl text-text-subtle dark:text-text-subtledark max-w-lg leading-relaxed">
                Discover cutting-edge products designed for the modern lifestyle. Premium quality
                meets innovative design.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="text-lg px-8 py-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full shadow-xl hover:shadow-2xl hover:shadow-brand-primary/25 transition-all duration-300 transform hover:scale-105"
                size="lg"
                onClick={handleScroll}
              >
                <Zap className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2 text-sm text-text-light dark:text-text-lightdark">
                <Shield className="w-4 h-4 text-brand-primary" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-light dark:text-text-lightdark">
                <Star className="w-4 h-4 text-brand-primary fill-current" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="text-sm text-text-light dark:text-text-lightdark">
                <span className="font-semibold text-brand-primary">50K+</span> Happy Customers
              </div>
            </div>
          </div>

          {/* right */}
          <div className="relative perspective-1000 mb-10 animate-scale-in">
            <div className="relative transform-3d">
              {/* Main product display */}
              <div className="relative w-full h-96 bg-gradient-to-br from-brand-surface to-brand-muted dark:from-brand-surfacedark dark:to-brand-muteddark rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  priority
                  alt={active.name ?? "Product Image"}
                  className="w-full h-full object-cover transition-all duration-1000 hover:scale-110"
                  height={400}
                  src={active.images?.[0] ?? "/placeholder.png"}
                  width={600}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Product info overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-brand-surface/90 dark:bg-brand-surfacedark/90 backdrop-blur-md rounded-2xl p-4">
                    <h3 className="font-bold text-lg text-text-light dark:text-text-lightdark">
                      {active.name}
                    </h3>
                    <p className="text-2xl font-bold text-brand-primary">
                      {typeof active.price === "number" ? `${active.price} ₾` : "—"}
                    </p>
                  </div>
                </div>

                {/* Floating label */}
                <div className="absolute top-4 right-4 bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  New
                </div>
              </div>

              {/* Product indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {activeList.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Show slide ${i + 1}`}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === current
                        ? "bg-brand-primary scale-125"
                        : "bg-brand-muted/70 dark:bg-brand-muteddark/60 hover:bg-brand-primary/50"
                    }`}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>

              {/* Floating 3D elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-primarydark rounded-2xl animate-rotate-3d opacity-80" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-brand-muted to-brand-primary rounded-xl animate-float opacity-60" />
            </div>
          </div>
        </div>
      </div>

      <button
        className="absolute bottom-8 left-1/2 z-50 md:flex hidden -translate-x-1/2  flex-col items-center text-text-subtle dark:text-text-subtledark animate-bounce focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-md"
        type="button"
        onClick={handleScroll}
      >
        <span className="text-sm mb-2 uppercase tracking-wider">Explore</span>
        <ArrowDown aria-hidden className="w-6 h-6" />
      </button>
      <div ref={scrollRef} />
    </section>
  );
}
