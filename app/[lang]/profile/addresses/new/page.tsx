"use client";

import React, { useEffect, useState } from "react";
import AddressForm from "@/components/profile/AddressForm";
import { addAddress } from "@/app/api/services/addressService";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useDictionary } from "@/app/context/dictionary-provider";

export default function NewAddressPage() {
    const params = useParams();
    const dict = useDictionary();
    const lang = params.lang as string;
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user?.id) {
                    setUserId(session.user.id);
                }
            } catch (error) {
                console.error("Failed to fetch session", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!userId) return null;

    return (
        <AddressForm
            userId={userId}
            onSave={addAddress}
            lang={lang}
            title={dict?.profile?.addressForm?.newTitle || "Add New Address"}
        />
    );
}
