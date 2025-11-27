"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDictionary } from "@/app/context/dictionary-provider";

export default function EmptyCart() {
  const dictionary = useDictionary();

  return (
    <div className="min-h-screen mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <Card className="text-center py-16 bg-inherit border-0 shadow-none">
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-brand-muted dark:bg-brand-muteddark flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-text-subtle dark:text-text-subtledark" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-text-light dark:text-text-lightdark">
                {dictionary.cart.empty}
              </h2>
              <p className="text-text-subtle dark:text-text-subtledark">
                {dictionary.cart.emptyDescription}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <Button
                asChild
                className="gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white"
                size="lg"
              >
                <Link href="/">
                  {dictionary.cart.startShopping}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
