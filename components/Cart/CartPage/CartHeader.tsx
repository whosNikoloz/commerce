"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CartHeaderProps {
  itemCount: number
}

export default function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  )
} 