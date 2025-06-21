"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/app/context/cartContext"

export default function CartSummary() {
  const { cart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setAppliedPromo("SAVE10")
      setPromoCode("")
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const promoDiscount = appliedPromo === "SAVE10" ? subtotal * 0.1 : 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = (subtotal - promoDiscount) * 0.08
  const total = subtotal - promoDiscount + shipping + tax

  return (
    <div className="space-y-6">
      {/* Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {appliedPromo ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">{appliedPromo} Applied</span>
              <Button variant="ghost" size="sm" onClick={() => setAppliedPromo(null)} className="text-green-800">
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button onClick={applyPromoCode} disabled={!promoCode}>
                Apply
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({cart.length} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedPromo})</span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
            </div>
          )}

          <Button asChild className="w-full" size="lg">
            <Link href="/cart/checkout">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>

          <div className="text-center">
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Free shipping on orders over $50</p>
            <p>• 30-day return policy</p>
            <p>• Secure checkout with SSL encryption</p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue="standard">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (5-7 days) - {shipping === 0 ? "Free" : "$9.99"}</SelectItem>
              <SelectItem value="express">Express (2-3 days) - $19.99</SelectItem>
              <SelectItem value="overnight">Overnight - $39.99</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
} 