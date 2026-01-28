"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Power,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  SlidersHorizontal
} from "lucide-react";
import { ProductRailSectionEditor } from "./ProductRailSectionEditor";
import type { ProductRailSectionData, LocalizedText } from "@/types/product";
import type { CategoryModel } from "@/types/category";
import type { BrandModel } from "@/types/brand";
import { useDictionary } from "@/app/context/dictionary-provider";
import { Button } from "@/components/ui/button";

interface ProductRailSectionsManagerProps {
  sections: ProductRailSectionData[];
  onChange: (sections: ProductRailSectionData[]) => void;
  categories: CategoryModel[];
  brands: BrandModel[];
  locales?: string[];
}

// Generate unique ID
function generateId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create default section
function createDefaultSection(order: number): ProductRailSectionData {
  return {
    id: generateId(),
    customName: "",
    title: { en: "", ka: "" },
    subtitle: { en: "", ka: "" },
    layout: "carousel",
    limit: 12,
    viewAllHref: "",
    enabled: true,
    order,
    sortBy: "featured",
    filterBy: {},
  };
}

export function ProductRailSectionsManager({
  sections,
  onChange,
  categories,
  brands,
  locales = ["ka", "en"],
}: ProductRailSectionsManagerProps) {
  const dictionary = useDictionary();
  const t = dictionary?.admin?.products?.editModal?.sections || {};

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addSection = () => {
    const newSection = createDefaultSection(sections.length);
    onChange([...sections, newSection]);
    setExpandedIds((prev) => new Set(prev).add(newSection.id));
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateSection = (id: string, data: ProductRailSectionData) => {
    onChange(sections.map((s) => (s.id === id ? data : s)));
  };

  const toggleEnabled = (id: string) => {
    onChange(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sortedSections];
    // Swap orders
    const currentOrder = newSections[index].order;
    newSections[index].order = newSections[index - 1].order;
    newSections[index - 1].order = currentOrder;
    onChange(newSections);
  };

  const moveDown = (index: number) => {
    if (index === sortedSections.length - 1) return;
    const newSections = [...sortedSections];
    // Swap orders
    const currentOrder = newSections[index].order;
    newSections[index].order = newSections[index + 1].order;
    newSections[index + 1].order = currentOrder;
    onChange(newSections);
  };

  // Get display title for section
  const getSectionTitle = (section: ProductRailSectionData): string => {
    if (section.customName) return section.customName;
    const titleKa = section.title?.ka;
    const titleEn = section.title?.en;
    return titleKa || titleEn || t.untitledSection || "Untitled Section";
  };

  // Get filter summary
  const getFilterSummary = (section: ProductRailSectionData): string => {
    const parts: string[] = [];

    if (section.filterBy?.useCurrentProductCategory) {
      parts.push(t.sameCategory || "Same Category");
    }
    if (section.filterBy?.useCurrentProductBrand) {
      parts.push(t.sameBrand || "Same Brand");
    }
    if (section.filterBy?.categoryIds?.length) {
      parts.push(`${section.filterBy.categoryIds.length} ${t.categoriesSelected || "categories"}`);
    }
    if (section.filterBy?.brandIds?.length) {
      parts.push(`${section.filterBy.brandIds.length} ${t.brandsSelected || "brands"}`);
    }
    if (section.filterBy?.isNewArrival) parts.push(t.newArrivals || "New");
    if (section.filterBy?.isLiquidated) parts.push(t.liquidated || "Liquidated");
    if (section.filterBy?.hasDiscount) parts.push(t.discounted || "Discounted");

    return parts.length > 0 ? parts.join(" | ") : t.noFilters || "No filters";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.title || "Product Rail Sections"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle || "Configure product sections displayed on the product detail page."}
          </p>
        </div>
        <Button
          type="button"
          onClick={addSection}
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t.addSection || "Add Section"}
        </Button>
      </div>

      {/* Sections List */}
      {sortedSections.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <LayoutGrid className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {t.noSections || "No sections configured."}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {t.noSectionsHint || "Add a section to display related products on the product page."}
          </p>
          <Button
            type="button"
            onClick={addSection}
            size="sm"
            variant="outline"
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t.addFirstSection || "Add First Section"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSections.map((section, index) => {
            const isExpanded = expandedIds.has(section.id);

            return (
              <div
                key={section.id}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  section.enabled
                    ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-70"
                }`}
              >
                {/* Section Header */}
                <div
                  role="button"
                  tabIndex={0}
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleExpand(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(section.id);
                    }
                  }}
                >
                  <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${
                        section.enabled
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-500 dark:text-slate-500"
                      }`}>
                        {getSectionTitle(section)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        section.layout === "carousel"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                          : "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                      }`}>
                        {section.layout}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {section.limit} {t.products || "products"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 truncate mt-0.5">
                      <SlidersHorizontal className="h-3 w-3 inline mr-1" />
                      {getFilterSummary(section)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div
                    role="toolbar"
                    aria-label="Section actions"
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={t.moveUp || "Move up"}
                    >
                      <ArrowUp className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === sortedSections.length - 1}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={t.moveDown || "Move down"}
                    >
                      <ArrowDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleEnabled(section.id)}
                      className={`p-1.5 rounded transition-colors ${
                        section.enabled
                          ? "hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600"
                      }`}
                      title={section.enabled ? t.disable || "Disable" : t.enable || "Enable"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                      title={t.remove || "Remove"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Section Editor (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <ProductRailSectionEditor
                      data={section}
                      onChange={(data) => updateSection(section.id, data)}
                      categories={categories}
                      brands={brands}
                      locales={locales}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Help text */}
      {sortedSections.length > 0 && (
        <p className="text-[11px] text-slate-500 dark:text-slate-500 text-center">
          {t.helpText || "Sections are displayed in order on the product detail page. Use the arrows to reorder."}
        </p>
      )}
    </div>
  );
}
