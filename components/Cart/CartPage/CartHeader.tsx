"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/app/context/dictionary-provider";

interface CartHeaderProps {
  itemCount: number;
}

export default function CartHeader({ itemCount }: CartHeaderProps) {
  const dictionary = useDictionary();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 dark:from-brand-primary/30 dark:to-brand-primary/10 flex items-center justify-center ring-1 ring-brand-primary/20">
          <ShoppingBag className="h-5 w-5 sm:h-7 sm:w-7 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black dark:text-white tracking-tight uppercase">
            {dictionary.cart.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
            {itemCount} {itemCount === 1 ? dictionary.cart.item : dictionary.cart.items} {dictionary.cart.inYourCart}
          </p>
        </div>
      </div>

      <Button
        asChild
        className="gap-2 rounded-xl border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm text-foreground dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-brand-primary/30 transition-all text-xs sm:text-sm font-bold"
        variant="outline"
      >
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          {dictionary.cart.continueShopping}
        </Link>
      </Button>
    </div>
  );
}
