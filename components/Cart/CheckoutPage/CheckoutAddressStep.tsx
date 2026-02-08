"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, MapPin, CheckCircle2, Home, Briefcase, Map as MapIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserAddresses } from "@/app/api/services/addressService";
import { Address } from "@/types/addressTypes";
import { toast } from "sonner";
import { useDictionary } from "@/app/context/dictionary-provider";

interface CheckoutAddressStepProps {
    userId: string;
    selectedAddressId: string | null;
    onSelect: (address: Address) => void;
    onAddNew: () => void;
}

export default function CheckoutAddressStep({ userId, selectedAddressId, onSelect, onAddNew }: CheckoutAddressStepProps) {
    const dictionary = useDictionary();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUserAddresses(userId);
            setAddresses(data);

            // Auto-select default if none selected
            if (!selectedAddressId && data.length > 0) {
                const def = data.find(a => a.isDefault) || data[0];
                onSelect(def);
            }
        } catch (error) {
            toast.error(dictionary.profile?.addresses?.loadError || "Failed to load addresses");
        } finally {
            setLoading(false);
        }
    }, [userId, selectedAddressId, onSelect]);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    const AddressIcon = ({ title }: { title: string }) => {
        const lower = title.toLowerCase();
        if (lower.includes("home")) return <Home className="h-4 w-4 sm:h-5 sm:w-5" />;
        if (lower.includes("work") || lower.includes("office")) return <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />;
        return <MapIcon className="h-4 w-4 sm:h-5 sm:w-5" />;
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-brand-primary animate-spin" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {dictionary.checkout?.addressStep?.loading || "Loading your addresses..."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-white/10">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black dark:text-white tracking-tight uppercase">
                        {dictionary.checkout?.addressStep?.selectAction || "Select Shipping Address"}
                    </h3>
                </div>
                <button
                    onClick={onAddNew}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-dashed border-brand-primary/40 text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {dictionary.checkout?.addressStep?.addNew || "Add New"}
                </button>
            </div>

            <div className="grid gap-3 sm:gap-4">
                {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                        <button
                            key={addr.id}
                            onClick={() => onSelect(addr)}
                            className={cn(
                                "relative w-full text-left p-4 sm:p-5 cursor-pointer transition-all duration-300 overflow-hidden group border-2 rounded-2xl sm:rounded-3xl",
                                isSelected
                                    ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/5"
                                    : "border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/80 hover:border-brand-primary/30"
                            )}
                        >
                            {/* Active accent */}
                            {isSelected && (
                                <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-brand-primary rounded-l-2xl sm:rounded-l-3xl" />
                            )}

                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className={cn(
                                    "h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ring-1",
                                    isSelected
                                        ? "bg-brand-primary text-white ring-brand-primary/20"
                                        : "bg-gray-100 dark:bg-white/5 text-gray-400 ring-gray-200/50 dark:ring-white/10 group-hover:bg-brand-primary/10 group-hover:text-brand-primary group-hover:ring-brand-primary/15"
                                )}>
                                    <AddressIcon title={addr.title} />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold dark:text-white tracking-tight">{addr.title}</p>
                                        {isSelected && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-brand-primary flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                                        {addr.street}, {addr.city}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/70 font-medium">
                                        {addr.firstName} {addr.lastName} {addr.phoneNumber && `• ${addr.phoneNumber}`}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {addresses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 sm:py-14 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl">
                        <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <MapPin className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm font-bold dark:text-white tracking-tight">
                            {dictionary.checkout?.addressStep?.empty || "No addresses found"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1 max-w-xs text-center">
                            {dictionary.checkout?.addressStep?.emptyDesc || "Add an address to continue with your checkout"}
                        </p>
                        <button
                            onClick={onAddNew}
                            className="mt-5 h-10 sm:h-11 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all active:scale-[0.98]"
                        >
                            {dictionary.checkout?.addressStep?.addAddress || "Add Address"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
