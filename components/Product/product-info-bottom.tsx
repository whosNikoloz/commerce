"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Sparkles, Tag } from "lucide-react";
import { Button } from "@heroui/button";

import { StockStatus, Condition } from "@/types/enums";
import { useCartUI } from "@/app/context/cart-ui";
import { useDictionary } from "@/app/context/dictionary-provider";

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
  stock,
  status,
  isComingSoon = false,
  isNewArrival = false,
  isLiquidated = false,
  currency = "₾",
  isVisible,
  onAddToCart,
  onBuyNow,
}: ProductInfoBottomProps) {
  const dict = useDictionary();
  const [isAnimating, setIsAnimating] = useState(false);
  const { footerCartRef } = useCartUI();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAnimating(isVisible);
  }, [isVisible]);

  // Set the footer cart ref for fly-to-cart animation
  useEffect(() => {
    if (containerRef.current && isVisible) {
      footerCartRef.current = containerRef.current;
    } else if (!isVisible && footerCartRef.current === containerRef.current) {
      // Clear the ref when this component is hidden
      footerCartRef.current = null;
    }
  }, [isVisible, footerCartRef]);

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
      ref={containerRef}
      className={[
        "fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 w-11/12 md:w-10/12 lg:w-8/12 max-w-4xl",
        "bg-brand-surface/95 dark:bg-brand-surfacedark/95 backdrop-blur-xl",
        "rounded-2xl border border-border/50",
        "shadow-xl shadow-black/10 dark:shadow-black/30",
        "px-3 md:px-4 py-2.5 md:py-3 transform transition-all duration-300 z-40 ease-in-out",
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 md:gap-3">
        {/* Left: image + name */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <Image
            alt={name}
            className="rounded-lg h-10 w-10 md:h-12 md:w-12 object-cover flex-shrink-0"
            height={48}
            src={image}
            width={48}
          />
          <div className="hidden md:flex flex-col min-w-0 gap-1">
            <span className="font-primary text-sm font-semibold truncate text-foreground">{name}</span>
            <div className="flex items-center gap-1 flex-wrap">
              {isNewArrival && (
                <span className="font-primary inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  {dict.common.new}
                </span>
              )}
              {isLiquidated && (
                <span className="font-primary inline-flex items-center gap-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                  <Tag className="h-3 w-3" />
                  {dict.common.liquidation}
                </span>
              )}
              {typeof stock === "number" && stock <= 3 && stock > 0 && (
                <span className="font-primary text-[10px] text-amber-600 dark:text-amber-400">
                  {dict.common.lastStock.replace("{count}", stock.toString())}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: price + actions */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-initial justify-end">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-primary text-base md:text-lg font-bold text-foreground whitespace-nowrap">
                {price.toFixed(2)} {currency}
              </span>
              {hasDiscount && (
                <span className="font-primary inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 text-[10px] font-semibold">
                  -{computedDiscount}%
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="font-primary text-[10px] md:text-xs text-muted-foreground line-through whitespace-nowrap">
                {originalPrice!.toFixed(2)} {currency}
              </span>
            )}
          </div>

          <Button
            data-badge
            aria-disabled={ctaDisabled}
            className="h-9 md:h-10 px-4 md:px-5 flex items-center gap-1.5
                       bg-brand-primary hover:bg-brand-primary/90
                       text-white rounded-lg font-medium text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       shadow-sm"
            disabled={ctaDisabled}
            onPress={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-primary hidden xs:inline">
              {isComingSoon ? dict.common.comingSoonShort : !inStock ? dict.common.soldOutShort : dict.common.inCart}
            </span>
          </Button>

          <Button
            aria-disabled={ctaDisabled}
            className="hidden lg:inline-flex h-10 px-4
                       bg-foreground/5 hover:bg-foreground/10
                       text-foreground rounded-lg font-medium text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       border border-border/50"
            disabled={ctaDisabled}
            onPress={onBuyNow}
          >
            {dict.cart.buy}
          </Button>
        </div>
      </div>
    </div>
  );
}
