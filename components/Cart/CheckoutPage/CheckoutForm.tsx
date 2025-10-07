"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Card } from "@/components/ui/card";

export type Provider = "bog" | "tbc";

export default function CheckoutForm({
  value,
  onChange,
}: {
  value?: Provider;
  onChange: (p: Provider) => void;
}) {
  const [selected, setSelected] = useState<Provider>(value ?? "bog");

  useEffect(() => {
    onChange(selected);
    if (typeof window !== "undefined") localStorage.setItem("pay_provider", selected);
  }, [selected, onChange]);

  useEffect(() => {
    if (!value && typeof window !== "undefined") {
      const saved = localStorage.getItem("pay_provider") as Provider | null;

      if (saved === "bog" || saved === "tbc") setSelected(saved);
    }
  }, [value]);

  const Option = ({ id, label, logoSrc }: { id: Provider; label: string; logoSrc: string }) => {
    const active = selected === id;

    return (
      <button
        className={`w-full text-left rounded-xl p-4 transition border
          ${
            active
              ? "border-brand-primary ring-2 ring-brand-primary/20"
              : "border-brand-muted dark:border-brand-muteddark hover:border-brand-primary/50"
          }`}
        type="button"
        onClick={() => setSelected(id)}
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
            <span className="font-medium text-text-light dark:text-text-lightdark">{label}</span>
            <span className="text-xs text-text-subtle dark:text-text-subtledark">
              Secure hosted checkout
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Card className="p-6 bg-card border border-border/50 shadow-lg">
      <div className="mb-4 font-semibold text-lg text-text-light dark:text-text-lightdark">
        Choose payment provider
      </div>
      <div className="grid grid-cols-1 gap-3">
        <Option id="bog" label="Bank of Georgia" logoSrc="/logos/bog.png" />
        <Option id="tbc" label="TBC Bank" logoSrc="/logos/tbc.png" />
      </div>
    </Card>
  );
}
