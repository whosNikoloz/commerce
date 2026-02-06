"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    Home,
    Briefcase,
    Map as MapIcon,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    getUserAddresses,
    deleteAddress,
    setDefaultAddress
} from "@/app/api/services/addressService";
import { Address } from "@/types/addressTypes";
import { useRouter, useParams } from "next/navigation";
import { useDictionary } from "@/app/context/dictionary-provider";

import { defaultLocale } from "@/i18n.config";

export default function AddressesPage() {
    const router = useRouter();
    const params = useParams();
    const dict = useDictionary();
    const lang = params.lang as string;
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const getLink = (path: string) => {
        if (lang === defaultLocale) {
            return path;
        }
        return `/${lang}${path}`;
    };

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/session");
            const session = await res.json();
            if (session?.user?.id) {
                setUserId(session.user.id);
                loadAddresses(session.user.id);
            }
        } catch (error) {
            console.error("Failed to fetch session", error);
            setLoading(false);
        }
    }, []);

    const loadAddresses = async (uid: string) => {
        try {
            setLoading(true);
            const data = await getUserAddresses(uid);
            setAddresses(data);
        } catch (error) {
            toast.error(dict?.profile?.addresses?.loadError || "Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const handleAdd = () => {
        router.push(getLink("/profile/addresses/new"));
    };

    const handleEdit = (id: string) => {
        router.push(getLink(`/profile/addresses/${id}`));
    };

    const handleDelete = async (id: string) => {
        if (!userId) return;
        try {
            await deleteAddress(id, userId);
            toast.success(dict?.profile?.addresses?.removeSuccess || "Address removed");
            loadAddresses(userId);
        } catch (error) {
            toast.error(dict?.profile?.addresses?.removeError || "Failed to delete address");
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!userId) return;
        try {
            await setDefaultAddress(id, userId);
            toast.success(dict?.profile?.addresses?.defaultSuccess || "Default address updated");
            loadAddresses(userId);
        } catch (error) {
            toast.error(dict?.profile?.addresses?.defaultError || "Failed to set default address");
        }
    };

    const AddressIcon = ({ title }: { title: string }) => {
        const lower = title.toLowerCase();
        if (lower.includes("home")) return <Home className="h-5 w-5" />;
        if (lower.includes("work") || lower.includes("office")) return <Briefcase className="h-5 w-5" />;
        return <MapIcon className="h-5 w-5" />;
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase">
                        {dict?.profile?.addresses?.title || "My Addresses"}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium italic">
                        {dict?.profile?.addresses?.subtitle || "Manage your delivery locations"}
                    </p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-5 w-5 mr-2" /> {dict?.profile?.addresses?.addNew || "Add New Address"}
                </Button>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                {addresses.map((addr) => (
                    <div
                        key={addr.id}
                        className={cn(
                            "group p-8 bg-white/40 dark:bg-white/5 backdrop-blur-md border-2 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[300px]",
                            addr.isDefault
                                ? "border-brand-primary shadow-2xl shadow-brand-primary/10"
                                : "border-transparent hover:border-brand-primary/30 hover:shadow-xl shadow-black/5"
                        )}
                    >
                        {addr.isDefault && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-6 rounded-bl-[1.5rem] shadow-lg">
                                    {dict?.profile?.addresses?.default || "Default"}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-start justify-between mb-8">
                                <div className={cn(
                                    "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-lg",
                                    addr.isDefault ? "bg-brand-primary text-white" : "bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white"
                                )}>
                                    <AddressIcon title={addr.title} />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
                                        onClick={() => handleEdit(addr.id)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                                        onClick={() => handleDelete(addr.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black dark:text-white tracking-tight">{addr.title}</h3>
                                <p className="text-sm text-muted-foreground font-bold leading-relaxed">
                                    {addr.firstName} {addr.lastName}<br />
                                    {addr.street}{addr.street2 ? `, ${addr.street2}` : ""}<br />
                                    {addr.city}, {addr.country}
                                </p>
                                <p className="text-xs text-muted-foreground/60 font-bold">{addr.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 dark:border-white/5">
                            {!addr.isDefault ? (
                                <Button
                                    variant="ghost"
                                    className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] hover:bg-brand-primary/10 hover:text-brand-primary transition-all flex items-center justify-center gap-2"
                                    onClick={() => handleSetDefault(addr.id)}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {dict?.profile?.addresses?.setPrimary || "Set as Primary Address"}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary/60 px-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {dict?.profile?.addresses?.primaryLocation || "Primary Delivery Location"}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAdd}
                    className="p-8 border-2 border-dashed border-border dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group min-h-[300px]"
                >
                    <div className="h-20 w-20 rounded-[2rem] bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-brand-primary/20">
                        <Plus className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-muted-foreground group-hover:text-brand-primary uppercase tracking-[0.2em] transition-colors">
                            {dict?.profile?.addresses?.addNew || "Add New Address"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 font-bold mt-1">
                            {dict?.profile?.addresses?.addNewDesc || "Set up a new shipping or billing location"}
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}
