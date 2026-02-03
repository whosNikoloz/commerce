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

  // Filters (init from URL)
  // We use this state mainly to render the UI selections.
  // Updates to this state should come FROM the URL, not user interactions directly.
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

  // Lookup map from facetValueId to Name (for UI chips)
  const facetValueLookup = useMemo(() => {
    const map: Record<string, string> = {};

    facets.forEach((f) => {
      f.facetValues?.forEach((fv) => {
        if (fv.id) {
          map[fv.id] = fv.value ?? fv.id;
        }
      });
    });

    return map;
  }, [facets]);

  // 1. Listen to URL changes -> Update Filter State AND Fetch Data
  useEffect(() => {
    if (!category) return;

    // Skip fetch on initial mount if we have server data
    // BUT we still need to set the filter state from params in case the server data
    // matches the params (which it should) so the UI is correct.
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

    // Sync URL params to State
    const newFilter: FilterModel = {
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
    };

    setFilter(newFilter);

    if (hasUsedInitialData) {
      setHasUsedInitialData(false);

      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingProducts(true);
      try {
        const res = await searchProductsByFilter({
          filter: {
            ...newFilter,
            facetRanges,
            facetNumerics,
            facetSearches,
            facetDates,
          } as any,
          page: Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
          pageSize: itemsPerPage,
          sortBy: sortFromUrl,
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
  }, [category?.id, params, __initialPage, __initialSort, facetValueToFacetId, hasUsedInitialData, facetRanges, facetNumerics, facetSearches, facetDates]);




  // Helper to update URL (which then triggers the effect above)
  const updateUrl = (updates: {
    page?: number;
    sort?: string;
    brandIds?: string[];
    condition?: Condition[];
    stockStatus?: StockStatus;
    minPrice?: number;
    maxPrice?: number;
    facetFilters?: { facetValueId: string }[];
  }) => {
    const next = new URLSearchParams(params.toString());

    if (updates.page !== undefined) {
      if (updates.page > 1) next.set("page", String(updates.page));
      else next.delete("page");
    }

    if (updates.sort !== undefined) {
      if (updates.sort !== "featured") next.set("sort", updates.sort);
      else next.delete("sort");
    }

    if (updates.brandIds !== undefined) {
      next.delete("brand");
      updates.brandIds.forEach(b => next.append("brand", b));
    }

    if (updates.condition !== undefined) {
      next.delete("cond");
      updates.condition.forEach(c => next.append("cond", String(c)));
    }

    if (updates.stockStatus !== undefined) {
      next.set("stock", String(updates.stockStatus));
    } else if (updates.stockStatus === undefined && updates.hasOwnProperty("stockStatus")) { // Explicit undefined passed
      next.delete("stock");
    }

    if (updates.minPrice !== undefined) next.set("min", String(updates.minPrice));
    else if (updates.hasOwnProperty("minPrice")) next.delete("min");

    if (updates.maxPrice !== undefined) next.set("max", String(updates.maxPrice));
    else if (updates.hasOwnProperty("maxPrice")) next.delete("max");

    if (updates.facetFilters !== undefined) {
      next.delete("facet");
      updates.facetFilters.forEach(f => next.append("facet", f.facetValueId));
    }

    const queryString = next.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Use replace to avoid cluttering history, or push if you want history.
    // Usually filtering is push, but rapid changes (slider) might be replace.
    // For now using replace to match previous behavior, but usually push is better for UX.
    router.replace(newUrl, { scroll: false });
  };


  if (notFound) return <CategoryNotFound />;
  if (loading || !category) {
    return (
      <div className="min-h-screen mt-16 container mx-auto px-2 sm:px-4 py-4 lg:py-6">
        <SkeletonProductGrid count={12} onViewModeChange={() => { }} />
      </div>
    );
  }

  const subcategories = category.subcategories ?? [];
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const buildSubHref = (sub: CategoryModel) => `/category/${sub.id}`;

  // Calculate dynamic price range from loaded products
  // Default to 0-1000 if no products or invalid prices
  const productPrices = products.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p));
  // If we have filtered products, the range will shrink to them.
  //Ideally we want the range of the *unfiltered* result, but we don't have that.
  // A common UX pattern: The slider range is 0 to Max(ALL_PRODUCTS), and the handles select the filter.
  // Since we only have the current page, let's try to be smart.
  // If user hasn't filtered by price, we show Min/Max of current page.
  // If user HAS filtered by price, the slider handles are at the filter values.
  // Using 0-5000 as a safer fallback than 1000.
  // User requested range to start from 0
  const calculatedMin = 0;
  const calculatedMax = productPrices.length ? Math.max(...productPrices) : 1000;
  // Ensure we at least cover the selected range if it's wider
  const displayMin = filter.minPrice !== undefined ? Math.min(filter.minPrice, calculatedMin) : (calculatedMin < 100 ? 0 : calculatedMin); // anchor to 0 if close
  const displayMax = filter.maxPrice !== undefined ? Math.max(filter.maxPrice, calculatedMax) : (calculatedMax > 1000 ? calculatedMax : 1000);


  const onBrandToggle = (brandId: string) => {
    const newBrands = toggleInArray(filter.brandIds, brandId);

    updateUrl({ brandIds: newBrands, page: 1 });
  };
  const onConditionToggle = (cond: Condition) => {
    const newCond = toggleInArray(filter.condition, cond);

    updateUrl({ condition: newCond, page: 1 });
  };
  const onStockChange = (status?: StockStatus) => {
    updateUrl({ stockStatus: status, page: 1 });
  };
  const onPriceChange = (min?: number, max?: number) => {
    updateUrl({ minPrice: min, maxPrice: max, page: 1 });
  };
  const onFacetToggle = (facetId: string, facetValueId: string) => {
    const newFacets = toggleFacetValue(filter.facetFilters, facetId, facetValueId);

    updateUrl({ facetFilters: newFacets, page: 1 });
  };
  const onFacetRadioChange = (facetId: string, facetValueId: string) => {
    const current = filter.facetFilters ?? [];
    const target = facets.find((f) => f.id === facetId);
    const removeIds = new Set(
      (target?.facetValues ?? []).map((v) => v.id).filter(Boolean) as string[],
    );
    const cleaned = current.filter((ff) => !removeIds.has(ff.facetValueId));
    const newFacets = [...cleaned, { facetId, facetValueId }];

    updateUrl({ facetFilters: newFacets, page: 1 });
  };

  const onFacetRangeChange = (facetId: string, min?: number, max?: number) => {
    setFacetRanges(prev => ({ ...prev, [facetId]: { min, max } }));
    setCurrentPage(1); // Facet ranges seem local state driven in original code?
    // Note: The original code didn't sync these to URL properly. Leaving as is for minimal regression,
    // but resetting page to 1 is correct.
    // If these trigger fetches, they should be in the dependency array of the fetch effect (they are).
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
    // Reset everything in URL
    const next = new URLSearchParams();

    next.set("page", "1"); // or just delete page
    // Keep category implied by route
    router.replace(window.location.pathname, { scroll: false });
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
              priceMax={displayMax}
              priceMin={displayMin}
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
                onClearPrice={() => onPriceChange(undefined, undefined)}
                onClearStockStatus={() => onStockChange(undefined)}
                onRemoveBrand={(id) => onBrandToggle(id)}
                onRemoveCategory={(id) => { }} // Category removal logic if needed
                onRemoveCondition={(c) => onConditionToggle(c)}
                onRemoveFacet={(vid) => {
                  // reverse lookup facetId from vid if possible, or iterate
                  const pair = filter.facetFilters?.find(f => f.facetValueId === vid);

                  if (pair) onFacetToggle(pair.facetId, vid);
                }}
                onSortChange={(v) => {
                  updateUrl({ sort: v, page: 1 });
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
                onPageChange={(p) => updateUrl({ page: p })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
