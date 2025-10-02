"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ChevronLeft, ChevronRight, Package, Clock, AlertTriangle, Heart } from "lucide-react";

import { Button } from "../ui/button";

import { getAllProducts } from "@/app/api/services/productService";
import { useCartStore, CartItem } from "@/app/context/cartContext";

type CarouselItem = {
  id: number | string;
  name: string;
  price: string; // "199 ₾"
  originalPrice?: string; // "249 ₾"
  priceNum: number; // added for cart
  origNum: number; // added for cart
  image: string;
  rating: number;
  reviews: number;
  stockStatus: "in-stock" | "limited" | "coming-soon" | "out-of-stock";
  stockCount: number;
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

function toCarouselItem(p: ProductResponseModel): CarouselItem {
  const priceNum = Number(p.discountPrice ?? p.price);
  const origNum = Number(p.price);
  const hasDiscount = p.discountPrice && priceNum < origNum;

  const qty = (p as any).quantity ?? (p as any).stock ?? 10;
  let stockStatus: CarouselItem["stockStatus"] =
    qty <= 0 ? "out-of-stock" : qty <= 3 ? "limited" : "in-stock";
  let stockCount = Math.max(0, Number(qty) || 0);

  if ((p as any).isComingSoon) {
    stockStatus = "coming-soon";
    stockCount = 0;
  }

  const rating = (p as any).rating ?? (p as any).averageRating ?? 4 + Math.random() * 1;
  const reviews = (p as any).reviews ?? Math.floor(50 + Math.random() * 500);

  return {
    id: p.id,
    name: p.name ?? "Unnamed",
    price: `${priceNum} ₾`,
    originalPrice: hasDiscount ? `${origNum} ₾` : undefined,
    priceNum,
    origNum,
    image: p.images?.[0] ?? "/placeholder.png",
    rating: Number(Number(rating).toFixed(1)),
    reviews,
    stockStatus,
    stockCount,
  };
}

const getStockDisplay = (status: string, count: number) => {
  switch (status) {
    case "in-stock":
      return {
        icon: Package,
        text: `${count} in stock`,
        className: "text-brand-primary bg-brand-primary/10 border-brand-primary/20",
        buttonText: "Add to Cart",
        buttonDisabled: false,
      };
    case "limited":
      return {
        icon: AlertTriangle,
        text: `Only ${count} left!`,
        className:
          "text-brand-primarydark bg-brand-primarydark/10 border-brand-primarydark/20 animate-pulse",
        buttonText: "Add to Cart",
        buttonDisabled: false,
      };
    case "coming-soon":
      return {
        icon: Clock,
        text: "Coming Soon",
        className:
          "text-text-subtle dark:text-text-subtledark bg-brand-muted/20 dark:bg-brand-muteddark/20 border-brand-muted/40 dark:border-brand-muteddark/40",
        buttonText: "Notify Me",
        buttonDisabled: true,
      };
    case "out-of-stock":
      return {
        icon: Package,
        text: "Out of Stock",
        className:
          "text-text-subtle dark:text-text-subtledark bg-brand-muted/20 dark:bg-brand-muteddark/20 border-brand-muted dark:border-brand-muteddark",
        buttonText: "Unavailable",
        buttonDisabled: true,
      };
    default:
      return {
        icon: Package,
        text: "In Stock",
        className: "text-brand-primary bg-brand-primary/10 border-brand-primary/20",
        buttonText: "Add to Cart",
        buttonDisabled: false,
      };
  }
};

type Props = {
  count?: number;
  onlyDiscounted?: boolean;
};

export function ProductCarousel({ count = 4, onlyDiscounted = false }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<Array<number | string>>([]);
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCartStore((s) => s.addToCart);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % items.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + items.length) % items.length);
  const toggleFavorite = (id: number | string) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleAddToCart = (c: CarouselItem) => {
    const item: CartItem = {
      id: c.id as string,
      name: c.name,
      price: c.priceNum,
      originalPrice: c.origNum,
      discount:
        c.origNum > c.priceNum
          ? Math.max(0, Math.round(((c.origNum - c.priceNum) / c.origNum) * 100))
          : 0,
      image: c.image,
      quantity: 1,
    };

    addToCart(item);
  };

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const filtered = onlyDiscounted
          ? all.filter(
              (p) => Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.price),
            )
          : all;

        const picked = sampleArray(filtered, count).map(toCarouselItem);

        setItems(picked);
        setCurrentSlide(0);
      } catch (e) {
        console.error(e);
        setError("პროდუქტების ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    })();
  }, [count, onlyDiscounted]);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="h-8 w-44 rounded-lg bg-brand-muted/40 dark:bg-brand-muteddark/40 mb-3 animate-pulse" />
          <div className="h-6 w-80 max-w-full rounded bg-brand-muted/30 dark:bg-brand-muteddark/30 animate-pulse" />
          <div className="mt-8 sm:mt-10 rounded-3xl border-2 border-brand-muted dark:border-brand-muteddark overflow-hidden">
            <div className="aspect-square md:h-[420px] animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !items.length) return null;

  return (
    <section className="py-16 sm:py-20 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-light dark:text-text-lightdark mb-2 sm:mb-4">
              Hot Deals
            </h2>
            <p className="text-sm sm:text-base md:text-xl text-text-subtle dark:text-text-subtledark">
              Limited time offers you can&apos;t miss
            </p>
          </div>

          {/* Arrows – compact on mobile, standard on md+ */}
          <div className="flex gap-2">
            <Button
              className="rounded-full bg-transparent border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
              size="icon"
              variant="outline"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              className="rounded-full bg-transparent border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark"
              size="icon"
              variant="outline"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {items.map((product) => {
              const stockDisplay = getStockDisplay(product.stockStatus, product.stockCount);
              const StockIcon = stockDisplay.icon;

              return (
                <div key={product.id} className="w-full flex-shrink-0 px-1.5 sm:px-3">
                  {/* STACK on mobile, 2-cols on md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
                    {/* Visual side (clickable) */}
                    <NextLink className="relative group block" href={`/product/${product.id}`}>
                      {/* Square on mobile; taller on md+ */}
                      <div className="relative overflow-hidden rounded-3xl">
                        <div className="relative aspect-square md:aspect-[4/3] md:h-96">
                          <Image
                            fill
                            alt={product.name}
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                            src={product.image || "/placeholder.png"}
                          />
                        </div>

                        {/* Favorite toggle */}
                        <Button
                          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-brand-surface/10 dark:bg-brand-surfacedark/20 backdrop-blur-md hover:bg-brand-surface/20 dark:hover:bg-brand-surfacedark/30 rounded-full"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.includes(product.id)
                                ? "fill-brand-primary text-brand-primary"
                                : "text-white"
                            }`}
                          />
                        </Button>
                      </div>
                    </NextLink>

                    {/* Text side */}
                    <div className="space-y-4 sm:space-y-6">
                      <NextLink className="block" href={`/product/${product.id}`}>
                        <h3 className="text-xl sm:text-3xl font-bold text-text-light dark:text-text-lightdark mb-1 sm:mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                      </NextLink>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm sm:text-base ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400"
                                  : "text-text-subtle/40 dark:text-text-subtledark/40"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-text-subtle dark:text-text-subtledark">
                          {product.rating.toFixed(1)} ({product.reviews})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-2xl font-extrabold text-brand-primary">
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs sm:text-lg text-text-subtle dark:text-text-subtledark line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Stock pill */}
                      <div
                        className={`inline-flex items-center gap-2 border px-2.5 py-1.5 rounded-full text-xs sm:text-sm ${stockDisplay.className}`}
                      >
                        <StockIcon className="w-4 h-4" />
                        {stockDisplay.text}
                      </div>

                      {/* CTA */}
                      <div className="pt-1">
                        <Button
                          className={`w-full md:w-auto h-9 sm:h-10 md:h-11 px-6 sm:px-10 rounded-full text-[12px] sm:text-sm ${
                            stockDisplay.buttonDisabled
                              ? "bg-brand-muted dark:bg-brand-muteddark text-text-subtle dark:text-text-subtledark cursor-not-allowed"
                              : "bg-brand-primary text-white hover:bg-brand-primary/90"
                          }`}
                          disabled={stockDisplay.buttonDisabled}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!stockDisplay.buttonDisabled) handleAddToCart(product);
                          }}
                        >
                          {stockDisplay.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile-friendly arrows overlay (optional) */}
          <div className="md:hidden absolute top-2 right-2 flex gap-2">
            <Button
              className="rounded-full bg-black/30 text-white"
              size="icon"
              variant="ghost"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              className="rounded-full bg-black/30 text-white"
              size="icon"
              variant="ghost"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center mt-6 sm:mt-8 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-brand-primary"
                  : "bg-brand-muted/60 dark:bg-brand-muteddark/60"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
