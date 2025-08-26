"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductFilters from "./ProductFilters";
import ProductHeader from "./ProductHeader";
import ProductGrid from "./ProductGrid";
import Loading from "./loading";
import CategoryNotFound from "./not-found";

import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import { FacetModel } from "@/types/facet";
import { FilterModel } from "@/types/filter";
import { ProductResponseModel } from "@/types/product";
import { Condition, StockStatus } from "@/types/enums";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type CategoryWithSubs = CategoryModel & { subcategories?: CategoryModel[] };

const toggleInArray = <T,>(arr: T[] | undefined, val: T) => {
  const a = arr ?? [];

  return a.includes(val) ? a.filter((x) => x !== val) : [...a, val];
};

const toggleFacetValue = (arr: { facetValueId: string }[] | undefined, facetValueId: string) => {
  const a = arr ?? [];

  return a.some((f) => f.facetValueId === facetValueId)
    ? a.filter((f) => f.facetValueId !== facetValueId)
    : [...a, { facetValueId }];
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
  //const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(!__initialCategory);

  // products state (hydrated)
  const [products, setProducts] = useState<ProductResponseModel[]>(__initialProducts ?? []);
  const [totalCount, setTotalCount] = useState<number>(__initialTotal ?? 0);
  const [loadingProducts, setLoadingProducts] = useState(false);

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
  }, [categoryId]);

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
      facetFilters: facetIds.map((id) => ({ facetValueId: id })),
    });
  }, [category?.id]);

  const facets: FacetModel[] = useMemo(() => category?.facets ?? [], [category]);

  // Fetch when filter/sort/page changes (URL ↔ state sync)
  useEffect(() => {
    if (!category) return;

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
      } catch (e: any) {
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
  }, [category?.id, filter, sortBy, currentPage]);

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
  const onFacetToggle = (facetValueId: string) => {
    setFilter((prev) => ({
      ...prev,
      facetFilters: toggleFacetValue(prev.facetFilters, facetValueId),
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

      return { ...prev, facetFilters: [...cleaned, { facetValueId }] };
    });
    setCurrentPage(1);
  };

  const facetValueLookup = useMemo(() => {
    const map: Record<string, string> = {};
    (category?.facets ?? []).forEach(f =>
      (f.facetValues ?? []).forEach(v => {
        map[v.id] = v.value ?? v.id;
      })
    );
    return map;
  }, [category]);

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
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
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
              filter={filter}
              facetValueLookup={facetValueLookup}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="group bg-brand-muted dark:bg-brand-muteddark border rounded-lg shadow-sm p-3 lg:p-4"
                  >
                    <div className="animate-pulse">
                      <div className="w-full aspect-square rounded-md bg-gray-300/40 dark:bg-gray-600/40" />
                      <div className="mt-3 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-20 rounded bg-gray-300/40 dark:bg-gray-600/40" />
                          <div className="h-4 w-12 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                        </div>
                        <div className="h-3 w-32 rounded bg-gray-300/30 dark:bg-gray-600/30" />
                        <div className="h-9 w-full rounded bg-gray-300/40 dark:bg-gray-600/40" />
                        <div className="h-9 w-full rounded bg-gray-300/30 dark:bg-gray-600/30" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={products} viewMode={viewMode} />
            )}

            <div className="flex items-center justify-center gap-2">
              <button
                className="px-3 py-2 border rounded disabled:opacity-50"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-sm">
                {currentPage} / {Math.max(1, Math.ceil(totalCount / itemsPerPage))}
              </span>
              <button
                className="px-3 py-2 border rounded disabled:opacity-50"
                disabled={currentPage >= Math.max(1, Math.ceil(totalCount / itemsPerPage))}
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.max(1, Math.ceil(totalCount / itemsPerPage)), p + 1),
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
