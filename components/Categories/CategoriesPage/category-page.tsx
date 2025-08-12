"use client"

import { useEffect, useMemo, useState } from "react"

import ProductFilters from "./ProductFilters"
import ProductHeader from "./ProductHeader"
import ProductGrid from "./ProductGrid"
import ProductPagination from "./ProductPagination"

import { CategoryModel } from "@/types/category"
import { BrandModel } from "@/types/brand"
import { FacetModel, FacetFilterModel } from "@/types/facet"
import { FilterModel } from "@/types/filter"
import { ProductResponseModel } from "@/types/product"
import { getAllBrands } from "@/app/api/services/brandService"
import { getCategoryWithSubCategoriesById } from "@/app/api/services/categoryService"
import { Condition, StockStatus } from "@/types/enums"
import {
  // searchProducts,                 // not used for bootstrap
  searchProductsByFilter,
  isFilterEmpty,
  getProductsByCategory,            // ✅ use on page load
} from "@/app/api/services/productService"
import Loading from "./loading"

type CategoryWithSubs = CategoryModel & { subcategories?: CategoryModel[] }
type CatOrArray = CategoryWithSubs | CategoryModel[]

const toggleInArray = <T,>(arr: T[] | undefined, val: T) => {
  const a = arr ?? []
  return a.includes(val) ? a.filter(x => x !== val) : [...a, val]
}

const toggleFacetValue = (arr: FacetFilterModel[] | undefined, facetValueId: string) => {
  const a = arr ?? []
  return a.some(f => f.facetValueId === facetValueId)
    ? a.filter(f => f.facetValueId !== facetValueId)
    : [...a, { facetValueId }]
}

export default function CategoryPage({ categoryId }: { categoryId: string }) {
  const [category, setCategory] = useState<CategoryWithSubs | null>(null)
  const [brands, setBrands] = useState<BrandModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterModel>({
    brandIds: [],
    categoryIds: [],
    condition: [],
    stockStatus: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    facetFilters: [],
  })

  const [products, setProducts] = useState<ProductResponseModel[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [categoryProducts, setCategoryProducts] = useState<ProductResponseModel[] | null>(null)

  const cards = Array.from({ length: 12 });


  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          setLoading(true); setError(null)

          const [raw, allBrands, catProducts] = await Promise.all([
            getCategoryWithSubCategoriesById(categoryId) as unknown as Promise<CatOrArray>,
            getAllBrands(),
            getProductsByCategory(categoryId),
          ])
          if (!alive) return

          let parent: CategoryWithSubs
          if (Array.isArray(raw)) {
            const root = raw.find(c => c.id === categoryId) ?? raw.find(c => c.parentId == null) ?? raw[0]
            const subs = raw.filter(c => c.parentId === root.id)
            parent = { ...root, subcategories: subs }
          } else {
            parent = raw
          }

          setCategory(parent)
          setBrands(allBrands)
          setCategoryProducts(catProducts)

          const start = 0
          const end = itemsPerPage
          setProducts(catProducts.slice(start, end))
          setTotalCount(catProducts.length)
          setCurrentPage(1)
        } catch (e: any) {
          if (!alive) return
          setError(e?.message ?? "Failed to load category")
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [categoryId])

  const facets: FacetModel[] = useMemo(() => category?.facets ?? [], [category])

  const effectiveFilter: FilterModel | null = useMemo(() => {
    if (!category) return null
    return { ...filter, categoryIds: [category.id] }
  }, [category, filter])

  const onBrandToggle = (brandId: string) => { setFilter(prev => ({ ...prev, brandIds: toggleInArray(prev.brandIds, brandId) })); setCurrentPage(1) }
  const onConditionToggle = (cond: Condition) => { setFilter(prev => ({ ...prev, condition: toggleInArray(prev.condition, cond) })); setCurrentPage(1) }
  const onStockChange = (status?: StockStatus) => { setFilter(prev => ({ ...prev, stockStatus: status })); setCurrentPage(1) }
  const onPriceChange = (min?: number, max?: number) => { setFilter(prev => ({ ...prev, minPrice: min, maxPrice: max })); setCurrentPage(1) }
  const onFacetToggle = (facetValueId: string) => { setFilter(prev => ({ ...prev, facetFilters: toggleFacetValue(prev.facetFilters, facetValueId) })); setCurrentPage(1) }
  const onFacetRadioChange = (facetId: string, facetValueId: string) => {
    setFilter(prev => {
      const current = prev.facetFilters ?? []
      const target = facets.find(f => f.id === facetId)
      const removeIds = new Set((target?.facetValues ?? []).map(v => v.id).filter(Boolean) as string[])
      const cleaned = current.filter(ff => !removeIds.has(ff.facetValueId))
      return { ...prev, facetFilters: [...cleaned, { facetValueId }] }
    })
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilter({ brandIds: [], categoryIds: [], condition: [], stockStatus: undefined, minPrice: undefined, maxPrice: undefined, facetFilters: [] })
    setCurrentPage(1)
  }

  const activeFiltersCount =
    (filter.brandIds?.length ?? 0) +
    (filter.condition?.length ?? 0) +
    (filter.stockStatus !== undefined ? 1 : 0) +
    (filter.minPrice !== undefined || filter.maxPrice !== undefined ? 1 : 0) +
    (filter.facetFilters?.length ?? 0)

  useEffect(() => {
    if (!categoryProducts) return
    if (!isFilterEmpty(filter)) return
    if (sortBy !== "featured") return
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    setProducts(categoryProducts.slice(start, end))
    setTotalCount(categoryProducts.length)
  }, [categoryProducts, currentPage, itemsPerPage, filter, sortBy])

  useEffect(() => {
    if (!effectiveFilter) return
    if (isFilterEmpty(filter) && sortBy === "featured") return

    let alive = true
      ; (async () => {
        try {
          setLoadingProducts(true)
          const res = await searchProductsByFilter({
            filter: effectiveFilter,
            page: currentPage,
            pageSize: itemsPerPage,
          })
          if (!alive) return
          setProducts(res.items)
          setTotalCount((res as any).totalCount ?? (res as any).total ?? 0)
        } catch {
          if (!alive) return
          setProducts([])
          setTotalCount(0)
        } finally {
          if (alive) setLoadingProducts(false)
        }
      })()
    return () => { alive = false }
  }, [effectiveFilter, sortBy, currentPage, itemsPerPage])

  if (loading) return (
    <Loading />
  )
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!category) return null

  const subcategories = category.subcategories ?? []
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))
  const buildSubHref = (sub: CategoryModel) => `/search/${sub.id}`

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 lg:gap-8">
          <ProductFilters
            filter={filter}
            onBrandToggle={onBrandToggle}
            onConditionToggle={onConditionToggle}
            onStockChange={onStockChange}
            onPriceChange={onPriceChange}
            onFacetToggle={onFacetToggle}
            onFacetRadioChange={onFacetRadioChange}
            clearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            brands={brands}
            subcategories={subcategories}
            facets={facets}
            buildSubHref={buildSubHref}
          />

          <div className="space-y-4 lg:space-y-6">
            <ProductHeader
              title={category.name ?? ""}
              productCount={totalCount}
              sortBy={sortBy}
              onSortChange={(v) => { setSortBy(v); setCurrentPage(1) }}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filter={filter}
              activeFiltersCount={activeFiltersCount}
              brandLookup={Object.fromEntries(brands.map(b => [b.id, b.name ?? b.id]))}
              onRemoveBrand={(id) => setFilter(f => ({ ...f, brandIds: (f.brandIds ?? []).filter(x => x !== id) }))}
              onRemoveCategory={(id) => setFilter(f => ({ ...f, categoryIds: (f.categoryIds ?? []).filter(x => x !== id) }))}
              onRemoveCondition={(c) => setFilter(f => ({ ...f, condition: (f.condition ?? []).filter(x => x !== c) }))}
              onClearStockStatus={() => setFilter(f => ({ ...f, stockStatus: undefined }))}
              onClearPrice={() => setFilter(f => ({ ...f, minPrice: undefined, maxPrice: undefined }))}
              onRemoveFacet={(vid) => setFilter(f => ({ ...f, facetFilters: (f.facetFilters ?? []).filter(x => x.facetValueId !== vid) }))}
              onClearAll={clearFilters}
            />

            {loadingProducts && !(isFilterEmpty(filter) && sortBy === "featured") ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {cards.map((_, i) => (
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

            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
