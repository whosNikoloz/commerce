"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CartHeaderProps {
  itemCount: number;
}

export default function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-brand-primary/10">
          <ShoppingCart className="h-6 w-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-lightdark">
            Shopping Cart
          </h1>
          <p className="text-sm text-text-subtle dark:text-text-subtledark">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      <Button
        asChild
        className="gap-2 bg-transparent border-gray-300 dark:border-gray-700 text-text-light dark:text-text-lightdark hover:bg-gray-100 dark:hover:bg-gray-800"
        variant="outline"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </Button>
    </div>
  );
}
