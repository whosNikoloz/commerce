"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Truck, Shield, RotateCcw, LogIn, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/app/context/cartContext";
import { useUser } from "@/app/context/userContext";
import { useDictionary } from "@/app/context/dictionary-provider";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ka-GE", { style: "currency", currency: "GEL" }).format(price).replace("GEL", "₾");

const PROMO_CODES = {
  SAVE10: { discount: 0.1, label: "10% OFF" },
  WELCOME15: { discount: 0.15, label: "15% OFF" },
  FREESHIP: { discount: 0, label: "Free Shipping", freeShipping: true },
} as const;

interface CartSummaryProps {
  autoShowLoginPrompt?: boolean;
}

export default function CartSummary({ autoShowLoginPrompt = false }: CartSummaryProps) {
  const dictionary = useDictionary();
  const { user } = useUser();
  const router = useRouter();
  const itemCount = useCartStore((s) => s.cart.length);
  const subtotal = useCartStore((s) => s.getSubtotal());

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<keyof typeof PROMO_CODES | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [shippingOption, _setShippingOption] = useState<"standard" | "express" | "overnight">(
    "standard",
  );
  const [showLoginPrompt, setShowLoginPrompt] = useState(autoShowLoginPrompt);

  const promoDiscount = appliedPromo ? subtotal * PROMO_CODES[appliedPromo].discount : 0;

  const getShippingCost = () => {
    if (appliedPromo === "FREESHIP" || subtotal > 50) return 0;
    switch (shippingOption) {
      case "express":
        return 19.99;
      case "overnight":
        return 39.99;
      default:
        return 0;
    }
  };

  const shipping = getShippingCost();
  const tax = 0.00 //(subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + shipping + tax;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase() as keyof typeof PROMO_CODES;

    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoCode("");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _removePromoCode = () => setAppliedPromo(null);

  // Update showLoginPrompt when autoShowLoginPrompt changes
  useEffect(() => {
    if (autoShowLoginPrompt) {
      setShowLoginPrompt(true);
    }
  }, [autoShowLoginPrompt]);

  const handleCheckoutClick = () => {
    if (!user) {
      setShowLoginPrompt(true);

      return;
    }
    router.push("/cart/checkout");
  };

  const freeShippingProgress = subtotal > 0 && subtotal < 50 ? Math.min((subtotal / 50) * 100, 100) : 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "150ms" }}>
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-white/10">
              <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-base sm:text-lg font-black dark:text-white tracking-tight uppercase">
              {dictionary.cart.orderSummary}
            </h2>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-4">
          {/* Login Prompt */}
          {showLoginPrompt && !user && (
            <div className="p-3 sm:p-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    {dictionary.cart.loginRequired}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    {dictionary.cart.loginRequiredMsg}
                  </p>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1.5 font-semibold"
                    onClick={() => setShowLoginPrompt(false)}
                  >
                    {dictionary.cart.dismiss}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">
                {dictionary.cart.subtotal} ({itemCount} {itemCount === 1 ? dictionary.cart.item : dictionary.cart.items})
              </span>
              <span className="font-bold dark:text-white">
                {formatPrice(subtotal)}
              </span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between items-center text-sm text-brand-primary">
                <span className="font-medium">{dictionary.cart.discount} ({appliedPromo})</span>
                <span className="font-bold">-{formatPrice(promoDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{dictionary.cart.shipping}</span>
              <span className="font-bold dark:text-white">
                {shipping === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{dictionary.cart.free}</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">{dictionary.cart.tax}</span>
              <span className="font-bold dark:text-white">
                {formatPrice(tax)}
              </span>
            </div>
          </div>

          <Separator className="bg-gray-100 dark:bg-white/5" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-black dark:text-white uppercase tracking-tight">{dictionary.cart.total}</span>
            <span className="text-lg sm:text-xl font-black dark:text-white">{formatPrice(total)}</span>
          </div>

          {/* Free Shipping Progress */}
          {shipping > 0 && subtotal > 0 && subtotal < 50 && (
            <div className="p-3 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/15">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary font-semibold mb-2">
                <Truck className="h-4 w-4 flex-shrink-0" />
                <span>{dictionary.cart.addMoreForFreeShipping.replace("{amount}", formatPrice(50 - subtotal))}</span>
              </div>
              <div className="w-full h-1.5 bg-brand-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            <Button
              className="w-full h-11 sm:h-12 bg-brand-primary hover:bg-brand-primary/90 text-white gap-2 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all active:scale-[0.98]"
              size="lg"
              onClick={handleCheckoutClick}
            >
              {user ? (
                <>
                  {dictionary.cart.proceedToCheckout}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                  {dictionary.cart.loginToCheckout}
                </>
              )}
            </Button>

            <Button
              asChild
              className="w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-foreground dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-brand-primary/30 transition-all font-bold text-xs sm:text-sm"
              variant="outline"
            >
              <Link href="/">{dictionary.cart.continueShopping}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5">
        <div className="space-y-3">
          {[
            { icon: Truck, text: dictionary.cart.freeShippingOver.replace("{amount}", "₾50"), color: "text-brand-primary bg-brand-primary/10 ring-brand-primary/15" },
            { icon: RotateCcw, text: dictionary.cart.returnPolicy, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 ring-amber-500/15" },
            { icon: Shield, text: dictionary.cart.secureCheckout, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/15" },
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
