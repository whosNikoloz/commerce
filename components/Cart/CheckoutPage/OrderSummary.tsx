"use client"

import { useState } from "react"
import Image from "next/image"
import { Shield, Truck, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/cartContext"

interface OrderSummaryProps {
  onSubmit: (e: React.FormEvent) => void
  isProcessing: boolean
}

export default function OrderSummary({ onSubmit, isProcessing }: OrderSummaryProps) {
  const { cart } = useCart()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <Card className="sticky top-8 dark:bg-brand-muteddark bg-brand-muted">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {item.quantity}
                </Badge>
              </div>
              {/* 🔹 არჩეული სპეციფიკაციები — როგორც ბეჟები */}

              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(item.selectedFacets).map(([k, v]) => (
                      <Badge key={k} variant="secondary" className="h-5 text-[11px] px-1.5">
                        {k}: {v}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {item.originalPrice && (
                    <span className="line-through text-xs mr-2">
                      ${typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                    </span>
                  )}
                  <span className="font-medium text-text-light dark:text-text-lightdark">${item.price.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
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
          <Button type="submit" className="w-full" size="lg" disabled={isProcessing || cart.length === 0}>
            {isProcessing ? "Processing..." : `Place Order • $${total.toFixed(2)}`}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          By placing your order, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  )
} 