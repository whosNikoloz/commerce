"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CarouselRail from "@/components/Home/sections/ui/CarouselRail";
import { Button } from "@/components/ui/button";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { useDictionary } from "@/app/context/dictionary-provider";

interface RelatedBrandProductsProps {
    brandId: string;
    brandName: string;
    currentProductId: string;
    limit?: number;
}

export function RelatedBrandProducts({
    brandId,
    brandName,
    currentProductId,
    limit = 12,
}: RelatedBrandProductsProps) {
    const dict = useDictionary();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!brandId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const result = await searchProductsByFilter({
                    filter: {
                        brandIds: [brandId],
                    },
                    pageSize: limit + 1, // Fetch one extra to account for excluding current product
                    page: 1,
                    sortBy: "featured",
                });

                // Filter out the current product and limit results
                const filtered = (result.items || [])
                    .filter((p: any) => p.id !== currentProductId)
                    .slice(0, limit);

                setProducts(filtered);
            } catch (err) {
                console.error("Failed to fetch related brand products:", err);
                setError("Failed to load related products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [brandId, currentProductId, limit]);

    // Don't render if no brand, still loading, error, or no products found
    if (!brandId || loading || error || products.length === 0) {
        return null;
    }

    return (
        <section className="my-12">
            <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
                <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
                        <span className="w-1.5 h-7 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
                        {dict.product?.moreBrand?.replace("{brand}", brandName) || `More from ${brandName}`}
                    </h2>
                </div>

                <Button asChild className="group flex-shrink-0" size="sm" variant="ghost">
                    <Link
                        className="font-primary flex items-center gap-1 text-sm font-semibold"
                        href={`/brand/${brandId}`}
                    >
                        <span className="hidden sm:inline">{dict.common?.viewAll || "View All"}</span>
                        <span className="sm:hidden">{dict.common?.all || "All"}</span>
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>

            <CarouselRail products={products} />
        </section>
    );
}
