"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export type CheckoutFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  sameAsShipping: boolean;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
};

export type Provider = "bog" | "tbc";

export default function CheckoutForm({
  onSubmit,
  value,
  onChange,
}: {
  onSubmit: (v: CheckoutFormValues) => Promise<void> | void;
  value?: Provider;
  onChange: (p: Provider) => void;
}) {
  const [sameAsShipping, setSameAsShipping] = useState(true);
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

  const [v, setV] = useState<CheckoutFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    sameAsShipping: true,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
  });

  const update = (k: keyof CheckoutFormValues) => (e: any) =>
    setV((s) => ({ ...s, [k]: e?.target?.value ?? e }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...v, sameAsShipping });
  };

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
    <form className="space-y-6" onSubmit={submit}>
      {/* Contact */}
      <Card className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-light dark:text-text-lightdark">
            <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-light dark:text-text-lightdark" htmlFor="firstName">
                First Name
              </Label>
              <Input
                required
                id="firstName"
                placeholder="John"
                value={v.firstName}
                onChange={update("firstName")}
              />
            </div>
            <div>
              <Label className="text-text-light dark:text-text-lightdark" htmlFor="lastName">
                Last Name
              </Label>
              <Input
                required
                id="lastName"
                placeholder="Doe"
                value={v.lastName}
                onChange={update("lastName")}
              />
            </div>
          </div>
          <div>
            <Label className="text-text-light dark:text-text-lightdark" htmlFor="email">
              Email
            </Label>
            <Input
              required
              id="email"
              placeholder="john@example.com"
              type="email"
              value={v.email}
              onChange={update("email")}
            />
          </div>
          <div>
            <Label className="text-text-light dark:text-text-lightdark" htmlFor="phone">
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="+995 5XX XX XX XX"
              type="tel"
              value={v.phone}
              onChange={update("phone")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-light dark:text-text-lightdark">
            <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-text-light dark:text-text-lightdark" htmlFor="address">
              Street Address
            </Label>
            <Input
              required
              id="address"
              placeholder="Tbilisi, Rustaveli Ave 1"
              value={v.address}
              onChange={update("address")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-text-light dark:text-text-lightdark" htmlFor="city">
                City
              </Label>
              <Input
                required
                id="city"
                placeholder="Tbilisi"
                value={v.city}
                onChange={update("city")}
              />
            </div>
            <div>
              <Label className="text-text-light dark:text-text-lightdark" htmlFor="state">
                State / Region
              </Label>
              <Select onValueChange={(val) => setV((s) => ({ ...s, state: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TBS">Tbilisi</SelectItem>
                  <SelectItem value="IMR">Imereti</SelectItem>
                  <SelectItem value="AJ">Adjara</SelectItem>
                  <SelectItem value="KA">Kakheti</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-text-light dark:text-text-lightdark" htmlFor="zip">
                ZIP / Postal Code
              </Label>
              <Input id="zip" placeholder="0108" value={v.zip} onChange={update("zip")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider */}
      <Card className="p-4 bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/50">
        <div className="mb-3 font-semibold text-text-light dark:text-text-lightdark">
          Choose payment provider
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Option id="bog" label="Bank of Georgia" logoSrc="/logos/bog.png" />
          <Option id="tbc" label="TBC Bank" logoSrc="/logos/tbc.png" />
        </div>
      </Card>

      {/* Billing */}
      <Card className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-light dark:text-text-lightdark">
            <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            Billing Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={sameAsShipping}
              id="sameAsShipping"
              onCheckedChange={(checked) => setSameAsShipping(checked === true)}
            />
            <Label className="text-text-light dark:text-text-lightdark" htmlFor="sameAsShipping">
              Same as shipping address
            </Label>
          </div>

          {!sameAsShipping && (
            <div className="space-y-4">
              <div>
                <Label
                  className="text-text-light dark:text-text-lightdark"
                  htmlFor="billingAddress"
                >
                  Street Address
                </Label>
                <Input
                  id="billingAddress"
                  placeholder="Billing street"
                  value={v.billingAddress}
                  onChange={update("billingAddress")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-text-light dark:text-text-lightdark" htmlFor="billingCity">
                    City
                  </Label>
                  <Input
                    id="billingCity"
                    placeholder="City"
                    value={v.billingCity}
                    onChange={update("billingCity")}
                  />
                </div>
                <div>
                  <Label
                    className="text-text-light dark:text-text-lightdark"
                    htmlFor="billingState"
                  >
                    State
                  </Label>
                  <Input
                    id="billingState"
                    placeholder="State"
                    value={v.billingState}
                    onChange={update("billingState")}
                  />
                </div>
                <div>
                  <Label className="text-text-light dark:text-text-lightdark" htmlFor="billingZip">
                    ZIP
                  </Label>
                  <Input
                    id="billingZip"
                    placeholder="ZIP"
                    value={v.billingZip}
                    onChange={update("billingZip")}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          className="px-6 bg-brand-primary hover:bg-brand-primary/90 text-white"
          type="submit"
        >
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
