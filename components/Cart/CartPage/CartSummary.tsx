"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/app/context/cartContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const PROMO_CODES = {
  SAVE10: { discount: 0.1, label: "10% OFF" },
  WELCOME15: { discount: 0.15, label: "15% OFF" },
  FREESHIP: { discount: 0, label: "Free Shipping", freeShipping: true },
} as const;

export default function CartSummary() {
  const itemCount = useCartStore((s) => s.cart.length);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<keyof typeof PROMO_CODES | null>(null);
  const [shippingOption, setShippingOption] = useState<"standard" | "express" | "overnight">(
    "standard",
  );

  const promoDiscount = appliedPromo ? subtotal * PROMO_CODES[appliedPromo].discount : 0;

  const getShippingCost = () => {
    if (appliedPromo === "FREESHIP" || subtotal > 50) return 0;
    switch (shippingOption) {
      case "express":
        return 19.99;
      case "overnight":
        return 39.99;
      default:
        return 9.99;
    }
  };

  const shipping = getShippingCost();
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + shipping + tax;

  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase() as keyof typeof PROMO_CODES;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoCode("");
    }
  };

  const removePromoCode = () => setAppliedPromo(null);

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-text-light dark:text-text-lightdark">
            Order Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-subtle dark:text-text-subtledark">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
              <span className="font-medium text-text-light dark:text-text-lightdark">
                {formatPrice(subtotal)}
              </span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-sm text-brand-primary dark:text-brand-primary">
                <span>Discount ({appliedPromo})</span>
                <span>-{formatPrice(promoDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-text-subtle dark:text-text-subtledark">Shipping</span>
              <span className="font-medium text-text-light dark:text-text-lightdark">
                {shipping === 0 ? (
                  <span className="text-green-600 dark:text-green-400">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-text-subtle dark:text-text-subtledark">Tax</span>
              <span className="font-medium text-text-light dark:text-text-lightdark">
                {formatPrice(tax)}
              </span>
            </div>

            <Separator className="bg-brand-muted/60 dark:bg-brand-muteddark/50" />

            <div className="flex justify-between font-semibold text-lg">
              <span className="text-text-light dark:text-text-lightdark">Total</span>
              <span className="text-text-light dark:text-text-lightdark">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Free Shipping Progress */}
          {shipping > 0 && subtotal > 0 && subtotal < 50 && (
            <div className="p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/30">
              <div className="flex items-center gap-2 text-sm text-brand-primary">
                <Truck className="h-4 w-4" />
                <span>Add {formatPrice(50 - subtotal)} more for free shipping!</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              asChild
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
              size="lg"
            >
              <Link className="gap-2" href="/cart/checkout">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              className="w-full bg-transparent border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-muted/40 dark:hover:bg-brand-muteddark/30"
              variant="outline"
            >
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-text-subtle dark:text-text-subtledark">
              <Truck className="h-3 w-3" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-subtle dark:text-text-subtledark">
              <RotateCcw className="h-3 w-3" />
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-subtle dark:text-text-subtledark">
              <Shield className="h-3 w-3" />
              <span>Secure checkout with SSL encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
