"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/cartContext"

export default function CartItems() {
  const { cart, updateCartItem, removeFromCart } = useCart()
  const [savedItems, setSavedItems] = useState<number[]>([])

  const saveForLater = (id: number) => {
    setSavedItems((prev) => [...prev, id])
    removeFromCart(id)
  }

  const moveToCart = (id: number) => {
    // In a real app, you'd fetch the item from saved items
    setSavedItems((prev) => prev.filter((itemId) => itemId !== id))
  }

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                />
                {item.originalPrice && <Badge className="absolute -top-2 -right-2 bg-red-500">Sale</Badge>}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">
                      {item.originalPrice && (
                        <span className="line-through text-xs mr-2">
                          ${typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                        </span>
                      )}
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="text-muted-foreground line-through">
                        ${typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : item.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveForLater(item.id)}
                    className="text-muted-foreground"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Saved Items */}
      {savedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved for Later ({savedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedItems.map((itemId) => (
                <div key={itemId} className="flex items-center justify-between p-4 border rounded-lg">
                  <span>Saved item #{itemId}</span>
                  <Button variant="outline" size="sm" onClick={() => moveToCart(itemId)}>
                    Move to Cart
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 