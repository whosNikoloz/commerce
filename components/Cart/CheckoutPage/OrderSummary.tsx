"use client";

import Image from "next/image";
import { Shield, Truck, Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/app/context/cartContext";

interface OrderSummaryProps {
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));

export default function OrderSummary({ onSubmit, isProcessing }: OrderSummaryProps) {
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <Card className="sticky top-8 dark:bg-brand-muteddark bg-brand-muted">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-4">
          {cart.map((item) => {
            const price = toNumber(item.price);
            const original =
              typeof item.originalPrice === "number"
                ? item.originalPrice
                : toNumber(item.originalPrice);

            return (
              <div key={`${item.id}-${item.variantKey ?? ""}`} className="flex gap-4">
                <div className="relative">
                  <Image
                    priority
                    alt={item.name}
                    className="rounded-lg object-cover"
                    height={80}
                    src={item.image || "/placeholder.svg"}
                    width={80}
                  />
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {item.quantity}
                  </Badge>
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>

                  {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.selectedFacets).map(([k, v]) => (
                        <Badge key={k} className="h-5 text-[11px] px-1.5" variant="secondary">
                          {k}: {v}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {original && original > price && (
                      <span className="line-through text-xs mr-2">${original.toFixed(2)}</span>
                    )}
                    <span className="font-medium text-text-light dark:text-text-lightdark">
                      ${price.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure SSL encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4" />
            <span>30-day return policy</span>
          </div>
        </div>

        {/* Place Order Button */}
        <form onSubmit={onSubmit}>
          <Button
            className="w-full"
            disabled={isProcessing || cart.length === 0}
            size="lg"
            type="submit"
          >
            {isProcessing ? "Processing..." : `Place Order • $${total.toFixed(2)}`}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          By placing your order, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  );
}
