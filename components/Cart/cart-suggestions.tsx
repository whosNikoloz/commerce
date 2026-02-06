"use client";

import { useEffect, useState, useMemo } from "react";
import { useCartStore } from "@/app/context/cartContext";
import { useDictionary } from "@/app/context/dictionary-provider";
import { getProductById, searchProductsByFilter, getProductsByIds } from "@/app/api/services/productService";
import CarouselRail from "@/components/Home/sections/ui/CarouselRail";
import { ProductResponseModel } from "@/types/product";
import ProductGrid from "../Categories/ProductGrid";

interface CartSuggestionsProps {
    className?: string;
}

export default function CartSuggestions({ className }: CartSuggestionsProps) {
    const dictionary = useDictionary();
    const cart = useCartStore((s) => s.cart);
    const [products, setProducts] = useState<ProductResponseModel[]>([]);
    const [loading, setLoading] = useState(false);


    // Get up to 5 most recent items to base suggestions on
    const recentItems = useMemo(() => {
        if (!cart || cart.length === 0) return [];
        // Take last 5 items (reversed to get newest first)
        return [...cart].reverse().slice(0, 5);
    }, [cart]);

    useEffect(() => {
        let cancelled = false;

        async function fetchSuggestions() {
            if (recentItems.length === 0) {
                setProducts([]);
                return;
            }

            setLoading(true);

            try {
                // 1. Get full details for recent items to find their categories
                // We fetch multiple to build a better profile of what the user is interested in
                const recentIds = recentItems.map(i => i.id);
                const fullProducts = await getProductsByIds(recentIds);

                if (cancelled) return;

                // Aggregate unique category IDs and brand IDs
                const categoryIds = Array.from(new Set(
                    fullProducts
                        .map(p => p.category?.id)
                        .filter((id): id is string => !!id)
                ));

                const brandIds = Array.from(new Set(
                    fullProducts
                        .map(p => p.brand?.id)
                        .filter((id): id is string => !!id)
                ));

                if (categoryIds.length === 0 && brandIds.length === 0) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // 2. Fetch similar products using aggregated categories and brands
                const result = await searchProductsByFilter({
                    filter: {
                        //categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
                        //brandIds: brandIds.length > 0 ? brandIds : undefined,
                        stockStatus: 1, // In stock only
                        isRandom: true // Randomize to show variety
                    },
                    pageSize: 4,
                    sortBy: "featured"
                });

                if (cancelled) return;

                // Filter out items already in cart
                const filtered = (result.items || [])
                    .filter(p => !cart.some(c => c.id === p.id));

                setProducts(filtered);
            } catch (err) {
                console.error("Failed to load cart suggestions", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchSuggestions();

        return () => {
            cancelled = true;
        };
    }, [recentItems, cart]); // Re-run if recent items change or cart changes

    if (!products.length && !loading) return null;

    if (loading && !products.length) {
        return (
            <div className={`mt-12 ${className || ""}`}>
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`mt-16 border-t border-gray-200 dark:border-gray-800 pt-10 ${className || ""}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dictionary.cart.suggestions?.title || "You Might Also Like"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {dictionary.cart.suggestions?.subtitle || "Selected for you based on your cart"}
                    </p>
                </div>
            </div>

            <ProductGrid products={products} viewMode="grid" />
        </div>
    );
}
