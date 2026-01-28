"use client";

import { LocalizedTextInput } from "./LocalizedTextInput";
import { CategoryTreeSelectMulti } from "./CategoryTreeSelectMulti";
import type { ProductRailSectionData, LocalizedText } from "@/types/product";
import type { CategoryModel } from "@/types/category";
import type { BrandModel } from "@/types/brand";
import { useDictionary } from "@/app/context/dictionary-provider";

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
    limit: data?.limit || 12,
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

  const addBrandId = (id: string) => {
    if (currentBrandIds.includes(id)) return;
    updateFilterField("brandIds", [...currentBrandIds, id]);
  };

  const removeBrandId = (id: string) => {
    updateFilterField(
      "brandIds",
      currentBrandIds.filter((x) => x !== id)
    );
  };

  return (
    <div className="space-y-5">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
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
            type="text"
            value={safeData.customName || ""}
            onChange={(e) => updateField("customName", e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
            placeholder={t.customNamePlaceholder || "e.g., Same Brand Products, Related Items"}
          />
        </div>

        <LocalizedTextInput
          label={t.sectionTitle || "Section Title"}
          value={safeData.title}
          onChange={(value) => updateField("title", value)}
          required
          locales={locales}
        />

        <LocalizedTextInput
          label={t.sectionSubtitle || "Section Subtitle"}
          value={safeData.subtitle || { en: "", ka: "" }}
          onChange={(value) => updateField("subtitle", value)}
          locales={locales}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.layout || "Layout"} <span className="text-red-500">*</span>
            </label>
            <select
              value={safeData.layout}
              onChange={(e) => updateField("layout", e.target.value as "carousel" | "grid")}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
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
                value={safeData.columns || 3}
                onChange={(e) =>
                  updateField("columns", parseInt(e.target.value) as 2 | 3 | 4 | 5 | 6)
                }
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.limit || "Number of Products"} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={safeData.limit}
              onChange={(e) => updateField("limit", parseInt(e.target.value) || 12)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.viewAllLink || "View All Link"}
            </label>
            <input
              type="text"
              value={safeData.viewAllHref || ""}
              onChange={(e) => updateField("viewAllHref", e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
              placeholder="/products"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {t.sortBy || "Sort By"}
          </label>
          <select
            value={safeData.sortBy || "featured"}
            onChange={(e) => updateField("sortBy", e.target.value as ProductRailSectionData["sortBy"])}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
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

      {/* Quick Filters (Use Current Product) */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-emerald-500 rounded-full" />
          {t.quickFilters || "Quick Filters"}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={safeData.filterBy?.useCurrentProductCategory || false}
              onChange={(e) => updateFilterField("useCurrentProductCategory", e.target.checked || undefined)}
              className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              {t.useCurrentCategory || "Same category as this product"}
            </span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={safeData.filterBy?.useCurrentProductBrand || false}
              onChange={(e) => updateFilterField("useCurrentProductBrand", e.target.checked || undefined)}
              className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              {t.useCurrentBrand || "Same brand as this product"}
            </span>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-violet-500 rounded-full" />
          {t.filters || "Product Filters"}
        </h4>

        <div className="space-y-4">
          {/* Categories */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.categories || "Categories"}
            </label>
            <CategoryTreeSelectMulti
              categories={categories}
              selectedIds={currentCategoryIds}
              onSelectionChange={(ids) => updateFilterField("categoryIds", ids)}
              emptyState={t.noCategoriesLoaded || "No categories loaded."}
            />
          </div>

          {/* Brands */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t.brands || "Brands"}
            </label>

            {brands.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-auto border border-dashed border-slate-200 dark:border-slate-700 rounded-md p-2 bg-white/50 dark:bg-slate-900/30">
                {brands.map((brand) => {
                  const selected = currentBrandIds.includes(brand.id);
                  const thumbnail = brand.images?.[0];

                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => (selected ? removeBrandId(brand.id) : addBrandId(brand.id))}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      }`}
                    >
                      {thumbnail && (
                        <img
                          src={thumbnail}
                          alt={brand.name || brand.id}
                          className="w-5 h-5 rounded object-cover border border-white/50 shadow-sm"
                        />
                      )}
                      <span>{brand.name || brand.id}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.noBrandsLoaded || "No brands loaded."}
              </p>
            )}

            {/* Selected badges */}
            {currentBrandIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentBrandIds.map((id) => {
                  const brand = brands.find((b) => b.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100"
                    >
                      {brand?.name || id}
                      <button
                        type="button"
                        onClick={() => removeBrandId(id)}
                        className="text-blue-500 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t.minPrice || "Min Price"}
              </label>
              <input
                type="number"
                value={safeData.filterBy?.minPrice || ""}
                onChange={(e) =>
                  updateFilterField("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {t.maxPrice || "Max Price"}
              </label>
              <input
                type="number"
                value={safeData.filterBy?.maxPrice || ""}
                onChange={(e) =>
                  updateFilterField("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                placeholder="1000"
                min="0"
              />
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safeData.filterBy?.isNewArrival || false}
                onChange={(e) => updateFilterField("isNewArrival", e.target.checked || undefined)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {t.isNewArrival || "New Arrivals Only"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safeData.filterBy?.isLiquidated || false}
                onChange={(e) => updateFilterField("isLiquidated", e.target.checked || undefined)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {t.isLiquidated || "Liquidated Items Only"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safeData.filterBy?.isComingSoon || false}
                onChange={(e) => updateFilterField("isComingSoon", e.target.checked || undefined)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {t.isComingSoon || "Coming Soon Only"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safeData.filterBy?.hasDiscount || false}
                onChange={(e) => updateFilterField("hasDiscount", e.target.checked || undefined)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {t.hasDiscount || "Discounted Items Only"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
