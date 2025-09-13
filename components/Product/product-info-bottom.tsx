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
        "bg-brand-muted dark:bg-brand-muteddark",
        "text-text-light dark:text-text-lightdark",
        "shadow-lg px-4 py-3 transform transition-all duration-300 z-50 ease-in-out",
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
            <span className="text-sm md:text-lg font-semibold truncate">{name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {freeShipping && (
                <Badge className="bg-brand-surface/80 dark:bg-brand-surfacedark/80 text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark">
                  <Truck className="h-3 w-3 mr-1" />
                  უფასო მიწოდება
                </Badge>
              )}
              {isComingSoon && (
                <Badge className="bg-brand-primary/20 text-text-light dark:text-text-lightdark border border-brand-primary/40">
                  <Clock3 className="h-3 w-3 mr-1" />
                  მალე
                </Badge>
              )}
              {isNewArrival && (
                <Badge className="bg-brand-primary text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  ახალი
                </Badge>
              )}
              {isLiquidated && (
                <Badge className="bg-brand-primarydark text-white">
                  <Tag className="h-3 w-3 mr-1" />
                  ლიკვიდაცია
                </Badge>
              )}
              {typeof stock === "number" && stock <= 3 && stock > 0 && (
                <Badge className="bg-brand-primarydark/80 text-white">ბოლო {stock} ც</Badge>
              )}
              {brand && (
                <Badge className="bg-brand-surface/80 dark:bg-brand-surfacedark/80 text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark">
                  {brand}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right: price + actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-baseline gap-1 md:gap-2">
            <span className="text-base md:text-2xl font-bold">
              {price.toFixed(2)} {currency}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs md:text-base text-text-subtle dark:text-text-subtledark line-through">
                  {originalPrice!.toFixed(2)} {currency}
                </span>
                <Badge className="ml-1 text-xs bg-brand-primarydark text-white">
                  -{computedDiscount}%
                </Badge>
              </>
            )}
          </div>

          <Button
            aria-disabled={ctaDisabled}
            className="h-10 px-3 md:px-4 ml-2 md:ml-4 flex items-center gap-1 md:gap-2
                       bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-60"
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
                       bg-brand-primarydark hover:bg-brand-primarydark/90 text-white disabled:opacity-60"
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
