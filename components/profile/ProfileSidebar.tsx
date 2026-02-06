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
    User as UserIcon
} from "lucide-react";
import { useUser } from "@/app/context/userContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col gap-6 p-8 backdrop-blur-xl bg-brand-surface/80 dark:bg-brand-surfacedark/80 border border-border dark:border-white/10 rounded-[2.5rem] shadow-xl shadow-black/5 animate-in slide-in-from-left-4 duration-700">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-brand-primary/20 shadow-lg ring-4 ring-brand-primary/10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-brand-primary/10 text-brand-primary">
                        <UserIcon className="h-8 w-8" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                        {dict.profile.welcome}
                    </span>
                    <span className="text-xl font-black truncate dark:text-white tracking-tight">
                        {user?.userName || "User"}
                    </span>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10" />

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transform scale-102"
                                    : "text-text-subtle dark:text-text-subtledark hover:bg-brand-primary/5 hover:text-brand-primary dark:hover:bg-brand-primary/10 transition-all duration-300"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 transition-transform duration-300 group-hover:scale-110 z-10",
                                isActive ? "text-white" : "text-muted-foreground group-hover:text-brand-primary"
                            )} />
                            <span className="z-10 tracking-tight">{item.label}</span>
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10" />

            {/* Logout */}
            <Button
                variant="ghost"
                className="flex items-center justify-start gap-4 px-5 py-4 h-auto rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group border border-transparent hover:border-destructive/20"
                onClick={async () => {
                    await logout();
                    router.push(`/${lang}`);
                }}
            >
                <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-x-1" />
                <span className="font-bold tracking-tight">{dict.profile.sidebar.logout}</span>
            </Button>
        </div>
    );
}
