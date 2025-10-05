"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const translations: Record<string, string> = {
  "cart.title": "Shopping Cart",
  "cart.empty": "Your cart is empty",
  "cart.emptyDescription": "Start adding items to your cart to see them here",
  "cart.startShopping": "Start Shopping",
  "cart.freeShippingOver": "Free shipping on orders over $50",
  "cart.secureCheckout": "Secure checkout process",
  "cart.fastDelivery": "Fast delivery available",
};

export default function EmptyCart() {
  const t = (key: string) => translations[key] || key;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-brand-primary/10">
            <ShoppingBag className="h-6 w-6 text-brand-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-lightdark">
            {t('cart.title')}
          </h1>
        </div>

        <Card className="text-center py-16 bg-card border border-border/50 shadow-lg">
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-brand-muted dark:bg-brand-muteddark flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-text-subtle dark:text-text-subtledark" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-brand-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-text-light dark:text-text-lightdark">
                {t('cart.empty')}
              </h2>
              <p className="text-text-subtle dark:text-text-subtledark max-w-md mx-auto">
                {t('cart.emptyDescription')}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <Button
                asChild
                className="gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white"
                size="lg"
              >
                <Link href="/">
                  {t('cart.startShopping')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <div className="text-sm text-text-subtle dark:text-text-subtledark space-y-1">
                <p>✨ {t('cart.freeShippingOver')}</p>
                <p>🔒 {t('cart.secureCheckout')}</p>
                <p>📦 {t('cart.fastDelivery')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
