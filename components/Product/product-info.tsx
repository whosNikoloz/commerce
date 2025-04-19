"use client";

import { useState } from "react";
import { Star, ShoppingCart, Heart, Check } from "lucide-react";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";

interface ProductInfoProps {
  title: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  features: string[];
}

export function ProductInfo({
  title,
  rating,
  reviewCount,
  price,
  originalPrice,
  discount,
  stock,
  features,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-2">Best Seller</Badge>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({reviewCount} reviews)
          </span>
        </div>
      </div>

      {/* Sticky price section */}
      <div className="md:sticky relative md:top-20 bg-white p-4 border rounded-lg shadow-sm">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
          {discount && <Badge>{discount}% OFF</Badge>}
        </div>
        <p className="text-sm text-green-600 mb-4">
          In stock - Ships within 24 hours
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <button
                aria-label="Decrease quantity"
                className="px-3 py-2 text-lg"
                onClick={decreaseQuantity}
              >
                -
              </button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button
                aria-label="Increase quantity"
                className="px-3 py-2 text-lg"
                onClick={increaseQuantity}
              >
                +
              </button>
            </div>
            <span className="text-sm text-muted-foreground">
              {stock} items left
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Button className="sm:col-span-3 gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button className="gap-2">
              <Heart className="h-5 w-5" />
              Wishlist
            </Button>
          </div>
        </div>
      </div>

      {/* Key features */}
      <div className="space-y-2">
        <h3 className="font-semibold">Key Features:</h3>
        <ul className="space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
