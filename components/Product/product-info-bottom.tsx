"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingCart, Sparkles, Clock3, Tag, Truck } from "lucide-react";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";

import { StockStatus, Condition } from "@/types/enums";

type Currency = "₾" | "$" | "€";

interface ProductInfoBottomProps {
  name: string;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  image?: string;
  brand?: string;
  condition?: Condition;

  stock?: number;
  status?: StockStatus;
  isComingSoon?: boolean;
  isNewArrival?: boolean;
  isLiquidated?: boolean;

  freeShipping?: boolean;
  currency?: Currency;

  isVisible: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
}

export function ProductInfoBottom({
  name,
  price,
  originalPrice = null,
  discount,
  image = "/placeholder.png",
  brand,
  stock,
  status,
  isComingSoon = false,
  isNewArrival = false,
  isLiquidated = false,
  freeShipping = true,
  currency = "₾",
  isVisible,
  onAddToCart,
  onBuyNow,
}: ProductInfoBottomProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(isVisible);
  }, [isVisible]);

  if (!isVisible) return null;

  const computedDiscount =
    discount ??
    (originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  const hasDiscount = !!originalPrice && originalPrice > price && computedDiscount > 0;
  const inStock = status === StockStatus.InStock && !isComingSoon;
  const ctaDisabled = !inStock;

  return (
    <div
      className={[
        "fixed bottom-14 md:bottom-0 left-0 right-0",
        "bg-gradient-to-r from-card to-card/95 backdrop-blur-lg border-t-2 border-border/50",
        "shadow-2xl shadow-black/20 dark:shadow-black/40",
        "px-4 py-3 transform transition-all duration-300 z-50 ease-in-out",
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      ].join(" ")}
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        {/* Left: image + name + meta */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Image
            alt={name}
            className="rounded-lg h-12 w-12 md:h-16 md:w-16 object-cover flex-shrink-0"
            height={64}
            src={image}
            width={64}
          />
          <div className="hidden md:flex md:flex-col min-w-0">
            <span className="text-sm md:text-lg font-semibold truncate text-foreground">{name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {freeShipping && (
                <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 shadow-sm">
                  <Truck className="h-3 w-3 mr-1" />
                  უფასო მიწოდება
                </Badge>
              )}
              {isComingSoon && (
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-md">
                  <Clock3 className="h-3 w-3 mr-1" />
                  მალე
                </Badge>
              )}
              {isNewArrival && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
                  <Sparkles className="h-3 w-3 mr-1" />
                  ახალი
                </Badge>
              )}
              {isLiquidated && (
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md font-bold">
                  <Tag className="h-3 w-3 mr-1" />
                  ლიკვიდაცია
                </Badge>
              )}
              {typeof stock === "number" && stock <= 3 && stock > 0 && (
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md animate-pulse">ბოლო {stock} ც</Badge>
              )}
              {brand && (
                <Badge className="bg-muted/50 text-foreground border border-border/50 shadow-sm">
                  {brand}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right: price + actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-baseline gap-1 md:gap-2">
            <span className="text-base md:text-2xl font-bold text-foreground">
              {price.toFixed(2)} {currency}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs md:text-base text-muted-foreground line-through">
                  {originalPrice!.toFixed(2)} {currency}
                </span>
                <Badge className="ml-1 text-xs bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-md font-bold">
                  -{computedDiscount}%
                </Badge>
              </>
            )}
          </div>

          <Button
            aria-disabled={ctaDisabled}
            className="h-10 px-3 md:px-4 ml-2 md:ml-4 flex items-center gap-1 md:gap-2
                       bg-gradient-to-r from-brand-primary to-brand-primary/90
                       hover:from-brand-primary/90 hover:to-brand-primary/80
                       text-white rounded-xl font-semibold shadow-lg shadow-brand-primary/30
                       hover:shadow-xl hover:shadow-brand-primary/40
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 hover:scale-105 active:scale-95"
            disabled={ctaDisabled}
            onPress={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden xs:inline">
              {isComingSoon ? "მალე" : !inStock ? "ამოიწურა" : "ყიდვა"}
            </span>
          </Button>

          <Button
            aria-disabled={ctaDisabled}
            className="hidden md:inline-flex h-10 px-4
                       bg-gradient-to-r from-indigo-600 to-purple-600
                       hover:from-indigo-500 hover:to-purple-500
                       text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30
                       hover:shadow-xl hover:shadow-purple-500/40
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 hover:scale-105 active:scale-95"
            disabled={ctaDisabled}
            onPress={onBuyNow}
          >
            პირდაპირ ყიდვა
          </Button>
        </div>
      </div>
    </div>
  );
}
