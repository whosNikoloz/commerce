"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CreditCard } from "lucide-react";

import { useDictionary } from "@/app/context/dictionary-provider";
import { PaymentType, PAYMENT_PROVIDERS, PaymentProviderOption } from "@/types/payment";

interface CheckoutFormProps {
  value?: PaymentType;
  onChange: (paymentType: PaymentType) => void;
  availableTypes?: PaymentType[];
  loading?: boolean;
}

export default function CheckoutForm({
  value,
  onChange,
  availableTypes = [],
  loading = false,
}: CheckoutFormProps) {
  const dictionary = useDictionary();
  const [selected, setSelected] = useState<PaymentType>(value ?? PaymentType.BOG);

  // Filter available providers based on availableTypes
  const availableProviders = PAYMENT_PROVIDERS.filter(p =>
    availableTypes.includes(p.type)
  );

  useEffect(() => {
    if (availableTypes.length === 0) return;

    onChange(selected);
    if (typeof window !== "undefined") {
      localStorage.setItem("pay_provider_type", String(selected));
    }
  }, [selected, onChange, availableTypes.length]);

  useEffect(() => {
    if (availableTypes.length === 0) return;

    if (!value && typeof window !== "undefined") {
      const saved = localStorage.getItem("pay_provider_type");

      if (saved) {
        const savedType = Number(saved) as PaymentType;

        if (availableTypes.includes(savedType)) {
          setSelected(savedType);
        }
      }
    }
  }, [value, availableTypes.length]);

  const isLoadingOptions = loading || availableProviders.length === 0;

  // Get logo based on payment type
  const getProviderLogo = (type: PaymentType): string => {
    switch (type) {
      case PaymentType.TBC:
      case PaymentType.BOG:
      case PaymentType.BOGInstallment:
        return "/logos/bog.png";
      case PaymentType.Flitt:
      case PaymentType.FlittInstallment:
        return "/logos/flitt.png";
      default:
        return "/logos/default-payment.png";
    }
  };

  // Get provider display name
  const getProviderName = (provider: PaymentProviderOption): string => {
    // Try to get localized name from dictionary
    const providerKey =
      provider.type === PaymentType.BOG || provider.type === PaymentType.BOGInstallment
        ? "bog"
        : provider.type === PaymentType.TBC
          ? "tbc"
          : "flitt";

    const localizedName = dictionary.checkout?.providers?.[providerKey];

    if (localizedName) {
      return provider.isInstallment
        ? `${localizedName} (${dictionary.checkout?.installment || 'Installment'})`
        : localizedName;
    }

    return provider.name;
  };

  const Option = ({ provider }: { provider: PaymentProviderOption }) => {
    const active = selected === provider.type;
    const logoSrc = getProviderLogo(provider.type);
    const label = getProviderName(provider);

    return (
      <button
        className={`relative w-full text-left rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 border-2 overflow-hidden group ${
          active
            ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/5"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/80 hover:border-brand-primary/30"
        }`}
        type="button"
        onClick={() => setSelected(provider.type)}
      >
        {/* Active accent */}
        {active && (
          <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-brand-primary rounded-l-2xl sm:rounded-l-3xl" />
        )}

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Radio */}
          <div
            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              active ? "bg-brand-primary border-brand-primary" : "border-gray-300 dark:border-white/20"
            }`}
          >
            {active && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>

          {/* Logo */}
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white dark:bg-white/10 ring-1 ring-gray-200/50 dark:ring-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image
              alt={label}
              className="rounded object-contain"
              height={40}
              src={logoSrc}
              width={40}
            />
          </div>

          {/* Label */}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-base dark:text-white tracking-tight">
              {label}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
              {provider.isInstallment
                ? dictionary.checkout?.installmentDescription || 'Pay in installments'
                : dictionary.checkout?.secureHostedCheckout || 'Secure hosted checkout'
              }
            </span>
          </div>

          {/* Installment badge */}
          {provider.isInstallment && (
            <span className="ml-auto text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800/50 uppercase tracking-wide flex-shrink-0">
              {dictionary.checkout?.installmentBadge || 'Installment'}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-white/10">
          <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-black dark:text-white tracking-tight uppercase">
          {dictionary.checkout?.chooseProvider || 'Choose Payment Method'}
        </h3>
      </div>

      {isLoadingOptions ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 animate-pulse">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-5 w-5 rounded-full bg-muted dark:bg-white/10" />
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted dark:bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted dark:bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-muted dark:bg-white/5 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {availableProviders.map(provider => (
            <Option key={provider.type} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
