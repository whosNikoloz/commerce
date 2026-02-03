"use client";

import type { ProductRailSectionData, ProductResponseModel } from "@/types/product";
import type { CategoryModel } from "@/types/category";
import type { BrandModel } from "@/types/brand";

import { useState, useEffect } from "react";

import { CategoryTreeSelectMulti } from "./CategoryTreeSelectMulti";
import { LocalizedTextInput } from "./LocalizedTextInput";

import { getCoverImageUrl } from "@/types/product";
import { useDictionary } from "@/app/context/dictionary-provider";
import { searchProducts } from "@/app/api/services/productService";

interface ProductRailSectionEditorProps {
  data: ProductRailSectionData;
  onChange: (data: ProductRailSectionData) => void;
  categories: CategoryModel[];
  brands: BrandModel[];
  locales?: string[];
}

export function ProductRailSectionEditor({
  data,
  onChange,
  categories,
  brands,
  locales = ["ka", "en"],
}: ProductRailSectionEditorProps) {
  const dictionary = useDictionary();
  const t = dictionary?.admin?.products?.editModal?.sections || {};

  // Ensure all required fields have default values
  const safeData: ProductRailSectionData = {
    id: data?.id || "",
    customName: data?.customName,
    title: data?.title || { en: "", ka: "" },
    subtitle: data?.subtitle,
    layout: data?.layout || "carousel",
    columns: data?.columns,
    viewAllHref: data?.viewAllHref || "",
    enabled: data?.enabled ?? true,
    order: data?.order || 0,
    sortBy: data?.sortBy || "featured",
    filterBy: data?.filterBy || {},
  };

  const updateField = <K extends keyof ProductRailSectionData>(
    field: K,
    value: ProductRailSectionData[K]
  ) => {
    onChange({ ...safeData, [field]: value });
  };

  const updateFilterField = <K extends keyof NonNullable<ProductRailSectionData["filterBy"]>>(
    field: K,
    value: NonNullable<ProductRailSectionData["filterBy"]>[K]
  ) => {
    onChange({
      ...safeData,
      filterBy: { ...(safeData.filterBy || {}), [field]: value },
    });
  };

  const currentCategoryIds = safeData.filterBy?.categoryIds || [];
  const currentBrandIds = safeData.filterBy?.brandIds || [];
  const currentProductIds = safeData.filterBy?.productIds || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductResponseModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search for products
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);

        return;
      }

      setIsSearching(true);
      try {
        const result = await searchProducts(searchTerm, "name", "asc", 1, 20);

        setSearchResults(result.items || []);
      } catch (err) {
        console.error("Product search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const toggleProductId = (productId: string) => {
    const nextIds = currentProductIds.includes(productId)
      ? currentProductIds.filter((id) => id !== productId)
      : [...currentProductIds, productId];

    updateFilterField("productIds", nextIds.length > 0 ? nextIds : undefined);
  };

  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <div className="space-y-4 shadow-sm border border-slate-200 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <span className="w-1 h-4 bg-blue-500 rounded-full" />
          {t.basicInfo || "Basic Information"}
        </h4>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {t.customName || "Custom Name"}{" "}
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">
              ({t.forAdminOnly || "for admin identification"})
            </span>
          </label>
          <input
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
            placeholder={t.customNamePlaceholder || "e.g., Same Brand Products, Related Items"}
            type="text"
            value={safeData.customName || ""}
            onChange={(e) => updateField("customName", e.target.value)}
          />
        </div>

        <LocalizedTextInput
          required
          label={t.sectionTitle || "Section Title"}
          locales={locales}
          value={safeData.title}
          onChange={(value) => updateField("title", value)}
        />

        <LocalizedTextInput
          label={t.sectionSubtitle || "Section Subtitle"}
          locales={locales}
          value={safeData.subtitle || { en: "", ka: "" }}
          onChange={(value) => updateField("subtitle", value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.layout || "Layout"} <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
              value={safeData.layout}
              onChange={(e) => updateField("layout", e.target.value as "carousel" | "grid")}
            >
              <option value="carousel">{t.carousel || "Carousel"}</option>
              <option value="grid">{t.grid || "Grid"}</option>
            </select>
          </div>

          {safeData.layout === "grid" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t.columns || "Grid Columns"}
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                value={safeData.columns || 3}
                onChange={(e) =>
                  updateField("columns", parseInt(e.target.value) as 2 | 3 | 4 | 5 | 6)
                }
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
                <option value="5">5 Columns</option>
                <option value="6">6 Columns</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.viewAllLink || "View All Link"}
            </label>
            <input
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
              placeholder="/products"
              type="text"
              value={safeData.viewAllHref || ""}
              onChange={(e) => updateField("viewAllHref", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.sortBy || "Sort By"}
            </label>
            <select
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
              value={safeData.sortBy || "featured"}
              onChange={(e) => updateField("sortBy", e.target.value as ProductRailSectionData["sortBy"])}
            >
              <option value="featured">{t.sortFeatured || "Featured"}</option>
              <option value="newest">{t.sortNewest || "Newest"}</option>
              <option value="price-low">{t.sortPriceLow || "Price: Low to High"}</option>
              <option value="price-high">{t.sortPriceHigh || "Price: High to Low"}</option>
              <option value="rating">{t.sortRating || "Rating"}</option>
              <option value="name">{t.sortName || "Name"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filters (Use Current Product) */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500 rounded-full" />
          {t.quickFilters || "Quick Filters"}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/10 dark:bg-emerald-900/10 cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-900/20 transition-all group">
            <input
              checked={safeData.filterBy?.useCurrentProductCategory || false}
              className="rounded-full border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 w-4 h-4"
              type="checkbox"
              onChange={(e) => updateFilterField("useCurrentProductCategory", e.target.checked || undefined)}
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {t.useCurrentCategory || "Same category as this product"}
            </span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/10 dark:bg-emerald-900/10 cursor-pointer hover:bg-emerald-50/20 dark:hover:bg-emerald-900/20 transition-all group">
            <input
              checked={safeData.filterBy?.useCurrentProductBrand || false}
              className="rounded-full border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 w-4 h-4"
              type="checkbox"
              onChange={(e) => updateFilterField("useCurrentProductBrand", e.target.checked || undefined)}
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {t.useCurrentBrand || "Same brand as this product"}
            </span>
          </label>
        </div>
      </div>

      {/* Detailed Filters (Same as Category Page) */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-500 rounded-full" />
          {t.detailedFilters || "Detailed Filters"}
        </h4>

        <div className="space-y-5">
          {/* PRODUCT SELECTION */}
          <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              {t.filterProducts || "Select Products Manually"}
            </label>

            <div className="relative">
              <input
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pl-9"
                placeholder={t.searchPlaceholder || "Search products to add..."}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                {searchResults.map((p) => {
                  const isSelected = currentProductIds.includes(p.id);

                  return (
                    <button
                      key={p.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-all ${isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                        }`}
                      type="button"
                      onClick={() => toggleProductId(p.id)}
                    >
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex-shrink-0 relative overflow-hidden">
                        {getCoverImageUrl(p.images) ? (
                          <img alt="" className="w-full h-full object-cover" src={getCoverImageUrl(p.images)!} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">?</div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-600 text-lg font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate opacity-60">ID: {p.id}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentProductIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentProductIds.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 border border-blue-200 dark:border-blue-800 font-medium">
                    {id}
                    <button
                      className="text-blue-500 hover:text-red-500 transition-colors"
                      type="button"
                      onClick={() => toggleProductId(id)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              {t.filterCategories || "Filter by Categories"}
            </label>
            <CategoryTreeSelectMulti
              categories={categories}
              emptyState={t.noCategoriesLoaded || "No categories loaded."}
              selectedIds={currentCategoryIds}
              onSelectionChange={(ids) => updateFilterField("categoryIds", ids.length > 0 ? ids : undefined)}
            />

            {/* Selected category badges */}
            {currentCategoryIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentCategoryIds.map((id) => {
                  const cat = categories.find((c) => c.id === id);

                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 border border-blue-200 dark:border-blue-800 font-medium"
                    >
                      {cat?.name || id}
                      <button
                        className="text-blue-500 hover:text-red-500 transition-colors ml-0.5"
                        type="button"
                        onClick={() => {
                          const newIds = currentCategoryIds.filter((cid) => cid !== id);

                          updateFilterField("categoryIds", newIds.length > 0 ? newIds : undefined);
                        }}
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              {t.filterBrands || "Filter by Brands"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer group p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors truncate">
                  <input
                    checked={currentBrandIds.includes(brand.id)}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 h-3.5 w-3.5"
                    type="checkbox"
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...currentBrandIds, brand.id]
                        : currentBrandIds.filter((id) => id !== brand.id);

                      updateFilterField("brandIds", newIds.length > 0 ? newIds : undefined);
                    }}
                  />
                  {brand.images?.[0] && (
                    <img
                      alt={brand.name || brand.id}
                      className="w-4 h-4 rounded object-cover border border-slate-200 dark:border-slate-700"
                      src={brand.images[0]}
                    />
                  )}
                  <span className="truncate">
                    {brand.name}
                  </span>
                </label>
              ))}
            </div>

            {/* Brand Badges */}
            {currentBrandIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentBrandIds.map((id) => {
                  const brand = brands.find((b) => b.id === id);

                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 border border-blue-200 dark:border-blue-800 font-medium"
                    >
                      {brand?.images?.[0] && (
                        <img
                          alt={brand?.name || id}
                          className="w-4 h-4 rounded-full object-cover border border-white/50 shadow-sm"
                          src={brand.images[0]}
                        />
                      )}
                      <span className="truncate max-w-[100px]">{brand?.name || id}</span>
                      <button
                        className="text-blue-500 hover:text-red-500 transition-colors ml-0.5"
                        type="button"
                        onClick={() => {
                          const newIds = currentBrandIds.filter((bid) => bid !== id);

                          updateFilterField("brandIds", newIds.length > 0 ? newIds : undefined);
                        }}
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t.minPrice || "Min Price"}
              </label>
              <input
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                placeholder="0"
                type="number"
                value={safeData.filterBy?.minPrice || ""}
                onChange={(e) =>
                  updateFilterField("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t.maxPrice || "Max Price"}
              </label>
              <input
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                placeholder="Any"
                type="number"
                value={safeData.filterBy?.maxPrice || ""}
                onChange={(e) =>
                  updateFilterField("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { field: "isNewArrival", label: t.isNewArrival || "New Arrivals" },
              { field: "isLiquidated", label: t.isLiquidated || "On Liquidation" },
              { field: "isComingSoon", label: t.isComingSoon || "Coming Soon" },
              { field: "hasDiscount", label: t.hasDiscount || "With Discount" },
            ].map((item) => (
              <label key={item.field} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                <input
                  checked={!!(safeData.filterBy as any)?.[item.field]}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 w-4 h-4"
                  type="checkbox"
                  onChange={(e) => updateFilterField(item.field as any, e.target.checked || undefined)}
                />
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group">
                <input
                  checked={safeData.filterBy?.isRandom || false}
                  className="rounded-full border-blue-300 dark:border-blue-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 w-4 h-4"
                  type="checkbox"
                  onChange={(e) => updateFilterField("isRandom", e.target.checked || undefined)}
                />
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                  {t.randomOrder || "Show in Random Order"}
                </span>
              </label>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 mb-1 uppercase tracking-wider px-1">
                  {t.productCount || "Product Count"}
                </label>
                <input
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-center font-bold"
                  min="1"
                  placeholder="Count"
                  type="number"
                  value={safeData.filterBy?.productCount || "12"}
                  onChange={(e) =>
                    updateFilterField("productCount", e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
