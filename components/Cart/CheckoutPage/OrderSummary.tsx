"use client";

import Image from "next/image";
import { Shield, Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/app/context/cartContext";
import { useDictionary } from "@/app/context/dictionary-provider";

interface OrderSummaryProps {
  isProcessing: boolean;
  submitButtonLabel?: string;
  totalOverride?: number;
  onSubmit?: () => void;
}

const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));

export default function OrderSummary({
  isProcessing,
  submitButtonLabel,
  totalOverride,
  onSubmit,
}: OrderSummaryProps) {
  const dictionary = useDictionary();
  const cart = useCartStore((s) => s.cart);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const shipping: number = 0.00 //subtotal > 50 ? 0 : 9.99;
  const tax: number = 0.00 //subtotal * 0.08;
  const total = typeof totalOverride === "number" ? totalOverride : subtotal + shipping + tax;

  return (
    <Card className="sticky top-20 h-min bg-card border border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-text-light dark:text-text-lightdark">{dictionary.checkout.orderSummary}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {cart.map((item) => {
            const price = toNumber(item.price);
            const originalPrice = item.originalPrice ? toNumber(item.originalPrice) : null;

            return (
              <div key={`${item.id}`} className="flex gap-4">
                <div className="relative">
                  <Image
                    alt={item.name}
                    className="rounded-lg object-cover"
                    height={80}
                    loading="lazy"
                    quality={75}
                    src={item.image || "/placeholder.png"}
                    width={80}
                  />
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs bg-brand-primary text-white">
                    {item.quantity}
                  </Badge>
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-heading font-medium text-sm text-text-light dark:text-text-lightdark">
                    {item.name}
                  </h4>
                  <p className="font-primary text-sm text-text-subtle dark:text-text-subtledark">
                    {originalPrice && originalPrice > price && (
                      <span className="font-primary line-through text-xs mr-2">{`₾${originalPrice.toFixed(2)}`}</span>
                    )}
                    <span className="font-primary font-medium text-text-light dark:text-text-lightdark">{`₾${price.toFixed(2)}`}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="bg-brand-muted/60 dark:bg-brand-muteddark/50" />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-primary text-text-subtle dark:text-text-subtledark">{dictionary.checkout.subtotal ?? "SubTotal"}</span>
            <span className="font-primary text-text-light dark:text-text-lightdark">{`₾${subtotal.toFixed(2)}`}</span>
          </div>
          {/* <div className="flex justify-between">
            <span className="font-primary text-text-subtle dark:text-text-subtledark">{dictionary.checkout.shipping ?? "Shipping"}</span>
            <span className="font-primary text-text-light dark:text-text-lightdark">
              {shipping === 0 ? dictionary.checkout.free : `₾${shipping.toFixed(2)}`}
            </span>
          </div> */}
          <div className="flex justify-between">
            <span className="font-primary text-text-subtle dark:text-text-subtledark">{dictionary.checkout.tax ?? "TAX"}</span>
            <span className="font-primary text-text-light dark:text-text-lightdark">{`₾${tax.toFixed(2)}`}</span>
          </div>
          <Separator className="bg-brand-muted/60 dark:bg-brand-muteddark/50" />
          <div className="flex justify-between font-medium text-lg">
            <span className="font-primary text-text-light dark:text-text-lightdark">{dictionary.checkout.total ?? "Total"}</span>
            <span className="font-primary text-text-light dark:text-text-lightdark">{`₾${total.toFixed(2)}`}</span>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2 text-sm text-text-subtle dark:text-text-subtledark">
            <Shield className="h-4 w-4" />
            <span>{dictionary.checkout.secureEncryption ?? "Secure Encryption"}</span>
          </div>
          {/* <div className="flex items-center gap-2 text-sm text-text-subtle dark:text-text-subtledark">
            <Truck className="h-4 w-4" />
            <span>{dictionary.checkout.freeShippingOver.replace("{amount}", "₾50")}</span>
          </div> */}
          <div className="flex items-center gap-2 text-sm text-text-subtle dark:text-text-subtledark">
            <Check className="h-4 w-4" />
            <span>{dictionary.checkout.returnPolicy ?? "Return Policy"}</span>
          </div>
        </div>
        <Button
          className="w-full bg-brand-primary text-white"
          disabled={isProcessing}
          size="lg"
          onClick={onSubmit}
        >
          {isProcessing ? dictionary.checkout.processingLabel : (submitButtonLabel ?? dictionary.checkout.reviewAndPay)}
        </Button>

        <p className="font-primary text-xs text-text-subtle dark:text-text-subtledark text-center">
          {dictionary.checkout.termsAgreement}
        </p>
      </CardContent>
    </Card>
  );
}
