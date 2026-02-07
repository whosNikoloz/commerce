"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { defaultLocale } from "@/i18n.config";

export default function ProfilePage() {
    const { lang } = useParams();
    const router = useRouter();

    // On desktop, redirect to orders since the sidebar is always visible
    useEffect(() => {
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;
        if (isDesktop) {
            const prefix = lang === defaultLocale ? "" : `/${lang}`;
            router.replace(`${prefix}/profile/orders`);
        }
    }, [lang, router]);

    // On mobile, the layout shell shows the sidebar nav as the main content
    return null;
}
