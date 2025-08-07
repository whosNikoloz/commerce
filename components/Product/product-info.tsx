"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";

interface ProductInfoProps {
  price: number;
  originalPrice: number;
  discount?: number;
  inStock: number;
  points: number;
  onAddToCart?: () => void;
  onWishlist?: () => void;
  onBuyNow?: () => void;
}

export function ProductInfo({
  price,
  originalPrice,
  discount,
  inStock,
  points,
  onAddToCart,
  onWishlist,
  onBuyNow,
}: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <div className="md:sticky relative md:top-20 bg-brand-muted  w-full dark:bg-brand-muteddark p-6  rounded-lg shadow-sm">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{price.toFixed(2)} ₾</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toFixed(2)} ₾
            </span>
          )}
          {discount && (
            <Badge className="bg-red-500 text-white rounded-md py-1 px-2 text-xs font-medium">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Points/loyalty section */}
        {points && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-600">ქულები: {points}-მდე</span>
            </div>
            <span className="text-gray-500">0%</span>
            <div className="flex items-center space-x-1">
              <span className="text-blue-500">|</span>
              <span className="text-blue-500">ⓘ</span>
              <span className="text-orange-500">🎁</span>
              <span className="text-blue-500">ⓘ</span>
            </div>
          </div>
        )}

        {/* Delivery info */}
        {inStock && (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-full text-sm">
            <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full">
              <span className="text-black">🚚</span>
            </div>
            <span>უფასო მიწოდება {inStock} სთ-ში</span>
          </div>
        )}

        {/* Mobile layout - Full width buttons stacked vertically */}
        <div className="md:hidden space-y-2 mt-4">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-md"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>კალათაში დამატება</span>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-md"
              onClick={onBuyNow}
            >
              <span>ყიდვა</span>
            </Button>

            <Button
              className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black py-3 rounded-md"
              onClick={onWishlist}
            >
              <span>განვადება</span>
            </Button>
          </div>
        </div>

        {/* Desktop layout - Side by side buttons */}
        <div className="hidden md:block mt-4 space-y-4">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-md"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>დამატება</span>
          </Button>

          <Button
            className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-md"
            onClick={onBuyNow}
          >
            <span>ყიდვა</span>
          </Button>

          <Button
            className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black py-3 rounded-md"
            onClick={onWishlist}
          >
            <span>განვადება</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
