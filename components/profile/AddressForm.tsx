"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Save,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Address, AddressInput } from "@/types/addressTypes";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

import { useDictionary } from "@/app/context/dictionary-provider";

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
                router.push(`/${lang}/cart/checkout`);
            } else {
                router.push(`/${lang}/profile/addresses`);
            }
            router.refresh();
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
        <form onSubmit={handleSave} className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-2xl h-12 w-12 sm:h-14 sm:w-14 border-border dark:border-white/10 bg-white/40 backdrop-blur-md shadow-lg shadow-black/5 hover:bg-brand-primary hover:text-white transition-all duration-500"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black dark:text-white tracking-tighter uppercase">{title}</h1>
                        <p className="text-muted-foreground text-sm mt-1 font-bold italic">
                            {dict?.profile?.addressForm?.subtitle || "Complete your shipping details for faster checkout"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px]"
                        onClick={() => router.back()}
                    >
                        {dict?.profile?.addressForm?.cancel || "Cancel"}
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {initialData ? (dict?.profile?.addressForm?.update || "Update Address") : (dict?.profile?.addressForm?.save || "Save Address")}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Map Picker Card */}
                <div className="space-y-6">
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-black/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-black dark:text-white tracking-tight uppercase">
                                {dict?.profile?.addressForm?.locateOnMap || "Locate on Map"}
                            </h3>
                        </div>
                        <AddressMapPicker
                            onLocationSelect={handleLocationSelect}
                            height="500px"
                            className="border-none"
                        />
                        <p className="text-[10px] text-muted-foreground font-bold italic px-2">
                            {dict?.profile?.addressForm?.mapTip || "Tip: Click on the map to automatically pin and suggest address fields below."}
                        </p>
                    </div>
                </div>

                {/* Form Fields Card */}
                <div className="space-y-6">
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-black/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-black dark:text-white tracking-tight uppercase">
                                {dict?.profile?.addressForm?.detailsTitle || "Address Details"}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.addressForm?.label || "Label (e.g. Home, Office)"}
                                </Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                    placeholder="Home"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.account?.phone || "Phone Number"}
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                    placeholder="+995 5xx xxx xxx"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.addressForm?.firstName || "First Name"}
                                </Label>
                                <Input
                                    id="firstName"
                                    value={form.firstName}
                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.addressForm?.lastName || "Last Name"}
                                </Label>
                                <Input
                                    id="lastName"
                                    value={form.lastName}
                                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-3">
                                <Label htmlFor="street" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.addressForm?.street || "Street Address"}
                                </Label>
                                <Input
                                    id="street"
                                    value={form.street}
                                    onChange={e => setForm({ ...form, street: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.addressForm?.city || "City"}
                                </Label>
                                <Input
                                    id="city"
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="country" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1 ml-1">
                                    {dict?.profile?.addressForm?.country || "Country"}
                                </Label>
                                <Input
                                    id="country"
                                    value={form.country}
                                    onChange={e => setForm({ ...form, country: e.target.value })}
                                    className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none font-bold text-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50 dark:border-white/10 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
                                className={cn(
                                    "h-6 w-6 rounded-md flex items-center justify-center border-2 transition-all",
                                    form.isDefault ? "bg-brand-primary border-brand-primary text-white" : "border-border dark:border-white/20"
                                )}
                            >
                                {form.isDefault && <CheckCircle2 className="h-4 w-4" />}
                            </button>
                            <button
                                type="button"
                                className="text-xs font-black uppercase tracking-widest text-muted-foreground cursor-pointer select-none bg-transparent border-none p-0 hover:text-brand-primary transition-colors"
                                onClick={() => setForm({ ...form, isDefault: !form.isDefault })}
                            >
                                {dict?.profile?.addressForm?.setDefault || "Set as default address"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
