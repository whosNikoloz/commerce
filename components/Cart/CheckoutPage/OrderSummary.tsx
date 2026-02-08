"use client";

import Image from "next/image";
import { Shield, Check, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";
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
    <div className="lg:sticky lg:top-20 h-min space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-white/10">
              <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-base sm:text-lg font-black dark:text-white tracking-tight uppercase">
              {dictionary.checkout.orderSummary}
            </h2>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-4">
          {/* Cart items */}
          <div className="space-y-3">
            {cart.map((item) => {
              const price = toNumber(item.price);
              const originalPrice = item.originalPrice ? toNumber(item.originalPrice) : null;

              return (
                <div key={`${item.id}`} className="flex gap-3 group">
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 ring-1 ring-black/[0.03] dark:ring-white/5">
                      <Image
                        alt={item.name}
                        className="object-cover h-full w-full"
                        height={72}
                        loading="lazy"
                        quality={75}
                        src={item.image || "/placeholder.png"}
                        width={72}
                      />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-sm leading-snug line-clamp-2 dark:text-white tracking-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-extrabold text-sm dark:text-white">
                        {`₾${price.toFixed(2)}`}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {`₾${originalPrice.toFixed(2)}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="bg-gray-100 dark:bg-white/5" />

          {/* Price breakdown */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{dictionary.checkout.subtotal ?? "SubTotal"}</span>
              <span className="font-bold dark:text-white">{`₾${subtotal.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{dictionary.checkout.tax ?? "TAX"}</span>
              <span className="font-bold dark:text-white">{`₾${tax.toFixed(2)}`}</span>
            </div>
          </div>

          <Separator className="bg-gray-100 dark:bg-white/5" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-black dark:text-white uppercase tracking-tight">{dictionary.checkout.total ?? "Total"}</span>
            <span className="text-lg sm:text-xl font-black dark:text-white">{`₾${total.toFixed(2)}`}</span>
          </div>

          {/* Submit button */}
          <button
            className="w-full h-11 sm:h-12 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            disabled={isProcessing}
            onClick={onSubmit}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                {dictionary.checkout.processingLabel}
              </>
            ) : (
              <>
                {submitButtonLabel ?? dictionary.checkout.reviewAndPay}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </>
            )}
          </button>

          <p className="text-[11px] text-muted-foreground text-center font-medium">
            {dictionary.checkout.termsAgreement}
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5">
        <div className="space-y-3">
          {[
            { icon: Shield, text: dictionary.checkout.secureEncryption ?? "Secure Encryption", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/15" },
            { icon: Check, text: dictionary.checkout.returnPolicy ?? "Return Policy", color: "text-brand-primary bg-brand-primary/10 ring-brand-primary/15" },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
