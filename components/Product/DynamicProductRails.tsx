"use client";

import type { ProductResponseModel, ProductRailSectionData, LocalizedText } from "@/types/product";
import type { FilterModel } from "@/types/filter";

import { useState, useEffect, useMemo } from "react";

import CarouselRail from "@/components/Home/sections/ui/CarouselRail";
import { ProductCard } from "@/components/Home/sections/ui/ProductCard";
import { searchProductsByFilter, getProductsByIds } from "@/app/api/services/productService";
import { useDictionary } from "@/app/context/dictionary-provider";

interface DynamicProductRailsProps {
  product: ProductResponseModel;
  sections: ProductRailSectionData[];
}

// Helper to get localized text
function t(text: LocalizedText | undefined, locale: string): string {
  if (!text) return "";

  return text[locale] || text.en || text.ka || "";
}

// Cache to track fetched sections globally (persists across remounts)
const fetchedSectionsCache = new Map<string, ProductResponseModel[]>();

// Single section renderer
function ProductRailSection({
  section,
  product,
  locale,
}: {
  section: ProductRailSectionData;
  product: ProductResponseModel;
  locale: string;
}) {
  // Extract stable dependencies
  const sectionId = section.id;
  const productId = product.id;
  const brandId = product.brand?.id;
  const categoryId = product.category?.id;

  // Create a stable cache key
  const cacheKey = `${sectionId}-${productId}-${brandId}-${categoryId}`;

  // Check cache for initial state
  const cachedProducts = fetchedSectionsCache.get(cacheKey);
  const [products, setProducts] = useState<ProductResponseModel[]>(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);

  useEffect(() => {
    // If we have cached data, don't fetch again
    if (fetchedSectionsCache.has(cacheKey)) {
      setProducts(fetchedSectionsCache.get(cacheKey) || []);
      setLoading(false);

      return;
    }

    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const finalLimit = section.filterBy?.productCount || (section.filterBy?.productIds?.length || 4);

        // Filter out current product and limit
        let filtered: ProductResponseModel[] = [];

        if (section.filterBy?.productIds && section.filterBy.productIds.length > 0) {
          // If specific IDs are requested, ONLY fetch those
          filtered = await getProductsByIds(section.filterBy.productIds);
        } else {
          // ONLY run search logic if no specific IDs were requested
          const filter: FilterModel = {};
          // ... (rest of search logic)

          // Handle useCurrentProductCategory
          if (section.filterBy?.useCurrentProductCategory && categoryId) {
            filter.categoryIds = [categoryId];
          } else if (section.filterBy?.categoryIds?.length) {
            filter.categoryIds = section.filterBy.categoryIds;
          }

          // Handle useCurrentProductBrand
          if (section.filterBy?.useCurrentProductBrand && brandId) {
            filter.brandIds = [brandId];
          } else if (section.filterBy?.brandIds?.length) {
            filter.brandIds = section.filterBy.brandIds;
          }

          // Price range
          if (section.filterBy?.minPrice !== undefined) {
            filter.minPrice = section.filterBy.minPrice;
          }
          if (section.filterBy?.maxPrice !== undefined) {
            filter.maxPrice = section.filterBy.maxPrice;
          }

          // Random and Count
          if (section.filterBy?.isRandom !== undefined) {
            filter.isRandom = section.filterBy.isRandom;
          }
          if (section.filterBy?.productCount !== undefined) {
            filter.productCount = section.filterBy.productCount;
          }

          // Condition and Stock Status
          if (section.filterBy?.condition?.length) {
            filter.condition = section.filterBy.condition as any;
          }
          if (section.filterBy?.stockStatus !== undefined) {
            filter.stockStatus = section.filterBy.stockStatus as any;
          }

          const result = await searchProductsByFilter({
            filter,
            pageSize: finalLimit * 2, // Align with ProductRail.tsx: data.limit * 2
            page: 1,
            sortBy: section.sortBy || "featured",
          });

          if (cancelled) return;

          let items = result.items || [];

          // Client-side filtering for boolean flags (Align with ProductRail.tsx)
          if (section.filterBy?.isNewArrival) {
            items = items.filter((p) => p.isNewArrival);
          }
          if (section.filterBy?.isLiquidated) {
            items = items.filter((p) => p.isLiquidated);
          }
          if (section.filterBy?.isComingSoon) {
            items = items.filter((p) => p.isComingSoon);
          }
          if (section.filterBy?.hasDiscount) {
            items = items.filter((p) => p.discountPrice && p.discountPrice < p.price);
          }

          filtered = items;
        }

        // Filter out current product (unless manually selected by ID) and limit
        const finalProducts = filtered
          .filter((p) => {
            // If IDs are manually selected, don't filter out the current product automatically
            if (section.filterBy?.productIds?.length) return true;

            return p.id !== productId;
          })
          .slice(0, finalLimit);

        if (cancelled) return;

        // Cache the result
        fetchedSectionsCache.set(cacheKey, finalProducts);
        setProducts(finalProducts);
      } catch (error) {
        console.error("Failed to fetch products for section:", sectionId, error);
        if (!cancelled) {
          setProducts([]);
          fetchedSectionsCache.set(cacheKey, []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, sectionId, productId, brandId, categoryId, section.filterBy, section.sortBy, section.customName]);

  if (loading) {
    return (
      <section className="my-12">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <span className="w-1.5 h-7 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const title = t(section.title, locale);
  const subtitle = t(section.subtitle, locale);

  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="w-1.5 h-7 bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-full" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 ml-5">{subtitle}</p>
          )}
        </div>

        {section.viewAllHref && (
          <a
            className="text-sm font-medium text-brand-primary hover:underline whitespace-nowrap"
            href={section.viewAllHref}
          >
            View All &rarr;
          </a>
        )}
      </div>

      {section.layout === "grid" ? (
        <div
          className={`grid gap-3 md:gap-4 ${section.columns === 2
            ? "grid-cols-2"
            : section.columns === 3
              ? "grid-cols-2 md:grid-cols-3"
              : section.columns === 4
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : section.columns === 5
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                  : section.columns === 6
                    ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
        >
          {products.map((p, index) => (
            <ProductCard key={p.id} showActions priority={index < 4} product={p} size="compact" />
          ))}
        </div>
      ) : (
        <CarouselRail products={products} />
      )}
    </section>
  );
}

export function DynamicProductRails({ product, sections }: DynamicProductRailsProps) {
  const dictionary = useDictionary();
  // Detect current locale from dictionary or default to 'ka'
  const locale = dictionary?._locale || "ka";

  // Filter enabled sections and sort by order - memoize to prevent unnecessary re-renders
  const enabledSections = useMemo(() =>
    sections
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order),
    [sections]
  );

  if (enabledSections.length === 0) {
    return null;
  }

  return (
    <>
      {enabledSections.map((section) => (
        <ProductRailSection
          key={section.id}
          locale={locale}
          product={product}
          section={section}
        />
      ))}
    </>
  );
}
