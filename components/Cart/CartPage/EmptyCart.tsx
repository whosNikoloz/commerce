"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/app/context/dictionary-provider";

export default function EmptyCart() {
  const dictionary = useDictionary();

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 dark:from-brand-primary/30 dark:to-brand-primary/10 flex items-center justify-center ring-1 ring-brand-primary/20 mb-6 animate-pulse">
            <ShoppingBag className="h-9 w-9 sm:h-11 sm:w-11 text-brand-primary" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black dark:text-white tracking-tight uppercase text-center">
            {dictionary.cart.empty}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2 max-w-xs text-center">
            {dictionary.cart.emptyDescription}
          </p>

          <div className="mt-8">
            <Button
              asChild
              className="h-11 sm:h-12 px-6 sm:px-8 bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all active:scale-[0.98]"
              size="lg"
            >
              <Link href="/">
                {dictionary.cart.startShopping}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
