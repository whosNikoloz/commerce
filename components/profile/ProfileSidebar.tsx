"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ShoppingCart,
    User as UserIcon
} from "lucide-react";

import { useUser } from "@/app/context/userContext";
import { cn } from "@/lib/utils";
import { defaultLocale } from "@/i18n.config";

interface ProfileSidebarProps {
    dict: any;
    lang: string;
}

export default function ProfileSidebar({ dict, lang }: ProfileSidebarProps) {
    const { user, logout } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    const getLink = (path: string) => {
        if (lang === defaultLocale) {
            return path;
        }

        return `/${lang}${path}`;
    };

    const navItems = [
        {
            label: dict.profile.sidebar.orders,
            href: getLink("/profile/orders"),
            icon: Package,
        },
        {
            label: dict.profile.sidebar.wishlist,
            href: getLink("/profile/wishlist"),
            icon: Heart,
        },
        {
            label: dict.profile.sidebar.cart || "კალათის ნახვა",
            href: getLink("/cart"),
            icon: ShoppingCart,
        },
        {
            label: dict.profile.sidebar.addresses,
            href: getLink("/profile/addresses"),
            icon: MapPin,
        },
        {
            label: dict.profile.sidebar.account,
            href: getLink("/profile/account"),
            icon: Settings,
        },
    ];

    return (
        <div className="flex flex-col gap-1">
            {/* Profile Header */}
            <div className="flex items-center gap-3 px-3 py-4 mb-2">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-xs text-muted-foreground">
                        {dict.profile.welcome}
                    </span>
                    <span className="text-sm font-bold truncate dark:text-white">
                        {user?.userName || "User"}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href) && item.href.includes("/profile");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                                isActive
                                    ? "text-brand-primary font-semibold bg-brand-primary/10"
                                    : "text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/5"
                            )}
                            href={item.href}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="h-px bg-border dark:bg-white/10 my-2 mx-3" />

            {/* Logout */}
            <button
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors w-full text-left"
                onClick={async () => {
                    await logout();
                    router.push(`/${lang}`);
                }}
            >
                <LogOut className="h-5 w-5" />
                <span>{dict.profile.sidebar.logout}</span>
            </button>
        </div>
    );
}
