"use client";

import React, { useEffect, useState } from "react";
import {
    Heart,
    Trash2,
    ShoppingCart,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    getWishlist,
    removeFromWishlist
} from "@/app/api/services/orderService";
import { WishlistItem } from "@/types/orderTypes";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem } from "@/app/context/cartContext";
import { resolveImageUrl } from "@/lib/utils";
import { useDictionary } from "@/app/context/dictionary-provider";
import { defaultLocale } from "@/i18n.config";

export default function WishlistPage() {
    const { lang } = useParams();
    const dict = useDictionary();
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const addToCart = useCartStore((s) => s.smartAddToCart);

    const getLink = (path: string) => {
        if (lang === defaultLocale) {
            return path;
        }

        return `/${lang}${path}`;
    };

    const fmtMoney = (n: number) => new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "GEL"
    }).format(n ?? 0).replace("GEL", "₾");

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                const data = await getWishlist();

                setWishlist(data);
            } catch (err) {
                console.error("Failed to fetch wishlist", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const handleRemove = async (id: string) => {
        try {
            await removeFromWishlist(id);
            setWishlist(prev => prev.filter(item => item.id !== id));
            toast.success(dict?.wishlist?.removed || "Item removed from wishlist");
        } catch (err) {
            toast.error(dict?.wishlist?.removeError || "Failed to remove item");
        }
    };

    const handleAddToCart = async (item: WishlistItem) => {
        try {
            const cartItem: CartItem = {
                id: item.id,
                name: item.name,
                price: item.price,
                image: resolveImageUrl(item.image),
                quantity: 1,
                discount: 0,
            };

            await addToCart(cartItem);
            //toast.success(dict?.wishlist?.addSuccess || "Added to cart");
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error(dict?.wishlist?.addError || "Failed to add to cart");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase">
                    {dict?.wishlist?.title || "My Wishlist"}
                </h1>
                <p className="text-muted-foreground text-sm font-medium italic">
                    {dict?.wishlist?.subtitle || "Items you've saved for later"}
                </p>
            </div>

            {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-border dark:border-white/10">
                    <div className="h-14 w-14 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 animate-pulse">
                        <Heart className="h-7 w-7 fill-current" />
                    </div>
                    <h3 className="text-base font-bold dark:text-white tracking-tight">
                        {dict?.wishlist?.empty || "Your wishlist is empty"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-2">
                        {dict?.wishlist?.emptyDesc || "Save products you like to find them easily later and track price changes."}
                    </p>
                    <Button asChild className="mt-6 rounded-xl h-10 px-6 text-sm font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white">
                        <Link href={getLink("/all-products")}>
                            {dict?.wishlist?.browse || "Browse Products"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {wishlist.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 flex flex-col h-full transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-zinc-100 dark:bg-zinc-900/60">
                                <Link href={getLink(`/product/${item.id}`)}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        alt={item.name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        src={item.image || "/placeholder.png"}
                                    />
                                </Link>
                                <button
                                    className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title={dict?.wishlist?.remove || "Remove from wishlist"}
                                    onClick={() => handleRemove(item.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-2.5 flex flex-col flex-1">
                                <span className="text-sm sm:text-base font-extrabold text-brand-primary">
                                    {fmtMoney(item.price)}
                                </span>
                                <h3 className="text-xs sm:text-[13px] font-semibold leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2 mt-1 min-h-[2rem]">
                                    {item.name}
                                </h3>

                                <div className="mt-auto pt-2">
                                    <Button
                                        className="w-full h-9 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center gap-1.5"
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">{dict?.common?.addToCart || "Add to Cart"}</span>
                                        <span className="sm:hidden">{dict?.common?.addToCartShort || "Add"}</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
