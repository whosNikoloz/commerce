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
  // ✅ Pull only what you need from the store (minimal re-renders)
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
      {/* Order Summary */}
      <Card className="dark:bg-brand-muteddark bg-brand-muted">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount ({appliedPromo})</span>
                <span>-{formatPrice(promoDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600 dark:text-green-400">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Free Shipping Progress */}
          {shipping > 0 && subtotal > 0 && subtotal < 50 && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Truck className="h-4 w-4" />
                <span>Add {formatPrice(50 - subtotal)} more for free shipping!</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button asChild className="w-full" size="lg">
              <Link className="gap-2" href="/cart/checkout">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild className="w-full bg-transparent" variant="outline">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RotateCcw className="h-3 w-3" />
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secure checkout with SSL encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* — The Promo & Shipping Options blocks you commented out can stay as-is.
           If you re-enable them, they don't need cart data, so no extra changes. — */}
    </div>
  );
}
