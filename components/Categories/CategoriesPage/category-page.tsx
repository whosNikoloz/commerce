"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductFilters from "./ProductFilters";
import ProductHeader from "./ProductHeader";
import ProductGrid from "./ProductGrid";
import CategoryNotFound from "./not-found";
import { SkeletonProductGrid } from "./SkeletonProductGrid";

import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import { FacetModel } from "@/types/facet";
import { FilterModel } from "@/types/filter";
import { ProductResponseModel } from "@/types/product";
import { Condition, StockStatus } from "@/types/enums";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Loading from "@/app/[lang]/category/[[...slug]]/loading";
import { buildFacetValueToFacetIdMap } from "@/lib/urlState";

type CategoryWithSubs = CategoryModel & { subcategories?: CategoryModel[] };

const toggleInArray = <T,>(arr: T[] | undefined, val: T) => {
  const a = arr ?? [];

  return a.includes(val) ? a.filter((x) => x !== val) : [...a, val];
};

const toggleFacetValue = (
  arr: { facetId: string; facetValueId: string }[] | undefined,
  facetId: string,
  facetValueId: string,
) => {
  const a = arr ?? [];

  return a.some((f) => f.facetValueId === facetValueId)
    ? a.filter((f) => f.facetValueId !== facetValueId)
    : [...a, { facetId, facetValueId }];
};

export default function CategoryPage({
  categoryId,
  __initialCategory,
  __initialBrands,
  __initialProducts,
  __initialTotal,
  __initialPage,
  __initialSort,
}: {
  categoryId: string;
  __initialCategory?: CategoryWithSubs | null;
  __initialBrands?: BrandModel[] | null;
  __initialProducts?: ProductResponseModel[];
  __initialTotal?: number;
  __initialPage?: number;
  __initialSort?: string;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [category] = useState<CategoryWithSubs | null>(__initialCategory ?? null);
  const [brands] = useState<BrandModel[]>(__initialBrands ?? []);
  const [loading, setLoading] = useState(!__initialCategory);
  const [notFound, setNotFound] = useState(!__initialCategory);

  // products
  const [products, setProducts] = useState<ProductResponseModel[]>(__initialProducts ?? []);
  const [totalCount, setTotalCount] = useState<number>(__initialTotal ?? 0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [hasUsedInitialData, setHasUsedInitialData] = useState(!!__initialProducts);

  const [sortBy, setSortBy] = useState(__initialSort ?? "featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(__initialPage ?? 1);
  const itemsPerPage = 12;

  // Filters (init from URL once, then keep URL in sync)
  const [filter, setFilter] = useState<FilterModel>({
    brandIds: [],
    categoryIds: category ? [category.id] : [],
    condition: [],
    stockStatus: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    facetFilters: [],
  });

  useEffect(() => {
    if (__initialCategory) {
      setNotFound(false);
      setLoading(false);
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [categoryId, __initialCategory]);

  const facets: FacetModel[] = useMemo(() => category?.facets ?? [], [category]);

  // Lookup map from facetValueId to facetId
  const facetValueToFacetId = useMemo(() => buildFacetValueToFacetIdMap(facets), [facets]);

  useEffect(() => {
    if (!category) return;

    const brandsParam = params.getAll("brand");
    const condParam = params.getAll("cond").map((v) => Number(v)) as Condition[];
    const stockParam = params.get("stock");
    const min = params.get("min");
    const max = params.get("max");
    const facetIds = params.getAll("facet");

    const pageFromUrl = Number(params.get("page") ?? __initialPage ?? 1);
    const sortFromUrl = params.get("sort") ?? __initialSort ?? "featured";

    setCurrentPage(Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1);
    setSortBy(sortFromUrl);

    setFilter({
      brandIds: brandsParam,
      categoryIds: [category.id],
      condition: condParam.filter((x) => x === 0 || x === 1 || x === 2),
      stockStatus: stockParam !== null ? (Number(stockParam) as StockStatus) : undefined,
      minPrice: min ? Number(min) : undefined,
      maxPrice: max ? Number(max) : undefined,
      facetFilters: facetIds
        .map((facetValueId) => {
          const facetId = facetValueToFacetId[facetValueId];
          return facetId ? { facetId, facetValueId } : null;
        })
        .filter((f): f is { facetId: string; facetValueId: string } => f !== null),
    });
  }, [category?.id, params, __initialPage, __initialSort, facetValueToFacetId]);

  const facetValueLookup = useMemo(() => {
    const map: Record<string, string> = {};

    (category?.facets ?? []).forEach((f) =>
      (f.facetValues ?? []).forEach((v) => {
        map[v.id] = v.value ?? v.id;
      }),
    );

    return map;
  }, [category]);

  // Fetch when filter/sort/page changes (URL ↔ state sync)
  useEffect(() => {
    if (!category) return;

    // Skip fetch on initial mount if we have server data
    if (hasUsedInitialData) {
      setHasUsedInitialData(false);
      return;
    }

    const effectiveFilter = { ...filter, categoryIds: [category.id] };
    let cancelled = false;

    (async () => {
      setLoadingProducts(true);

      // reflect in URL
      startTransition(() => {
        const next = new URLSearchParams();

        next.set("page", String(currentPage));
        next.set("sort", sortBy);

        (effectiveFilter.brandIds ?? []).forEach((b) => next.append("brand", b));
        (effectiveFilter.condition ?? []).forEach((c) => next.append("cond", String(c)));
        if (effectiveFilter.stockStatus !== undefined)
          next.set("stock", String(effectiveFilter.stockStatus));
        if (effectiveFilter.minPrice !== undefined)
          next.set("min", String(effectiveFilter.minPrice));
        if (effectiveFilter.maxPrice !== undefined)
          next.set("max", String(effectiveFilter.maxPrice));
        (effectiveFilter.facetFilters ?? []).forEach((f) => next.append("facet", f.facetValueId));

        router.replace(`?${next.toString()}`, { scroll: false });
      });

      try {
        const res = await searchProductsByFilter({
          filter: effectiveFilter,
          page: currentPage,
          pageSize: itemsPerPage,
          sortBy,
        });

        if (cancelled) return;
        setProducts(res.items ?? []);
        setTotalCount(res.totalCount ?? 0);
      } catch {
        if (cancelled) return;
        setProducts([]);
        setTotalCount(0);
      } finally {
        if (cancelled) return;
        setLoadingProducts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category?.id, filter, sortBy, currentPage, router, startTransition, hasUsedInitialData]);

  if (notFound) return <CategoryNotFound />;
  if (loading || !category) return <Loading />;

  const subcategories = category.subcategories ?? [];
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const buildSubHref = (sub: CategoryModel) => `/category/${sub.id}`;

  const onBrandToggle = (brandId: string) => {
    setFilter((prev) => ({ ...prev, brandIds: toggleInArray(prev.brandIds, brandId) }));
    setCurrentPage(1);
  };
  const onConditionToggle = (cond: Condition) => {
    setFilter((prev) => ({ ...prev, condition: toggleInArray(prev.condition, cond) }));
    setCurrentPage(1);
  };
  const onStockChange = (status?: StockStatus) => {
    setFilter((prev) => ({ ...prev, stockStatus: status }));
    setCurrentPage(1);
  };
  const onPriceChange = (min?: number, max?: number) => {
    setFilter((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
    setCurrentPage(1);
  };
  const onFacetToggle = (facetId: string, facetValueId: string) => {
    setFilter((prev) => ({
      ...prev,
      facetFilters: toggleFacetValue(prev.facetFilters, facetId, facetValueId),
    }));
    setCurrentPage(1);
  };
  const onFacetRadioChange = (facetId: string, facetValueId: string) => {
    setFilter((prev) => {
      const current = prev.facetFilters ?? [];
      const target = facets.find((f) => f.id === facetId);
      const removeIds = new Set(
        (target?.facetValues ?? []).map((v) => v.id).filter(Boolean) as string[],
      );
      const cleaned = current.filter((ff) => !removeIds.has(ff.facetValueId));

      return { ...prev, facetFilters: [...cleaned, { facetId, facetValueId }] };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilter({
      brandIds: [],
      categoryIds: [category.id],
      condition: [],
      stockStatus: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      facetFilters: [],
    });
    setCurrentPage(1);
  };

  const activeFiltersCount =
    (filter.brandIds?.length ?? 0) +
    (filter.condition?.length ?? 0) +
    (filter.stockStatus !== undefined ? 1 : 0) +
    (filter.minPrice !== undefined || filter.maxPrice !== undefined ? 1 : 0) +
    (filter.facetFilters?.length ?? 0);

  return (
    <div className={cn(isMobile ? "min-h-screen" : "min-h-screen mt-16")}>
      <div className="max-w-[100vw]">
        <div className="container mx-auto px-2 sm:px-4 py-4 lg:py-6">
          <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8 lg:items-start">
          <ProductFilters
            activeFiltersCount={activeFiltersCount}
            brands={brands}
            buildSubHref={buildSubHref}
            clearFilters={clearFilters}
            facets={(category.facets ?? []) as FacetModel[]}
            filter={filter}
            subcategories={subcategories}
            onBrandToggle={onBrandToggle}
            onConditionToggle={onConditionToggle}
            onFacetRadioChange={onFacetRadioChange}
            onFacetToggle={onFacetToggle}
            onPriceChange={onPriceChange}
            onStockChange={onStockChange}
          />

          <div className="space-y-4 lg:space-y-6">
            <ProductHeader
              activeFiltersCount={activeFiltersCount}
              brandLookup={Object.fromEntries(brands.map((b) => [b.id, b.name ?? b.id]))}
              facetValueLookup={facetValueLookup}
              filter={filter}
              productCount={totalCount}
              sortBy={sortBy}
              title={category.name ?? ""}
              viewMode={viewMode}
              onClearAll={clearFilters}
              onClearPrice={() =>
                setFilter((f) => ({ ...f, minPrice: undefined, maxPrice: undefined }))
              }
              onClearStockStatus={() => setFilter((f) => ({ ...f, stockStatus: undefined }))}
              onRemoveBrand={(id) =>
                setFilter((f) => ({ ...f, brandIds: (f.brandIds ?? []).filter((x) => x !== id) }))
              }
              onRemoveCategory={(id) =>
                setFilter((f) => ({
                  ...f,
                  categoryIds: (f.categoryIds ?? []).filter((x) => x !== id),
                }))
              }
              onRemoveCondition={(c) =>
                setFilter((f) => ({ ...f, condition: (f.condition ?? []).filter((x) => x !== c) }))
              }
              onRemoveFacet={(vid) =>
                setFilter((f) => ({
                  ...f,
                  facetFilters: (f.facetFilters ?? []).filter((x) => x.facetValueId !== vid),
                }))
              }
              onSortChange={(v) => {
                setSortBy(v);
                setCurrentPage(1);
              }}
              onViewModeChange={setViewMode}
            />

            {loadingProducts ? (
              <SkeletonProductGrid count={12} onViewModeChange={setViewMode} />
            ) : (
              <ProductGrid products={products} viewMode={viewMode} />
            )}

            <div className="flex items-center justify-center gap-2 sm:gap-3 py-8 px-2">
              <button
                className="group px-3 sm:px-5 py-2 sm:py-3 rounded-xl border-2 border-border/50 bg-card hover:border-brand-primary hover:bg-brand-primary hover:text-white text-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:bg-card disabled:hover:text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <span className="text-lg sm:text-xl">←</span>
                <span className="hidden sm:inline">Prev</span>
              </button>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border border-brand-primary/30 shadow-md">
                <span className="text-xs sm:text-sm font-semibold text-foreground hidden sm:inline">Page</span>
                <span className="text-base sm:text-lg font-bold text-brand-primary">{currentPage}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">/</span>
                <span className="text-base sm:text-lg font-bold text-brand-primary">{totalPages}</span>
              </div>
              <button
                className="group px-3 sm:px-5 py-2 sm:py-3 rounded-xl border-2 border-border/50 bg-card hover:border-brand-primary hover:bg-brand-primary hover:text-white text-foreground disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/50 disabled:hover:bg-card disabled:hover:text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="text-lg sm:text-xl">→</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
