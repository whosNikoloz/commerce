"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    MapPin,
    CheckCircle2,
    Loader2,
    MoreHorizontal,
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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdd = () => {
        router.push(getLink("/profile/addresses/new"));
    };

    const handleEdit = (id: string) => {
        setOpenMenuId(null);
        router.push(getLink(`/profile/addresses/${id}`));
    };

    const handleDelete = async (id: string) => {
        if (!userId) return;
        setOpenMenuId(null);
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
        setOpenMenuId(null);
        try {
            await setDefaultAddress(id, userId);
            toast.success(dict?.profile?.addresses?.defaultSuccess || "Default address updated");
            loadAddresses(userId);
        } catch (error) {
            toast.error(dict?.profile?.addresses?.defaultError || "Failed to set default address");
        }
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">
                {dict?.profile?.addresses?.title || "My Addresses"}
            </h1>

            <div className="flex flex-col gap-4">
                {addresses.map((addr) => (
                    <div
                        key={addr.id}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl transition-all hover:shadow-md"
                    >
                        {/* Icon */}
                        <div className="relative flex-shrink-0">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center",
                                addr.isDefault
                                    ? "bg-brand-primary text-white"
                                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                            )}>
                                <MapPin className="h-5 w-5" />
                            </div>
                            {addr.isDefault && (
                                <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-500 fill-white" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold dark:text-white truncate">{addr.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                                {addr.street}{addr.street2 ? `, ${addr.street2}` : ""}, {addr.city}, {addr.country}
                            </p>
                        </div>

                        {/* Menu */}
                        <div className="relative flex-shrink-0" ref={openMenuId === addr.id ? menuRef : undefined}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                onClick={() => setOpenMenuId(openMenuId === addr.id ? null : addr.id)}
                            >
                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>

                            {openMenuId === addr.id && (
                                <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-zinc-900 border border-border dark:border-white/10 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150">
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        onClick={() => handleEdit(addr.id)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        {dict?.profile?.addresses?.edit || "Edit"}
                                    </button>
                                    {!addr.isDefault && (
                                        <button
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                            onClick={() => handleSetDefault(addr.id)}
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {dict?.profile?.addresses?.setPrimary || "Set as Default"}
                                        </button>
                                    )}
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                                        onClick={() => handleDelete(addr.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {dict?.profile?.addresses?.remove || "Delete"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Button
                onClick={handleAdd}
                className="rounded-2xl h-12 px-6 font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white transition-all"
            >
                <Plus className="h-4 w-4 mr-2" />
                {dict?.profile?.addresses?.addNew || "Add Address"}
            </Button>
        </div>
    );
}
