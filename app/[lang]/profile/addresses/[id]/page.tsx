"use client";

import React, { useEffect, useState } from "react";
import AddressForm from "@/components/profile/AddressForm";
import { updateAddress, getAddressById } from "@/app/api/services/addressService";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Address } from "@/types/addressTypes";
import { toast } from "sonner";

import { useDictionary } from "@/app/context/dictionary-provider";

export default function EditAddressPage() {
    const params = useParams();
    const dict = useDictionary();
    const lang = params.lang as string;
    const id = params.id as string;
    const [userId, setUserId] = useState<string | null>(null);
    const [address, setAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();
                if (session?.user?.id) {
                    setUserId(session.user.id);
                    const addr = await getAddressById(id, session.user.id);
                    setAddress(addr);
                }
            } catch (error) {
                console.error("Failed to fetch address", error);
                toast.error(dict?.profile?.addressForm?.loadError || "Failed to load address data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!userId || !address) return null;

    return (
        <AddressForm
            userId={userId}
            initialData={address}
            onSave={updateAddress}
            lang={lang}
            title={dict?.profile?.addressForm?.editTitle || "Edit Address"}
        />
    );
}
