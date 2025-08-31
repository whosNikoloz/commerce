"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/app/context/cartContext";

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  // pull minimal selectors to reduce re-renders
  const cartLen = useCartStore((s) => s.getCount());
  const clearCart = useCartStore((s) => s.clearCart);

  const router = useRouter();

  // redirect when cart is empty
  useEffect(() => {
    if (cartLen === 0) router.push("/cart");
  }, [cartLen, router]);

  if (cartLen === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    clearCart(); // clear after success
    router.push("/order-confirmation/success");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild size="icon" variant="ghost">
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
          <OrderSummary isProcessing={isProcessing} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
