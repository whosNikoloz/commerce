"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, MapPin, CheckCircle2, Home, Briefcase, Map as MapIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUserAddresses } from "@/app/api/services/addressService";
import { Address } from "@/types/addressTypes";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
        if (lower.includes("home")) return <Home className="h-4 w-4" />;
        if (lower.includes("work") || lower.includes("office")) return <Briefcase className="h-4 w-4" />;
        return <MapIcon className="h-4 w-4" />;
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {dictionary.checkout?.addressStep?.loading || "Loading your addresses..."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black dark:text-white tracking-tight uppercase">
                    {dictionary.checkout?.addressStep?.selectAction || "Select Shipping Address"}
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddNew}
                    className="rounded-xl border-dashed border-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest px-4"
                >
                    <Plus className="h-3 w-3 mr-2" /> {dictionary.checkout?.addressStep?.addNew || "Add New"}
                </Button>
            </div>

            <div className="grid gap-4">
                {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                        <Card
                            key={addr.id}
                            onClick={() => onSelect(addr)}
                            className={cn(
                                "p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group border-2",
                                isSelected
                                    ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/5 ring-1 ring-brand-primary/20"
                                    : "border-slate-100 dark:border-white/5 bg-transparent hover:border-brand-primary/30"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    isSelected ? "bg-brand-primary text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                                )}>
                                    <AddressIcon title={addr.title} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black uppercase tracking-tight dark:text-white">{addr.title}</p>
                                        {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-primary" />}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed truncate max-w-[280px]">
                                        {addr.street}, {addr.city}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {addr.firstName} {addr.lastName} • {addr.phoneNumber}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {addresses.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl space-y-4">
                        <MapPin className="h-8 w-8 text-slate-200 dark:text-white/10 mx-auto" />
                        <div className="space-y-1">
                            <p className="text-sm font-black dark:text-white uppercase tracking-tight">
                                {dictionary.checkout?.addressStep?.empty || "No addresses found"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {dictionary.checkout?.addressStep?.emptyDesc || "Add an address to continue with your checkout"}
                            </p>
                        </div>
                        <Button onClick={onAddNew} className="bg-brand-primary rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                            {dictionary.checkout?.addressStep?.addAddress || "Add Address"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
