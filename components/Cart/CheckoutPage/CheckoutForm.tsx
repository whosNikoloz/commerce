"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
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
        className={`w-full text-left rounded-xl p-4 transition border
          ${active
            ? "border-brand-primary ring-2 ring-brand-primary/20"
            : "border-brand-muted dark:border-brand-muteddark hover:border-brand-primary/50"
          }`}
        type="button"
        onClick={() => setSelected(provider.type)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`h-4 w-4 rounded-full border flex items-center justify-center
              ${active ? "bg-brand-primary border-brand-primary" : "border-text-subtle/50"}`}
          >
            {active && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <Image
            alt={label}
            className="rounded bg-white object-contain"
            height={40}
            src={logoSrc}
            width={40}
          />
          <div className="flex flex-col">
            <span className="font-primary font-medium text-text-light dark:text-text-lightdark">
              {label}
            </span>
            <span className="font-primary text-xs text-text-subtle dark:text-text-subtledark">
              {provider.isInstallment
                ? dictionary.checkout?.installmentDescription || 'Pay in installments'
                : dictionary.checkout?.secureHostedCheckout || 'Secure hosted checkout'
              }
            </span>
          </div>
          {provider.isInstallment && (
            <span className="ml-auto text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
              {dictionary.checkout?.installmentBadge || 'Installment'}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <Card className="p-6 bg-card border border-border/50 shadow-lg">
      <div className="mb-4 font-semibold text-lg text-text-light dark:text-text-lightdark">
        {dictionary.checkout?.chooseProvider || 'Choose Payment Method'}
      </div>
      {isLoadingOptions ? (
        <div className="space-y-3">
          <div className="h-14 rounded-xl bg-muted/60 dark:bg-muted/20 animate-pulse" />
          <div className="h-14 rounded-xl bg-muted/60 dark:bg-muted/20 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {availableProviders.map(provider => (
            <Option key={provider.type} provider={provider} />
          ))}
        </div>
      )}
    </Card>
  );
}
