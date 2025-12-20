"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n.config";
import { BrandModel } from "@/types/brand";
import { ProductResponseModel } from "@/types/product";
import ProductGrid from "@/components/Categories/ProductGrid";
import { searchProductsByFilter } from "@/app/api/services/productService";

interface BrandDetailPageProps {
    locale: Locale;
    brand: BrandModel;
    dict: any;
}

export default function BrandDetailPage({ locale, brand, dict }: BrandDetailPageProps) {
    const [products, setProducts] = useState<ProductResponseModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch products for this brand
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await searchProductsByFilter({
                    filter: {
                        brandIds: [brand.id],
                    },
                    pageSize: 100,
                    page: 1,
                });

                setProducts(response.items || []);
            } catch (error) {
                console.error("Failed to fetch brand products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [brand.id]);

    const brandLogo = brand.images?.[0];
    const brandName = brand.name || "Unknown Brand";

    return (
        <div className="min-h-screen">
            {/* Back Button
            <div className="container mx-auto px-4 pt-6">
                <Link href={`/${locale}/brands`}>
                    <Button className="gap-2" size="sm" variant="ghost">
                        <ArrowLeft className="w-4 h-4" />
                        {dict?.common?.backToBrands || "Back to Brands"}
                    </Button>
                </Link>
            </div> */}

            {/* Brand Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-5xl mx-auto mt-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            {/* Brand Logo */}
                            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-background border-2 border-border/50 overflow-hidden flex items-center justify-center p-4 shadow-lg">
                                {brandLogo ? (
                                    <Image
                                        alt={brandName}
                                        className="w-full h-full object-contain"
                                        height={160}
                                        src={brandLogo}
                                        width={160}
                                    />
                                ) : (
                                    <Building2 className="w-20 h-20 text-muted-foreground" />
                                )}
                            </div>

                            {/* Brand Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                                        {brandName}
                                    </h1>
                                    {brand.origin && (
                                        <div className="flex items-center gap-2 text-lg text-muted-foreground">
                                            <MapPin className="w-5 h-5" />
                                            <span>{brand.origin}</span>
                                        </div>
                                    )}
                                </div>

                                {brand.description && (
                                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                                        {brand.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 pt-2">
                                    <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <span className="text-sm font-medium text-primary">
                                            {loading ? "..." : products.length}{" "}
                                            {dict?.common?.products || "Products"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Gallery (if multiple images) */}
            {brand.images && brand.images.length > 1 && (
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {brand.images.slice(1).map((image, index) => (
                            <div
                                key={index}
                                className="aspect-square rounded-xl bg-muted/50 border border-border/50 overflow-hidden"
                            >
                                <Image
                                    alt={`${brandName} ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    height={300}
                                    src={image}
                                    width={300}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="font-heading text-3xl font-bold mb-2">
                        {dict?.brand?.productsFrom || "Products from"} {brandName}
                    </h2>
                    <p className="text-muted-foreground">
                        {dict?.brand?.exploreProducts || "Explore our full range of products"}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square rounded-xl bg-muted/50 animate-pulse"
                             />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                            <Building2 className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {dict?.brand?.noProducts || "No products available"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {dict?.brand?.checkBackLater || "Check back later for new products"}
                        </p>
                        <Link href={`/${locale}/brands`}>
                            <Button>
                                {dict?.common?.browseBrands || "Browse Other Brands"}
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <ProductGrid products={products} viewMode="grid" />
                )}
            </div>
        </div>
    );
}
