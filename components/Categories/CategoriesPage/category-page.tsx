"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductGrid from "../ProductGrid";
import { SkeletonProductGrid } from "../SkeletonProductGrid";


import ProductFilters from "./ProductFilters";
import ProductHeader from "./ProductHeader";
import CategoryNotFound from "./not-found";

import Pagination from "@/components/ui/Pagination";
import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import { FacetModel } from "@/types/facet";
import { FilterModel } from "@/types/filter";
import { ProductResponseModel } from "@/types/product";
import { Condition, StockStatus } from "@/types/enums";
import { searchProductsByFilter } from "@/app/api/services/productService";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();

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

  const [facetRanges, setFacetRanges] =
    useState<Record<string, { min?: number; max?: number }>>({});
  const [facetNumerics, setFacetNumerics] =
    useState<Record<string, number | undefined>>({});
  const [facetSearches, setFacetSearches] =
    useState<Record<string, string>>({});
  const [facetDates, setFacetDates] =
    useState<Record<string, { from?: string; to?: string }>>({});


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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      // reflect in URL - only add non-default parameters
      startTransition(() => {
        const next = new URLSearchParams();

        // Only add page if not 1
        if (currentPage > 1) {
          next.set("page", String(currentPage));
        }

        // Only add sort if not default
        if (sortBy !== "featured") {
          next.set("sort", sortBy);
        }

        (effectiveFilter.brandIds ?? []).forEach((b) => next.append("brand", b));
        (effectiveFilter.condition ?? []).forEach((c) => next.append("cond", String(c)));
        if (effectiveFilter.stockStatus !== undefined)
          next.set("stock", String(effectiveFilter.stockStatus));
        if (effectiveFilter.minPrice !== undefined)
          next.set("min", String(effectiveFilter.minPrice));
        if (effectiveFilter.maxPrice !== undefined)
          next.set("max", String(effectiveFilter.maxPrice));
        (effectiveFilter.facetFilters ?? []).forEach((f) => next.append("facet", f.facetValueId));

        const queryString = next.toString();
        const newUrl = queryString ? `?${queryString}` : window.location.pathname;

        router.replace(newUrl, { scroll: false });
      });

      try {
        const res = await searchProductsByFilter({
            filter: {
              ...effectiveFilter,
              facetRanges,
              facetNumerics,
              facetSearches,
              facetDates,
            } as any,
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
  }, [category?.id, filter, sortBy, currentPage, router, startTransition, hasUsedInitialData, facetRanges, facetNumerics, facetSearches, facetDates]);

  // if (notFound) return <CategoryNotFound />;
  // if (loading || !category) return <Loading />;
  if (notFound) return <CategoryNotFound />;
    if (loading || !category) {
      return (
        <div className="min-h-screen mt-16 container mx-auto px-2 sm:px-4 py-4 lg:py-6">
          <SkeletonProductGrid count={12} onViewModeChange={() => {}} />
        </div>
    );
  }

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

  const onFacetRangeChange = (facetId: string, min?: number, max?: number) => {
  setFacetRanges(prev => ({ ...prev, [facetId]: { min, max } }));
  setCurrentPage(1);
};

const onFacetNumericChange = (facetId: string, value?: number) => {
  setFacetNumerics(prev => ({ ...prev, [facetId]: value }));
  setCurrentPage(1);
};

const onFacetSearchChange = (facetId: string, text: string) => {
  setFacetSearches(prev => ({ ...prev, [facetId]: text }));
  setCurrentPage(1);
};

const onFacetDateRangeChange = (facetId: string, from?: string, to?: string) => {
  setFacetDates(prev => ({ ...prev, [facetId]: { ...prev[facetId], from, to } }));
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
            onFacetDateRangeChange={onFacetDateRangeChange}
            onFacetNumericChange={onFacetNumericChange}
            onFacetRadioChange={onFacetRadioChange}
            onFacetRangeChange={onFacetRangeChange}
            onFacetSearchChange={onFacetSearchChange}
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
