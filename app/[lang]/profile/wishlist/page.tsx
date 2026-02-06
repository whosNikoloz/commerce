"use client";

import React, { useEffect, useState } from "react";
import {
    Heart,
    Trash2,
    ShoppingCart,
    ShoppingBag,
    ArrowRight
} from "lucide-react";
import {
    getWishlist,
    removeFromWishlist
} from "@/app/api/services/orderService";
import { WishlistItem } from "@/types/orderTypes";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem } from "@/app/context/cartContext";
import { resolveImageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
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
                <div className="flex flex-col items-center justify-center py-24 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-dashed border-border dark:border-white/10">
                    <div className="h-20 w-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 animate-pulse">
                        <Heart className="h-10 w-10 fill-current" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white tracking-tight">
                        {dict?.wishlist?.empty || "Your wishlist is empty"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-2 font-medium">
                        {dict?.wishlist?.emptyDesc || "Save products you like to find them easily later and track price changes."}
                    </p>
                    <Button className="mt-8 rounded-2xl h-12 px-8 font-bold tracking-tight shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white" asChild>
                        <Link href={getLink("/all-products")}>
                            {dict?.wishlist?.browse || "Browse Products"} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white/40 dark:bg-white/5 backdrop-blur-md border border-border dark:border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-primary/50 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-500 flex flex-col"
                        >
                            <div className="relative aspect-square overflow-hidden bg-brand-surface dark:bg-white/5 border-b border-border dark:border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    alt={item.name}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    src={item.image || "/placeholder.png"}
                                />
                                <button
                                    title={dict?.wishlist?.remove || "Remove from wishlist"}
                                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex-1">
                                    <h3 className="font-black text-lg dark:text-white line-clamp-2 tracking-tight group-hover:text-brand-primary transition-colors">{item.name}</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">
                                        {item.price === 0 ? (dict?.wishlist?.free || "Free") : (dict?.wishlist?.premium || "Premium Product")}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-2xl font-black text-brand-primary tracking-tighter">{fmtMoney(item.price)}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            className="h-12 w-12 rounded-2xl shadow-lg shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                        </Button>
                                        <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border dark:border-white/10">
                                            <Link href={getLink(`/product/${item.id}`)}>
                                                <ShoppingBag className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
