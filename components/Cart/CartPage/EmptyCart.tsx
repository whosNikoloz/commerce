"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EmptyCart() {
  return (
    <div className="min-h-screen bg-inherit">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>

        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Your cart is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Looks like you haven&apos;t added any items to your cart yet. Start shopping to fill
                it up!
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <Button asChild className="gap-2" size="lg">
                <Link href="/">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>✨ Free shipping on orders over $50</p>
                <p>🔒 Secure checkout guaranteed</p>
                <p>📦 Fast delivery options available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
