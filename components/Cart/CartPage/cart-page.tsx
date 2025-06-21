"use client"

import { useCart } from "@/app/context/cartContext"
import CartHeader from "./CartHeader"
import CartSummary from "./CartSummary"
import CartItems from "../cart-items"
import EmptyCart from "./EmptyCart"

export default function CartPage() {
  const { cart } = useCart()

  if (cart.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CartHeader itemCount={cart.length} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
