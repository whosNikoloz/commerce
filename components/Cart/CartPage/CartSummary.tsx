"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/app/context/cartContext";

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

export default function CartSummary() {
  const { cart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const promoDiscount = appliedPromo === "SAVE10" ? subtotal * 0.1 : 0;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + shipping + tax;

  const applyPromoCode = () => {
    if (promoCode.trim().toLowerCase() === "save10") {
      setAppliedPromo("SAVE10");
      setPromoCode("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Promo Code */}
      <Card className="border-brand-muted/60 bg-white dark:bg-brand-muteddark dark:border-brand-muteddark/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-light">
            <Tag className="h-4 w-4" />
            Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-medium">{appliedPromo} Applied</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAppliedPromo(null)}
                className="text-emerald-800 hover:bg-emerald-100"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-brand-surface border-brand-muted/60 text-text-light placeholder:text-text-subtle"
              />
              <Button
                onClick={applyPromoCode}
                disabled={!promoCode}
                className="bg-brand-primary hover:bg-brand-primarydark text-white"
              >
                Apply
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="border-brand-muted/60 bg-white dark:bg-brand-muteddark dark:border-brand-muteddark/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-light">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-text-light">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-subtle">Subtotal ({cart.length} items)</span>
              <span>{fmt(subtotal)}</span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({appliedPromo})</span>
                <span>-{fmt(promoDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-text-subtle">Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-emerald-600">Free</span>
                ) : (
                  fmt(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-subtle">Estimated Tax</span>
              <span>{fmt(tax)}</span>
            </div>

            <Separator className="my-2 bg-brand-muted/60" />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          {shipping > 0 && subtotal > 0 && (
            <div className="p-3 rounded-lg bg-brand-surface border border-brand-muted/60 text-text-subtle">
              Add {fmt(50 - subtotal)} more for free shipping!
            </div>
          )}

          <Button
            asChild
            size="lg"
            className="w-full bg-brand-primary hover:bg-brand-primarydark text-white"
          >
            <Link href="/cart/checkout">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full border-brand-primary/30 text-brand-primary hover:bg-brand-muted hover:text-brand-primarydark"
          >
            <Link href="/">Continue Shopping</Link>
          </Button>

          <div className="text-xs text-text-subtle space-y-1">
            <p>• Free shipping on orders over $50</p>
            <p>• 30-day return policy</p>
            <p>• Secure checkout with SSL encryption</p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Options */}
      <Card className="border-brand-muted/60 bg-white dark:bg-brand-muteddark dark:border-brand-muteddark/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-light">Shipping Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue="standard">
            <SelectTrigger className="bg-brand-surface border-brand-muted/60 text-text-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-brand-surfacedark text-text-light">
              <SelectItem value="standard">
                Standard (5-7 days) – {shipping === 0 ? "Free" : fmt(9.99)}
              </SelectItem>
              <SelectItem value="express">Express (2-3 days) – {fmt(19.99)}</SelectItem>
              <SelectItem value="overnight">Overnight – {fmt(39.99)}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
