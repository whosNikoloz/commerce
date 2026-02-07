"use client";

import React, { useState } from "react";
import {
    Plus,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Save,
    MapPin
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address, AddressInput } from "@/types/addressTypes";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/app/context/dictionary-provider";
import { defaultLocale } from "@/i18n.config";

// Dynamically import MapPicker
const AddressMapPicker = dynamic(() => import("@/components/profile/AddressMapPicker"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-2xl border border-border/50" />
});

interface AddressFormProps {
    initialData?: Address | null;
    userId: string;
    onSave: (userId: string, data: any) => Promise<any>;
    lang: string;
    title: string;
}

export default function AddressForm({ initialData, userId, onSave, lang, title }: AddressFormProps) {
    const router = useRouter();
    const dict = useDictionary();
    const searchParams = useSearchParams();
    const redirectParam = searchParams.get("redirect");
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState<AddressInput>({
        title: initialData?.title || "",
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        street: initialData?.street || "",
        street2: initialData?.street2 || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
        zipCode: initialData?.zipCode || "",
        country: initialData?.country || "Georgia",
        phoneNumber: initialData?.phoneNumber || "",
        isDefault: initialData?.isDefault || false
    });

    const getLink = (path: string) => {
        if (lang === defaultLocale) {
            return path;
        }

        return `/${lang}${path}`;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        // Basic Validation
        if (!form.title || !form.firstName || !form.lastName || !form.street || !form.city || !form.phoneNumber) {
            toast.error(dict?.profile?.addressForm?.validationError || "Please fill in all required fields");

            return;
        }

        try {
            setSubmitting(true);
            const dataToSave = initialData ? { ...form, id: initialData.id } : form;

            await onSave(userId, dataToSave);
            toast.success(initialData ? (dict?.profile?.addressForm?.updateSuccess || "Address updated") : (dict?.profile?.addressForm?.addSuccess || "Address added"));
            if (redirectParam === "checkout") {
                router.push(getLink("/cart/checkout"));
            } else {
                router.push(getLink("/profile/addresses"));
            }
        } catch (error) {
            toast.error(dict?.profile?.addressForm?.saveError || "Failed to save address");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLocationSelect = (loc: { lat: number, lng: number }, address?: string, metadata?: any) => {
        if (metadata) {
            // Intelligent parsing of Nominatim metadata
            setForm(prev => ({
                ...prev,
                street: metadata.road || metadata.pedestrian || metadata.suburb || prev.street,
                city: metadata.city || metadata.town || metadata.village || metadata.municipality || prev.city,
                state: metadata.state || prev.state,
                zipCode: metadata.postcode || prev.zipCode,
                country: metadata.country || prev.country
            }));
            toast.success(dict?.profile?.addressForm?.mapSuccess || "Address fields populated from map", { duration: 2000 });
        } else if (address) {
            const parts = address.split(",").map(p => p.trim());

            setForm(prev => ({
                ...prev,
                street: parts[0] || prev.street,
                city: parts[1] || prev.city,
                country: parts[parts.length - 1] || prev.country
            }));
        }
    };

    return (
        <form className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-700 pb-10" onSubmit={handleSave}>
            {/* Header Area */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        className="rounded-xl h-9 w-9 border-border dark:border-white/10 hover:bg-brand-primary hover:text-white transition-all"
                        size="icon"
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-black dark:text-white tracking-tight">{title}</h1>
                </div>

                <div className="flex gap-2">
                    <Button
                        className="rounded-xl h-9 px-4 text-xs font-bold"
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        {dict?.profile?.addressForm?.cancel || "Cancel"}
                    </Button>
                    <Button
                        className="rounded-xl h-9 px-5 text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/90"
                        disabled={submitting}
                        type="submit"
                    >
                        {submitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                        {initialData ? (dict?.profile?.addressForm?.update || "Update") : (dict?.profile?.addressForm?.save || "Save")}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                {/* Map Picker Card */}
                <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-primary" />
                        <h3 className="text-sm font-bold dark:text-white">
                            {dict?.profile?.addressForm?.locateOnMap || "Locate on Map"}
                        </h3>
                    </div>
                    <AddressMapPicker
                        className="border-none"
                        height="300px"
                        onLocationSelect={handleLocationSelect}
                    />
                    <p className="text-xs text-muted-foreground italic">
                        {dict?.profile?.addressForm?.mapTip || "Click on the map to auto-fill address fields."}
                    </p>
                </div>

                {/* Form Fields Card */}
                <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-brand-primary" />
                        <h3 className="text-sm font-bold dark:text-white">
                            {dict?.profile?.addressForm?.detailsTitle || "Address Details"}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="title">
                                {dict?.profile?.addressForm?.label || "Label (e.g. Home, Office)"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="title"
                                placeholder="Home"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="phoneNumber">
                                {dict?.profile?.account?.phone || "Phone Number"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="phoneNumber"
                                placeholder="+995 5xx xxx xxx"
                                value={form.phoneNumber}
                                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="firstName">
                                {dict?.profile?.addressForm?.firstName || "First Name"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="firstName"
                                value={form.firstName}
                                onChange={e => setForm({ ...form, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="lastName">
                                {dict?.profile?.addressForm?.lastName || "Last Name"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="lastName"
                                value={form.lastName}
                                onChange={e => setForm({ ...form, lastName: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="street">
                                {dict?.profile?.addressForm?.street || "Street Address"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="street"
                                value={form.street}
                                onChange={e => setForm({ ...form, street: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="city">
                                {dict?.profile?.addressForm?.city || "City"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="city"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground ml-0.5" htmlFor="country">
                                {dict?.profile?.addressForm?.country || "Country"}
                            </Label>
                            <Input
                                className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                id="country"
                                value={form.country}
                                onChange={e => setForm({ ...form, country: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 dark:border-white/10 flex items-center gap-3">
                        <button
                            className={cn(
                                "h-5 w-5 rounded flex items-center justify-center border-2 transition-all",
                                form.isDefault ? "bg-brand-primary border-brand-primary text-white" : "border-border dark:border-white/20"
                            )}
                            type="button"
                            onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
                        >
                            {form.isDefault && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <button
                            className="text-xs font-semibold text-muted-foreground cursor-pointer select-none bg-transparent border-none p-0 hover:text-brand-primary transition-colors"
                            type="button"
                            onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
                        >
                            {dict?.profile?.addressForm?.setDefault || "Set as default address"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
