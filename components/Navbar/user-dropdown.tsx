"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Package,
    Heart,
    CreditCard,
    MapPin,
    Bell,
    Settings,
    LogOut,
    MessageCircle
} from "lucide-react";
import { getMyOrders, getWishlist } from "@/app/api/services/orderService";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProfileIcon } from "../icons";
import { useUser } from "@/app/context/userContext";
import { useDictionary } from "@/app/context/dictionary-provider";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
    lang: string;
}

export default function UserDropdown({ lang }: UserDropdownProps) {
    const { user, logout } = useUser();
    const dictionary = useDictionary();
    const router = useRouter();
    const [counts, setCounts] = React.useState({ orders: 0, wishlist: 0 });

    React.useEffect(() => {
        if (!user) return;

        const fetchCounts = async () => {
            try {
                // Fetch basic counts
                const [ordersRes, wishlistRes] = await Promise.all([
                    getMyOrders(1, 1),
                    getWishlist()
                ]);

                setCounts({
                    orders: ordersRes.total || 0,
                    wishlist: wishlistRes.length || 0
                });
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch counts:", err);
            }
        };

        fetchCounts();
    }, [user]);

    if (!user) return null;

    const navItems = [
        {
            label: dictionary.profile.sidebar.orders,
            href: `/${lang}/profile/orders`,
            icon: Package,
            badge: counts.orders,
        },
        {
            label: dictionary.profile.sidebar.wishlist,
            href: `/${lang}/profile/wishlist`,
            icon: Heart,
            badge: counts.wishlist > 0 ? counts.wishlist : undefined,
        },
        {
            label: dictionary.profile.sidebar.addresses,
            href: `/${lang}/profile/addresses`,
            icon: MapPin,
        },
        {
            label: dictionary.profile.sidebar.settings,
            href: `/${lang}/profile/account`,
            icon: Settings,
        },
    ];

    const handleLogout = async () => {
        await logout();
        router.push(`/${lang}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    aria-label="Open profile menu"
                    className="flex flex-col items-center bg-transparent cursor-pointer outline-none group"
                    role="button"
                    tabIndex={0}
                >
                    <ProfileIcon className="transition-transform duration-300 group-hover:scale-110" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[360px] p-5 rounded-[2rem] overflow-hidden border border-brand-primary/10 dark:border-brand-primarydark/10 shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] bg-brand-surface/95 dark:bg-brand-surfacedark/95 backdrop-blur-2xl"
                sideOffset={12}
            >
                {/* Header: Welcome */}
                <div className="mb-6 px-1">
                    <h2 className="text-[1.35rem] leading-tight font-bold tracking-tight text-text-light dark:text-text-lightdark">
                        {dictionary.profile.welcome}, {user.userName || user.email.split('@')[0]}
                    </h2>
                </div>

                <DropdownMenuSeparator className="bg-brand-primary/10 dark:bg-brand-primarydark/10 mb-6 h-px" />

                {/* Grid: Quick Access */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {navItems.map((item) => (
                        <DropdownMenuItem
                            key={item.href}
                            asChild
                            className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent cursor-pointer group/item"
                        >
                            <Link
                                className="flex items-center justify-between gap-2 p-3 rounded-2xl transition-all duration-300 hover:bg-brand-primary/5 dark:hover:bg-brand-primarydark/5 border border-transparent hover:border-brand-primary/10"
                                href={item.href}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="flex items-center justify-center h-8 w-8 flex-shrink-0 rounded-lg bg-brand-primary/5 text-text-light dark:text-text-lightdark transition-transform duration-300 group-hover/item:scale-110 group-hover/item:bg-brand-primary group-hover/item:text-white">
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[0.85rem] font-semibold text-text-light/90 dark:text-text-lightdark/90 transition-colors duration-300 group-hover/item:text-brand-primary dark:group-hover/item:text-brand-primarydark truncate">
                                        {item.label}
                                    </span>
                                </div>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1 bg-brand-primary text-white dark:bg-brand-primarydark text-[10px] font-bold rounded-full shadow-sm flex-shrink-0">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>

                <DropdownMenuSeparator className="bg-brand-primary/10 dark:bg-brand-primarydark/10 mb-4 h-px" />

                {/* Footer: Logout */}
                <DropdownMenuItem
                    className="p-1 bg-transparent hover:bg-transparent focus:bg-transparent cursor-pointer group/logout w-full"
                    onSelect={handleLogout}
                >
                    <div className="flex items-center gap-4 transition-all duration-300 w-full p-4 rounded-xl hover:bg-destructive/5 border border-transparent hover:border-destructive/10">
                        <LogOut className="h-6 w-6 text-text-light dark:text-text-lightdark transition-transform duration-300 group-hover/logout:-translate-x-1" />
                        <span className="text-[1rem] font-semibold text-text-light dark:text-text-lightdark transition-colors duration-200 group-hover/logout:text-destructive">
                            {dictionary.profile.sidebar.logout}
                        </span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
