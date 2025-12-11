"use client";

import { useState, useMemo } from "react";
import { Search, Grid3x3, List, Building2 } from "lucide-react";

import BrandCard from "./BrandCard";

import { BrandModel } from "@/types/brand";
import { Locale } from "@/i18n.config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BrandsPageProps {
    locale: Locale;
    brands: BrandModel[];
    dict: any;
}

export default function BrandsPage({ locale, brands, dict }: BrandsPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filter brands based on search query
    const filteredBrands = useMemo(() => {
        if (!searchQuery.trim()) return brands;

        const query = searchQuery.toLowerCase();

        return brands.filter(
            (brand) =>
                brand.name?.toLowerCase().includes(query) ||
                brand.origin?.toLowerCase().includes(query) ||
                brand.description?.toLowerCase().includes(query)
        );
    }, [brands, searchQuery]);

    // Group brands alphabetically
    const groupedBrands = useMemo(() => {
        const groups: Record<string, BrandModel[]> = {};

        filteredBrands.forEach((brand) => {
            const firstLetter = (brand.name?.[0] || "#").toUpperCase();
            const key = /[A-Z]/.test(firstLetter) ? firstLetter : "#";

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(brand);
        });

        // Sort brands within each group
        Object.keys(groups).forEach((key) => {
            groups[key].sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
        });

        return groups;
    }, [filteredBrands]);

    const sortedGroupKeys = Object.keys(groupedBrands).sort();

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border/50">
                <div className="container mx-auto px-4 py-12 md:py-16">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {brands.length} {dict?.brands?.brandsCount || "Brands"}
                            </span>
                        </div>

                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {dict?.pages?.brands?.heading || "Explore Our Brands"}
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            {dict?.pages?.brands?.subtitle ||
                                "Discover trusted brands and quality products from around the world"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                className="pl-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder={dict?.brands?.searchPlaceholder || "Search brands..."}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
                            <Button
                                className="gap-2"
                                size="sm"
                                variant={viewMode === "grid" ? "default" : "ghost"}
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid3x3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Grid</span>
                            </Button>
                            <Button
                                className="gap-2"
                                size="sm"
                                variant={viewMode === "list" ? "default" : "ghost"}
                                onClick={() => setViewMode("list")}
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden sm:inline">List</span>
                            </Button>
                        </div>
                    </div>

                    {/* Results Count */}
                    {searchQuery && (
                        <p className="text-sm text-muted-foreground mt-4">
                            {filteredBrands.length === 0
                                ? dict?.brands?.noResults || "No brands found"
                                : `${filteredBrands.length} ${dict?.brands?.resultsFound || "brand(s) found"}`}
                        </p>
                    )}
                </div>
            </div>

            {/* Brands Grid */}
            <div className="container mx-auto px-4 pb-16">
                {filteredBrands.length === 0 ? (
                    // Empty State
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                            <Building2 className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            {dict?.brands?.noBrandsFound || "No brands found"}
                        </h3>
                        <p className="text-muted-foreground">
                            {dict?.brands?.tryDifferentSearch || "Try adjusting your search"}
                        </p>
                    </div>
                ) : (
                    // Alphabetical Groups
                    <div className="space-y-12">
                        {sortedGroupKeys.map((letter) => (
                            <div key={letter} className="scroll-mt-20" id={`letter-${letter}`}>
                                {/* Letter Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
                                        <span className="text-2xl font-bold text-primary">{letter}</span>
                                    </div>
                                    <div className="flex-1 h-px bg-border/50" />
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {groupedBrands[letter].length} {dict?.brands?.brands || "brands"}
                                    </span>
                                </div>

                                {/* Brands Grid/List */}
                                <div
                                    className={
                                        viewMode === "grid"
                                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                                            : "space-y-4"
                                    }
                                >
                                    {groupedBrands[letter].map((brand) => (
                                        <BrandCard
                                            key={brand.id}
                                            brand={brand}
                                            locale={locale}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Alphabet Quick Navigation */}
            {filteredBrands.length > 0 && (
                <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-1 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg p-2 shadow-lg">
                    {sortedGroupKeys.map((letter) => (
                        <a
                            key={letter}
                            className="w-8 h-8 flex items-center justify-center text-xs font-medium rounded hover:bg-primary hover:text-primary-foreground transition-colors"
                            href={`#letter-${letter}`}
                            title={`Jump to ${letter}`}
                        >
                            {letter}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
