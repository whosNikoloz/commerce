"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CartHeaderProps {
  itemCount: number;
}

export default function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-lightdark">
          Shopping Cart
        </h1>
        <p className="text-text-subtle dark:text-text-subtledark">
          {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <Button
        variant="outline"
        asChild
        className="border-brand-primary/30 text-brand-primary hover:bg-brand-muted hover:text-brand-primarydark"
      >
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  );
}
