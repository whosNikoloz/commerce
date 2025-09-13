"use client";

import type { ProductResponseModel } from "@/types/product";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ChevronLeft, ChevronRight, Package, Clock, AlertTriangle } from "lucide-react";

import { Button } from "../ui/button";

import { getAllProducts } from "@/app/api/services/productService";

type CarouselItem = {
  id: number | string;
  name: string;
  price: string; // "199 ₾"
  originalPrice?: string; // "249 ₾"
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

// პროდუქტების გარდაქმნა სლაიდის მოდელად
function toCarouselItem(p: ProductResponseModel): CarouselItem {
  const priceNum = Number(p.discountPrice ?? p.price);
  const origNum = Number(p.price);
  const hasDiscount = p.discountPrice && priceNum < origNum;

  // მაგალითური მარაგის განსაზღვრა (დაარეგულირე შენი ველებით თუ გაქვს quantity/stock)
  const qty = (p as any).quantity ?? (p as any).stock ?? 10;
  let stockStatus: CarouselItem["stockStatus"] =
    qty <= 0 ? "out-of-stock" : qty <= 3 ? "limited" : "in-stock";
  let stockCount = Math.max(0, Number(qty) || 0);

  // თუ გინდა ზოგიერთის „coming-soon“ დაყენება (არასავალდებულო):
  if ((p as any).isComingSoon) {
    stockStatus = "coming-soon";
    stockCount = 0;
  }

  const rating = (p as any).rating ?? (p as any).averageRating ?? 4 + Math.random() * 1; // 4.0–5.0 შორის fallback
  const reviews = (p as any).reviews ?? Math.floor(50 + Math.random() * 500);

  return {
    id: p.id,
    name: p.name ?? "Unnamed",
    price: `${priceNum} ₾`,
    originalPrice: hasDiscount ? `${origNum} ₾` : undefined,
    image: p.images?.[0] ?? "/placeholder.png",
    rating: Number(rating.toFixed(1)),
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
  count?: number; // რამდენი ელემენტი მოიტოს (ხილული = 1 სლაიდი, მაგრამ პულიდან აირჩევს n)
  onlyDiscounted?: boolean; // მხოლოდ ფასდაკლებულები
};

export function ProductCarousel({ count = 4, onlyDiscounted = false }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<Array<number | string>>([]);
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % items.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + items.length) % items.length);
  const toggleFavorite = (id: number | string) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

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
      <section className="py-20 bg-brand-surface dark:bg-brand-surfacedark">
        <div className="container mx-auto px-6">
          <div className="h-10 w-44 rounded-lg bg-brand-muted/40 dark:bg-brand-muteddark/40 mb-4 animate-pulse" />
          <div className="h-6 w-80 rounded bg-brand-muted/30 dark:bg-brand-muteddark/30 animate-pulse" />
          <div className="mt-10 h-[420px] rounded-3xl border-2 border-brand-muted dark:border-brand-muteddark animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !items.length) return null;

  return (
    <section className="py-20 bg-brand-surface dark:bg-brand-surfacedark">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-lightdark mb-4">
              Hot Deals
            </h2>
            <p className="text-xl text-text-subtle dark:text-text-subtledark">
              Limited time offers you can&apos;t miss
            </p>
          </div>

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
                <div key={product.id} className="w-full flex-shrink-0 px-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Clickable visual side */}
                    <NextLink className="relative group block" href={`/product/${product.id}`}>
                      <Image
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-3xl"
                        height={480}
                        src={product.image || "/placeholder.png"}
                        width={400}
                      />
                      {/* favorite toggle stays but doesn't navigate */}
                      <Button
                        className="absolute top-4 right-4 bg-brand-surface/10 dark:bg-brand-surfacedark/20 backdrop-blur-md hover:bg-brand-surface/20 dark:hover:bg-brand-surfacedark/30"
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                      >
                        {/* your heart svg */}
                        ...
                      </Button>
                    </NextLink>

                    {/* Text side (title also clickable) */}
                    <div className="space-y-6">
                      <NextLink className="block" href={`/product/${product.id}`}>
                        <h3 className="text-3xl font-bold text-text-light dark:text-text-lightdark mb-2">
                          {product.name}
                        </h3>
                      </NextLink>

                      {/* rating, price, stock pill ... (unchanged) */}

                      {/* CTA — NOT a link; add to cart only */}
                      <Button
                        className={`w-full md:w-auto px-12 py-3 rounded-full ${
                          stockDisplay.buttonDisabled
                            ? "bg-brand-muted dark:bg-brand-muteddark text-text-subtle dark:text-text-subtledark cursor-not-allowed"
                            : "bg-brand-primary text-white hover:bg-brand-primary/90"
                        }`}
                        disabled={stockDisplay.buttonDisabled}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!stockDisplay.buttonDisabled) {
                            // You’ll need access to the real product object here to build a CartItem,
                            // or refactor your toCarouselItem() to carry enough pricing data.
                            // Example: call a passed-in addToCart(productId) or store handler.
                          }
                        }}
                      >
                        {stockDisplay.buttonText}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
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
