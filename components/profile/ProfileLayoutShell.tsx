"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDictionary } from "@/app/context/dictionary-provider";
import { defaultLocale } from "@/i18n.config";

interface ProfileLayoutShellProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
    lang: string;
}

export default function ProfileLayoutShell({ sidebar, children, lang }: ProfileLayoutShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dict = useDictionary();

    const getLink = (path: string) => {
        if (lang === defaultLocale) return path;
        return `/${lang}${path}`;
    };

    // Check if we're on the profile root (not a sub-page)
    const isRoot = pathname === "/profile" || pathname === "/profile/"
        || pathname === `/${lang}/profile` || pathname === `/${lang}/profile/`;

    // Get the current sub-page name for the back button
    const getPageTitle = () => {
        if (pathname.includes("/orders")) return dict?.profile?.sidebar?.orders || "Orders";
        if (pathname.includes("/wishlist")) return dict?.profile?.sidebar?.wishlist || "Wishlist";
        if (pathname.includes("/addresses")) return dict?.profile?.sidebar?.addresses || "Addresses";
        if (pathname.includes("/account")) return dict?.profile?.sidebar?.account || "Account";
        return dict?.profile?.title || "Profile";
    };

    return (
        <>
            {/* Desktop layout - always show both */}
            <div className="hidden md:flex flex-row gap-8">
                <aside className="w-80 shrink-0">
                    <div className="sticky top-32 h-fit">
                        {sidebar}
                    </div>
                </aside>
                <main className="flex-1 min-h-screen pb-12 transition-colors duration-500">
                    {children}
                </main>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden">
                {isRoot ? (
                    /* On profile root: show sidebar as full content */
                    <div>{sidebar}</div>
                ) : (
                    /* On sub-page: show back button + content */
                    <div>
                        <button
                            onClick={() => router.push(getLink("/profile"))}
                            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground dark:hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {getPageTitle()}
                        </button>
                        <main className="pb-12">
                            {children}
                        </main>
                    </div>
                )}
            </div>
        </>
    );
}
