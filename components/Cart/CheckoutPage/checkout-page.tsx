"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/context/cartContext";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, clearCart } = useCart();
  const router = useRouter();

  // // Handle redirect when cart is empty
  // useEffect(() => {
  //   if (cart.length === 0) {
  //     router.push("/cart")
  //   }
  // }, [cart.length, router])

  // Don't render anything while redirecting
  if (cart.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);

    // Clear cart after successful order
    clearCart();

    // Redirect to order confirmation
    router.push("/order-confirmation/success");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CheckoutForm />
          <OrderSummary onSubmit={handleSubmit} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
}
