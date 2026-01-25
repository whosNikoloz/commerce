"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin, ChevronRight } from "lucide-react";

import { Locale } from "@/i18n.config";
import { BrandModel } from "@/types/brand";

interface BrandCardProps {
    brand: BrandModel;
    locale: Locale;
    viewMode: "grid" | "list";
    dict?: any;
}

export default function BrandCard({ brand, locale, viewMode, dict }: BrandCardProps) {
    const brandLogo = brand.images?.[0];
    const brandName = brand.name || "Unknown Brand";
    const brandOrigin = brand.origin;
    const brandDescription = brand.description;

    if (viewMode === "list") {
        return (
            <Link
                className="group block bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                href={`/${locale}/brand/${brand.id}`}
            >
                <div className="flex items-center gap-4">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted/50 border border-border/30 overflow-hidden flex items-center justify-center group-hover:border-primary/30 transition-colors">
                        {brandLogo ? (
                            <Image
                                alt={brandName}
                                className="w-full h-full object-contain p-2"
                                height={64}
                                src={brandLogo}
                                width={64}
                            />
                        ) : (
                            <Building2 className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>

                    {/* Brand Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {brandName}
                        </h3>
                        {brandOrigin && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{brandOrigin}</span>
                            </div>
                        )}
                        {brandDescription && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {brandDescription}
                            </p>
                        )}
                    </div>

                    {/* Arrow Icon */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
            </Link>
        );
    }

    // Grid View
    return (
        <Link
            className="group block bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            href={`/${locale}/brand/${brand.id}`}
        >
            {/* Brand Logo */}
            <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/10 border-b border-border/30 overflow-hidden flex items-center justify-center p-6 group-hover:from-primary/5 group-hover:to-primary/10 transition-colors">
                {brandLogo ? (
                    <div className="relative w-full h-full">
                        <Image
                            fill
                            alt={brandName}
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                            src={brandLogo}
                        />
                    </div>
                ) : (
                    <Building2 className="w-16 h-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                )}
            </div>

            {/* Brand Info */}
            <div className="p-4">
                <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                    {brandName}
                </h3>

                {brandOrigin && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{brandOrigin}</span>
                    </div>
                )}

                {brandDescription && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {brandDescription}
                    </p>
                )}

                {/* View Products Link */}
                <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs font-medium text-brand-primary group-hover:gap-2 flex items-center gap-1 transition-all">
                        {dict?.brands?.viewProducts || "View Products"}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
