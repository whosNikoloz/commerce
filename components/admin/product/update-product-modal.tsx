"use client";

import type { BrandModel } from "@/types/brand";
import type { CategoryModel } from "@/types/category";
import type { ProductFacetValueModel } from "@/types/facet";
import type { ProductRailSectionData } from "@/types/product";


import { useEffect, useMemo, useState } from "react";
import { Box, Clock3, Edit, Layers, X, ChevronRight, ChevronDown, Power, Settings, FileText, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Select as HSelect, SelectItem as HSelectItem } from "@heroui/select";


import { CustomEditor } from "../../wysiwyg-text-custom";
import { GoBackButton } from "../../go-back-button";

import { ProductRailSectionsManager } from "./ProductRailSectionsManager";
import { FacetSelector } from "./facet-selector";

import { parseProductRailSections, stringifyProductRailSections } from "@/types/product";
import { getAllProductGroups, type ProductGroupModel } from "@/app/api/services/productGroupService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { StockStatus, Condition } from "@/types/enums";
import { useDictionary } from "@/app/context/dictionary-provider";

// Simple toggle switch that avoids Radix UI ref composition issues
function SimpleSwitch({
  checked,
  onCheckedChange,
  className = ""
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <button
      aria-checked={checked}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-primary' : 'bg-input'}
        ${className}
      `}
      role="switch"
      type="button"
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`
          pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0
          transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

interface UpdateProductModalProps {
  productId: string;
  initialName?: string;
  initialDescription?: string;
  initialPrice?: number;
  initialDiscountPrice?: number;
  initialBrandId?: string;
  initialCategoryId?: string;
  initialProductGroupId?: string;
  initialIsActive?: boolean;
  initialIsLiquidated?: boolean;
  initialIsComingSoon?: boolean;
  initialIsNewArrival?: boolean;
  initialStockStatus?: StockStatus;
  initialCondition?: Condition;
  initialFacetValues?: ProductFacetValueModel[];
  initialProductAdditionalJson?: string; // JSON string containing ProductRailSectionData[]
  brands?: BrandModel[];
  categories?: CategoryModel[];
  onSave: (
    id: string,
    name: string,
    newDescription: string,
    brandId: string,
    categoryId: string,
    flags: { isActive: boolean; isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean },
    facetValues: ProductFacetValueModel[],
    productGroupId?: string | null,
    stockStatus?: StockStatus,
    condition?: Condition,
    price?: number,
    discountPrice?: number,
    productAdditionalJson?: string // JSON string containing ProductRailSectionData[]
  ) => void | Promise<void>;
}

export default function UpdateProductModal({
  productId,
  initialName = "",
  initialDescription = "",
  initialPrice = 0,
  initialDiscountPrice = 0,
  initialBrandId = "",
  initialCategoryId = "",
  initialProductGroupId = "",
  initialIsActive = true,
  initialIsLiquidated = false,
  initialIsComingSoon = false,
  initialIsNewArrival = false,
  initialStockStatus = StockStatus.InStock,
  initialCondition = Condition.New,
  initialFacetValues = [],
  initialProductAdditionalJson = "",
  brands = [],
  categories = [],
  onSave,
}: UpdateProductModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(initialPrice.toString());
  const [discountPrice, setDiscountPrice] = useState(initialDiscountPrice?.toString() || "");
  const [brandId, setBrandId] = useState(initialBrandId);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [productGroupId, setProductGroupId] = useState(initialProductGroupId);
  const [productGroups, setProductGroups] = useState<ProductGroupModel[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isLiquidated, setIsLiquidated] = useState(initialIsLiquidated);
  const [isComingSoon, setIsComingSoon] = useState(initialIsComingSoon);
  const [isNewArrival, setIsNewArrival] = useState(initialIsNewArrival);
  const [stockStatus, setStockStatus] = useState(initialStockStatus);
  const [condition, setCondition] = useState(initialCondition);
  const [selectedFacetValues, setSelectedFacetValues] = useState<ProductFacetValueModel[]>(initialFacetValues);
  const [productRailSections, setProductRailSections] = useState<ProductRailSectionData[]>(parseProductRailSections(initialProductAdditionalJson));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "description" | "relations">("settings");

  const isMobile = useIsMobile();
  const dictionary = useDictionary();
  const t = dictionary?.admin?.products?.editModal || {};
  const tCommon = dictionary?.common || {};

  // Ensure the form is prefilled with the latest product data every time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setName(initialName);
    setDescription(initialDescription);
    setPrice(initialPrice.toString());
    setDiscountPrice(initialDiscountPrice?.toString() || "");

    // Set brand with fallback to first available brand if initialBrandId is invalid
    const validInitialBrand = brands.some(b => b.id === initialBrandId);

    setBrandId(validInitialBrand ? initialBrandId : (brands.length > 0 ? brands[0].id : ""));

    // Set category with fallback to first available category if initialCategoryId is invalid
    const validInitialCategory = categories.some(c => c.id === initialCategoryId);

    setCategoryId(validInitialCategory ? initialCategoryId : (categories.length > 0 ? categories[0].id : ""));

    setProductGroupId(initialProductGroupId);
    setIsActive(initialIsActive);
    setIsLiquidated(initialIsLiquidated);
    setIsComingSoon(initialIsComingSoon);
    setIsNewArrival(initialIsNewArrival);
    setStockStatus(initialStockStatus);
    setCondition(initialCondition);
    setSelectedFacetValues(initialFacetValues);
    setProductRailSections(parseProductRailSections(initialProductAdditionalJson));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only run when modal opens/closes - initial values are captured at that moment

  // Fetch product groups when modal opens
  useEffect(() => {
    if (isOpen && (categoryId || brandId)) {
      fetchProductGroups();
    }
  }, [isOpen, categoryId, brandId]);

  const fetchProductGroups = async () => {
    if (!categoryId && !brandId) {
      setProductGroups([]);

      return;
    }

    setLoadingGroups(true);
    try {
      const groups = await getAllProductGroups(
        categoryId || undefined,
        brandId || undefined
      );

      // eslint-disable-next-line no-console
      //console.log('🔍 [Update Modal] Fetched product groups:', groups);
      // eslint-disable-next-line no-console
      //console.log('🔍 [Update Modal] First group structure:', groups[0]);
      setProductGroups(groups);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch product groups:", error);
      toast.error("Failed to load product groups");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert(t.nameRequired || "Please enter a product name");

      return;
    }
    if (!brandId || !categoryId) {
      alert("Please select a brand and category");

      return;
    }
    if (!price || parseFloat(price) <= 0) {
      alert(t.priceRequired || "Please enter a valid price");

      return;
    }

    try {
      setLoading(true);
      await Promise.resolve(
        onSave(
          productId,
          name,
          description,
          brandId,
          categoryId,
          { isActive, isLiquidated, isComingSoon, isNewArrival },
          selectedFacetValues,
          productGroupId || null,
          stockStatus,
          condition,
          parseFloat(price),
          discountPrice ? parseFloat(discountPrice) : undefined,
          productRailSections.length > 0 ? stringifyProductRailSections(productRailSections) : undefined
        ),
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };



  const validBrandId = brands.some(b => b.id === brandId) ? brandId : undefined;
  const validCategoryId = categories.some(c => c.id === categoryId) ? categoryId : undefined;
  const brandSelectedKeys = validBrandId ? new Set([validBrandId]) : new Set<string>();

  // Category tree helpers
  const { categoriesByParent, categoriesById } = useMemo(() => {
    const byParent: Record<string, CategoryModel[]> = {};
    const byId: Record<string, CategoryModel> = {};

    categories.forEach((cat) => {
      byId[cat.id] = cat;
      const parentKey = cat.parentId ?? "root";

      byParent[parentKey] = byParent[parentKey] || [];
      byParent[parentKey].push(cat);
    });

    Object.values(byParent).forEach((list) => {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    });

    return { categoriesByParent: byParent, categoriesById: byId };
  }, [categories]);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCategoryTree, setShowCategoryTree] = useState(false);

  // Expand parent categories when a category is selected
  useEffect(() => {
    if (!isOpen || !categoryId) return;

    setExpandedCategories((prev) => {
      const next = new Set(prev);
      let current = categoriesById[categoryId];

      while (current?.parentId) {
        next.add(current.parentId);
        current = categoriesById[current.parentId];
      }

      // Only return new set if something was actually added
      if (next.size === prev.size) return prev;

      return next;
    });
  }, [isOpen, categoryId, categoriesById]);

  // Auto-expand top-level categories that have children so the tree is visible immediately
  useEffect(() => {
    if (!isOpen) return;

    const roots = categoriesByParent["root"] || [];
    const toExpand: string[] = [];

    roots.forEach((root: CategoryModel) => {
      if ((categoriesByParent[root.id] || []).length > 0) {
        toExpand.push(root.id);
      }
    });

    if (toExpand.length === 0) return;

    setExpandedCategories((prev) => {
      // Check if all items are already in the set
      const allAlreadyExpanded = toExpand.every(id => prev.has(id));

      if (allAlreadyExpanded) return prev;

      // preserve existing expansions, but ensure roots with children are open
      const merged = new Set(prev);

      toExpand.forEach((id) => merged.add(id));

      return merged;
    });
  }, [isOpen, categoriesByParent]);

  const getChildren = (parentId: string | null) =>
    categoriesByParent[parentId ?? "root"] || [];

  const renderCategoryTree = (parentId: string | null, depth = 0) => {
    const children = getChildren(parentId);

    if (!children.length) return null;

    return (
      <div
        className={depth > 0 ? "ml-4 pl-3 border-l border-slate-200 dark:border-slate-700" : ""}
      >
        {children.map((cat: CategoryModel) => {
          const hasChildren = getChildren(cat.id).length > 0;
          const isExpanded = expandedCategories.has(cat.id);
          const isSelected = categoryId === cat.id;

          return (
            <div key={cat.id} className="py-0.5">
              <div
                className={[
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-800 dark:text-slate-100 border border-transparent",
                ].join(" ")}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setCategoryId(cat.id);
                  setProductGroupId("");
                  setSelectedFacetValues([]);
                  setShowCategoryTree(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCategoryId(cat.id);
                    setProductGroupId("");
                    setSelectedFacetValues([]);
                    setShowCategoryTree(false);
                  }
                }}
              >
                {hasChildren ? (
                  <button
                    aria-label={isExpanded ? "Collapse category" : "Expand category"}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCategories((prev) => {
                        const next = new Set(prev);

                        next.has(cat.id) ? next.delete(cat.id) : next.add(cat.id);

                        return next;
                      });
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <div className="w-5 h-5" />
                )}

                <span className="flex-1 truncate">{cat.name || "Untitled"}</span>
              </div>

              {hasChildren && isExpanded && renderCategoryTree(cat.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Button
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
        size="sm"
        title="პროდუქტის ჩასწორება"
        onClick={onOpen}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-lg",
          base: "rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh]",
          wrapper: "overflow-hidden",
        }}
        hideCloseButton={true}
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size={isMobile ? "full" : "5xl"}
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-2xl" />

              {isMobile ? (
                <ModalHeader className="flex flex-col gap-2 px-4 pt-6 pb-0 z-50 relative">
                  <div className="flex items-center justify-between gap-2">
                    <GoBackButton onClick={onClose} />
                    <button
                      aria-label="Close modal"
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                      type="button"
                      onClick={onClose}
                    >
                      <X className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                    </button>
                  </div>

                  <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "settings"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Settings className="h-4 w-4" />
                        <span className="text-[10px]">{t.settingsTab || "Settings"}</span>
                      </div>
                    </button>
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "description"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      onClick={() => setActiveTab("description")}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-[10px]">{t.descriptionTab || "Description"}</span>
                      </div>
                    </button>
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "relations"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      onClick={() => setActiveTab("relations")}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Link2 className="h-4 w-4" />
                        <span className="text-[10px]">{t.relationsTab || "Relations"}</span>
                      </div>
                    </button>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col gap-3 pb-3 pt-8 relative">
                  <div className="flex items-center justify-between px-6">
                    <div className="flex flex-col">
                      <h2 className="font-heading text-2xl font-black text-slate-900 dark:text-slate-100">
                        {t.title || "Update Product"}
                      </h2>
                      <p className="font-primary text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t.subtitle || "Update product information and description"}
                      </p>
                    </div>
                    <button
                      aria-label="Close modal"
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                      type="button"
                      onClick={onClose}
                    >
                      <X className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                    </button>
                  </div>

                  <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 px-6">
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "settings"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t.settingsTab || "Settings"}
                      </div>
                    </button>
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "description"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      onClick={() => setActiveTab("description")}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t.descriptionTab || "Description"}
                      </div>
                    </button>
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${activeTab === "relations"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      onClick={() => setActiveTab("relations")}
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        {t.relationsTab || "Relations"}
                      </div>
                    </button>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className={`py-4 overflow-hidden ${isMobile ? "px-4" : "px-6"}`}>
                {/* Tab Content */}
                {activeTab === "settings" && (
                  <div className={`space-y-4 overflow-y-auto ${isMobile ? "h-[calc(100vh-12rem)]" : "h-[calc(100vh-16rem)]"}`}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    }}>
                    {/* Product Name */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                        {t.productName || "Product Name"}
                      </Label>
                      <Input
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                        placeholder={t.productNamePlaceholder || "Enter product name"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    {/* Pricing */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                        {t.pricing || "Pricing"}
                      </Label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                        {t.pricingDescription || "Set the product price and optional discount price."}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[11px] text-slate-600 dark:text-slate-400 mb-1 block">
                            {t.price || "Price"} *
                          </Label>
                          <Input
                            required
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                            min="0"
                            placeholder="0.00"
                            step="0.01"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-slate-600 dark:text-slate-400 mb-1 block">
                            {t.discountPrice || "Discount Price"}
                          </Label>
                          <Input
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                            min="0"
                            placeholder="0.00"
                            step="0.01"
                            type="number"
                            value={discountPrice}
                            onChange={(e) => setDiscountPrice(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <div className="mb-2">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {t.category || "Category"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.editCategoryDescription || "Edit category selection from the tree."}
                        </p>
                      </div>
                      {categories.length > 0 ? (
                        <div className="space-y-2">
                          <Button
                            className="w-full justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            type="button"
                            variant="outline"
                            onClick={() => setShowCategoryTree((prev) => !prev)}
                          >
                            <span className="truncate text-left">
                              {categoryId && categoriesById[categoryId]
                                ? categoriesById[categoryId].name
                                : "Select category"}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 opacity-60 transition-transform ${showCategoryTree ? "rotate-180" : ""}`}
                            />
                          </Button>

                          {showCategoryTree && (
                            <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-2">
                              {renderCategoryTree(null)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          No categories available. Check console for errors.
                        </div>
                      )}
                    </div>

                    {/* Brand Selection */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                        {t.brand || "Brand"}
                      </Label>
                      {brands.length > 0 ? (
                        <HSelect
                          label={t.brand || "Brand"}
                          // remove disallowEmptySelection OR ensure you always have a valid key
                          // disallowEmptySelection
                          selectedKeys={brandSelectedKeys}
                          selectionMode="single"
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const k = Array.from(keys)[0] as string | undefined;

                            setBrandId(k ?? "");
                            setProductGroupId("");
                          }}
                        >
                          {brands.map((b) => (
                            <HSelectItem key={String(b.id)} textValue={b.name}>
                              {b.name}
                            </HSelectItem>
                          ))}
                        </HSelect>
                      ) : (
                        <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          No brands available. Check console for errors.
                        </div>
                      )}
                    </div>

                    {/* Flag switches */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                        <SimpleSwitch
                          checked={isActive}
                          className={isActive ? "!bg-gradient-to-r !from-green-500 !to-green-600" : ""}
                          onCheckedChange={setIsActive}
                        />
                        <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                          <Power className="w-3 h-3 mb-0.5" />
                          {t.active || tCommon.active || "Active"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                        <SimpleSwitch
                          checked={isLiquidated}
                          className={isLiquidated ? "!bg-gradient-to-r !from-rose-500 !to-rose-600" : ""}
                          onCheckedChange={setIsLiquidated}
                        />
                        <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                          <Box className="w-3 h-3 mb-0.5" />
                          {t.liquidation || tCommon.liquidation || "Liq."}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                        <SimpleSwitch
                          checked={isComingSoon}
                          className={isComingSoon ? "!bg-gradient-to-r !from-violet-500 !to-indigo-600" : ""}
                          onCheckedChange={setIsComingSoon}
                        />
                        <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                          <Clock3 className="w-3 h-3 mb-0.5" />
                          {t.comingSoon || tCommon.comingSoon || "Soon"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                        <SimpleSwitch
                          checked={isNewArrival}
                          className={isNewArrival ? "!bg-gradient-to-r !from-emerald-500 !to-emerald-600" : ""}
                          onCheckedChange={setIsNewArrival}
                        />
                        <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                          <Sparkles className="w-3 h-3 mb-0.5" />
                          {t.new || tCommon.new || "New"}
                        </span>
                      </div>
                    </div>

                    {/* Product Group Selector */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                        {t.productGroup || "Product Group"}
                      </Label>
                      {loadingGroups ? (
                        <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          {tCommon.loading || "Loading..."}
                        </div>
                      ) : (
                        <HSelect
                          label={t.productGroup || "Product Group"}
                          placeholder={t.noneStandalone || "None (standalone product)"}
                          selectedKeys={productGroupId ? new Set([productGroupId]) : new Set(["none"])}
                          selectionMode="single"
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const k = Array.from(keys)[0] as string | undefined;

                            // eslint-disable-next-line no-console
                            console.log('✅ [Update Modal] Selected productGroupId:', k);
                            setProductGroupId(k === "none" ? "" : k ?? "");
                          }}
                        >
                          {[
                            <HSelectItem key="none" textValue={t.noneStandalone || "None (standalone product)"}>
                              {t.noneStandalone || "None (standalone product)"}
                            </HSelectItem>,
                            ...productGroups.map((group) => {
                              // eslint-disable-next-line no-console
                              //console.log('🔍 [Update Modal] Rendering group:', { id: group.id, name: group.name, fullObject: group });

                              return (
                                <HSelectItem key={group.id} textValue={group.name}>
                                  {group.name} (ID: {group.id})
                                </HSelectItem>
                              );
                            })
                          ]}
                        </HSelect>
                      )}
                    </div>

                    {/* Stock Status & Condition */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                        {t.inventoryCondition || "Inventory & Condition"}
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <HSelect
                          label={t.stockStatus || "Stock Status"}
                          selectedKeys={new Set([stockStatus.toString()])}
                          selectionMode="single"
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const k = Array.from(keys)[0] as string | undefined;

                            setStockStatus(k ? parseInt(k) as StockStatus : StockStatus.InStock);
                          }}
                        >
                          <HSelectItem key={StockStatus.InStock.toString()} textValue={tCommon.inStock || "In Stock"}>
                            {tCommon.inStock || "In Stock"}
                          </HSelectItem>
                          <HSelectItem key={StockStatus.OutOfStock.toString()} textValue={tCommon.soldOut || "Out of Stock"}>
                            {tCommon.soldOut || "Out of Stock"}
                          </HSelectItem>
                        </HSelect>

                        <HSelect
                          label={t.condition || "Condition"}
                          selectedKeys={new Set([condition.toString()])}
                          selectionMode="single"
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const k = Array.from(keys)[0] as string | undefined;

                            setCondition(k ? parseInt(k) as Condition : Condition.New);
                          }}
                        >
                          <HSelectItem key={Condition.New.toString()} textValue={tCommon.new || "New"}>
                            {tCommon.new || "New"}
                          </HSelectItem>
                          <HSelectItem key={Condition.Used.toString()} textValue={tCommon.used || "Used"}>
                            {tCommon.used || "Used"}
                          </HSelectItem>
                          <HSelectItem key={Condition.LikeNew.toString()} textValue={tCommon.likeNew || "Like New"}>
                            {tCommon.likeNew || "Like New"}
                          </HSelectItem>
                        </HSelect>
                      </div>
                    </div>

                    {/* Facets */}
                    {categoryId && (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 p-3">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {t.productFacets || "Product Facets"}
                        </Label>
                        <FacetSelector
                          categoryId={categoryId}
                          selectedFacetValues={selectedFacetValues}
                          onChange={setSelectedFacetValues}
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "description" && (
                  <div className={`${isMobile ? "h-[calc(100vh-12rem)]" : "h-[60vh] min-h-[400px]"}`}>
                    <CustomEditor value={description} onChange={setDescription} />
                  </div>
                )}

                {activeTab === "relations" && (
                  <div className={`overflow-y-auto ${isMobile ? "h-[calc(100vh-12rem)]" : "h-[calc(100vh-16rem)]"}`}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    }}>
                    <ProductRailSectionsManager
                      brands={brands}
                      categories={categories}
                      locales={["ka", "en"]}
                      sections={productRailSections}
                      onChange={setProductRailSections}
                    />
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="gap-3 rounded-2xl px-6 py-5    relative">
                <Button
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  disabled={loading}
                  variant="outline"
                  onClick={onClose}
                >
                  {dictionary?.admin?.products?.addModal?.cancel || "Cancel"}
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                  onClick={handleSave}
                >
                  {loading ? (
                    <span className="font-primary flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {tCommon.loading || "Saving..."}
                    </span>
                  ) : (
                    dictionary?.common?.success === "წარმატებული" ? "შენახვა" : "Save"
                  )}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent >
      </Modal >
    </>
  );
}
