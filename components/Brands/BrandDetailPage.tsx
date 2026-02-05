"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, Package, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n.config";
import { BrandModel, getBrandCoverImageUrl } from "@/types/brand";
import { ProductResponseModel } from "@/types/product";
import ProductGrid from "@/components/Categories/ProductGrid";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { stripInlineColors } from "@/lib/utils";

interface BrandDetailPageProps {
    locale: Locale;
    brand: BrandModel;
    dict: any;
}

export default function BrandDetailPage({ locale, brand, dict }: BrandDetailPageProps) {
    const [products, setProducts] = useState<ProductResponseModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [shouldCollapseDescription, setShouldCollapseDescription] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);
    const maxDescriptionHeight = 300;

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

    useEffect(() => {
        if (descriptionRef.current) {
            setShouldCollapseDescription(descriptionRef.current.scrollHeight > maxDescriptionHeight + 50);
        }
    }, [brand.description]);

    const brandLogo = getBrandCoverImageUrl(brand.images);
    const brandName = brand.name || "Unknown Brand";

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-brand-primary/5 via-background to-brand-primary/10 border-b border-border/30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent" />
                <div className="container mx-auto px-4 py-16 md:py-20 relative">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                            {/* Brand Logo */}
                            <div className="flex-shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-background border border-border/50 overflow-hidden flex items-center justify-center p-5 shadow-xl shadow-black/5 dark:shadow-black/20">
                                {brandLogo ? (
                                    <Image
                                        priority
                                        alt={brandName}
                                        className="w-full h-full object-contain"
                                        height={176}
                                        src={brandLogo || "/placeholder.png"}
                                        width={176}
                                    />
                                ) : (
                                    <Building2 className="w-20 h-20 text-muted-foreground" />
                                )}
                            </div>

                            {/* Brand Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                                        {brandName}
                                    </h1>
                                    {brand.origin && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm font-medium">{brand.origin}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                                        <Package className="w-4 h-4 text-brand-primary" />
                                        <span className="text-sm font-semibold text-brand-primary">
                                            {loading ? "..." : products.length} {dict?.common?.products || "Products"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Description Section */}
            {brand.description && (
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-7 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
                                {dict?.product?.aboutBrand?.replace("{brand}", brandName) || `About ${brandName}`}
                            </h2>

                            <motion.div
                                animate={{
                                    height: isDescriptionExpanded ? "auto" : shouldCollapseDescription ? maxDescriptionHeight : "auto",
                                }}
                                className={`overflow-hidden relative ${!isDescriptionExpanded && shouldCollapseDescription ? "cursor-pointer" : ""}`}
                                initial={false}
                                transition={{ type: "tween", duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                                onClick={() => !isDescriptionExpanded && shouldCollapseDescription && setIsDescriptionExpanded(true)}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: stripInlineColors(brand.description) }}
                                    ref={descriptionRef}
                                    className={`rich-content prose prose-slate dark:prose-invert max-w-none
                                        text-slate-700 dark:text-slate-300
                                        prose-headings:text-foreground prose-headings:font-heading
                                        prose-p:leading-relaxed prose-li:leading-relaxed
                                        prose-a:text-brand-primary hover:prose-a:text-brand-primary/80
                                        ${!isDescriptionExpanded && shouldCollapseDescription ? "[mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" : ""}`}
                                />
                            </motion.div>

                            {shouldCollapseDescription && (
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                    <Button
                                        className="group flex items-center justify-center gap-2 px-6 py-2 h-9 min-w-[140px]
                                            text-sm font-medium border-border/60 hover:border-brand-primary/50
                                            bg-background hover:bg-brand-primary/5 text-muted-foreground hover:text-brand-primary
                                            rounded-full transition-all duration-200"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    >
                                        <span>{isDescriptionExpanded ? (dict?.common?.readLess || "Read Less") : (dict?.common?.readMore || "Read More")}</span>
                                        <motion.div
                                            animate={{ rotate: isDescriptionExpanded ? 180 : 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </motion.div>
                                    </Button>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Brand Gallery (if multiple images) */}
            {brand.images && brand.images.length > 1 && (
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {brand.images.filter(img => {
                                return img !== brandLogo;
                            }).slice(0, 4).map((image, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="aspect-square rounded-2xl bg-muted/30 border border-border/30 overflow-hidden group"
                                    >
                                        <Image
                                            alt={`${brandName} ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            height={300}
                                            src={image}
                                            width={300}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Products Section */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="mb-10">
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 flex items-center gap-3">
                        <span className="w-1.5 h-7 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
                        {dict?.pages?.brand?.productsFrom?.replace("{brand}", brandName) || dict?.pages?.brand?.productsTitle || `Products from ${brandName}`}
                    </h2>
                    <p className="text-muted-foreground ml-5">
                        {dict?.pages?.brand?.exploreProducts || "Explore the full product range"}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] rounded-2xl bg-muted/50 animate-pulse"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/50 mb-6">
                            <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {dict?.pages?.brand?.noProducts || "No products available"}
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            {dict?.pages?.brand?.checkBackLater || "Check back later for new products"}
                        </p>
                        <Link href={`/${locale}/brands`}>
                            <Button className="rounded-full px-8" size="lg">
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
