"use client";

import type { BrandModel } from "@/types/brand";
import type { CategoryModel } from "@/types/category";
import type { ProductFacetValueModel } from "@/types/facet";

import { useEffect, useMemo, useState } from "react";
import { Box, Clock3, Edit, Sparkles, Layers, X, ChevronRight, ChevronDown } from "lucide-react";
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

import { FacetSelector } from "./facet-selector";

import { getAllProductGroups, type ProductGroupModel } from "@/app/api/services/productGroupService";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";


interface UpdateProductModalProps {
  productId: string;
  initialDescription?: string;
  initialBrandId?: string;
  initialCategoryId?: string;
  initialProductGroupId?: string;
  initialIsLiquidated?: boolean;
  initialIsComingSoon?: boolean;
  initialIsNewArrival?: boolean;
  initialFacetValues?: ProductFacetValueModel[];
  brands?: BrandModel[];
  categories?: CategoryModel[];
  onSave: (
    id: string,
    newDescription: string,
    brandId: string,
    categoryId: string,
    flags: { isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean },
    facetValues: ProductFacetValueModel[],
    productGroupId?: string | null,
  ) => void | Promise<void>;
}

export default function UpdateProductModal({
  productId,
  initialDescription = "",
  initialBrandId = "",
  initialCategoryId = "",
  initialProductGroupId = "",
  initialIsLiquidated = false,
  initialIsComingSoon = false,
  initialIsNewArrival = false,
  initialFacetValues = [],
  brands = [],
  categories = [],
  onSave,
}: UpdateProductModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [description, setDescription] = useState(initialDescription);
  const [brandId, setBrandId] = useState(initialBrandId);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [productGroupId, setProductGroupId] = useState(initialProductGroupId);
  const [productGroups, setProductGroups] = useState<ProductGroupModel[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isLiquidated, setIsLiquidated] = useState(initialIsLiquidated);
  const [isComingSoon, setIsComingSoon] = useState(initialIsComingSoon);
  const [isNewArrival, setIsNewArrival] = useState(initialIsNewArrival);
  const [selectedFacetValues, setSelectedFacetValues] = useState<ProductFacetValueModel[]>(initialFacetValues);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "description">("settings");

  const isMobile = useIsMobile();

  // Ensure the form is prefilled with the latest product data every time the modal opens
  useEffect(() => {
    if (!isOpen) return;

    setDescription(initialDescription);
    setBrandId(initialBrandId);
    setCategoryId(initialCategoryId);
    setProductGroupId(initialProductGroupId);
    setIsLiquidated(initialIsLiquidated);
    setIsComingSoon(initialIsComingSoon);
    setIsNewArrival(initialIsNewArrival);
    setSelectedFacetValues(initialFacetValues);
  }, [
    isOpen,
    initialDescription,
    initialBrandId,
    initialCategoryId,
    initialProductGroupId,
    initialIsLiquidated,
    initialIsComingSoon,
    initialIsNewArrival,
    initialFacetValues,
  ]);

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
    if (!brandId || !categoryId) {
      alert("Please select a brand and category");

      return;
    }

    try {
      setLoading(true);
      await Promise.resolve(
        onSave(
          productId,
          description,
          brandId,
          categoryId,
          { isLiquidated, isComingSoon, isNewArrival },
          selectedFacetValues,
          productGroupId || null
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

  useEffect(() => {
    if (!categoryId) return;

    setExpandedCategories((prev) => {
      const next = new Set(prev);
      let current = categoriesById[categoryId];

      while (current?.parentId) {
        next.add(current.parentId);
        current = categoriesById[current.parentId];
      }

      return next;
    });
  }, [categoryId, categoriesById]);

  // Auto-expand top-level categories that have children so the tree is visible immediately
  useEffect(() => {
    const roots = categoriesByParent["root"] || [];
    const next = new Set<string>();

    roots.forEach((root: CategoryModel) => {
      if ((categoriesByParent[root.id] || []).length > 0) {
        next.add(root.id);
      }
    });

    setExpandedCategories((prev) => {
      // preserve existing expansions, but ensure roots with children are open
      const merged = new Set(prev);

      next.forEach((id) => merged.add(id));

      return merged;
    });
  }, [categoriesByParent]);

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

   useEffect(() => {
      if (!validBrandId && brands.length > 0) {
        setBrandId(brands[0].id); 
      }
    }, [brands, validBrandId]);

   useEffect(() => {
      if (!validCategoryId && categories.length > 0) {
        setCategoryId(categories[0].id);
      }
    }, [categories, validCategoryId]);

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
          base: "rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-2xl",
        }}
        hideCloseButton={true}
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size={isMobile ? "full" : "4xl"}
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
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

                  {/* Tabs for Mobile */}
                  <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                        activeTab === "settings"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                        activeTab === "description"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      onClick={() => setActiveTab("description")}
                    >
                      📝 Description
                    </button>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col gap-3 pb-3 pt-8 relative">
                  <div className="flex items-center justify-between px-6">
                    <div className="flex flex-col">
                      <h2 className="font-heading text-2xl font-black text-slate-900 dark:text-slate-100">
                        პროდუქტის აღწერის განახლება
                      </h2>
                      <p className="font-primary text-sm text-slate-600 dark:text-slate-400 font-medium">
                        განაახლე პროდუქტის ინფორმაცია და აღწერა
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

                  {/* Tabs for Desktop */}
                  <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 px-6">
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                        activeTab === "settings"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
                        activeTab === "description"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      onClick={() => setActiveTab("description")}
                    >
                      📝 Description
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
                  {/* Category Selection */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                    <div className="mb-2">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Category
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Edit category selection from the tree (similar to facet settings/values).
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
                      ბრენდი
                    </Label>
                    {brands.length > 0 ? (
                      <HSelect
                        label="ბრენდი"
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Switch
                        checked={isLiquidated}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-rose-500 data-[state=checked]:to-rose-600"
                        id="is-liquidated"
                        onCheckedChange={setIsLiquidated}
                      />
                      <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                        <Box className="w-3 h-3 mb-0.5" />
                        ლიკვ.
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Switch
                        checked={isComingSoon}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-indigo-600 scale-75"
                        id="is-coming-soon"
                        onCheckedChange={setIsComingSoon}
                      />
                      <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                        <Clock3 className="w-3 h-3 mb-0.5" />
                        მალე
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <Switch
                        checked={isNewArrival}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600 scale-75"
                        id="is-new-arrival"
                        onCheckedChange={setIsNewArrival}
                      />
                      <span className="font-primary text-xs flex flex-col text-slate-800 dark:text-slate-200">
                        <Sparkles className="w-3 h-3 mb-0.5" />
                        ახალი
                      </span>
                    </div>
                  </div>

                  {/* Product Group Selector */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                      Product Group
                      <span className="font-primary text-xs font-normal text-slate-500 ml-1">
                        (Optional)
                      </span>
                    </Label>
                    {loadingGroups ? (
                      <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        Loading groups...
                      </div>
                    ) : (
                      <HSelect
                        label="Product Group"
                        placeholder="Select product group (optional)"
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
                          <HSelectItem key="none" textValue="None (standalone product)">
                            None (standalone product)
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

                    {/* Facets */}
                    {categoryId && (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 p-3">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          Product Facets
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
                  <div className={`flex flex-col ${isMobile ? "h-[calc(100vh-12rem)]" : "h-[calc(100vh-16rem)]"}`}>
                    <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 shadow-sm overflow-hidden">
                      <CustomEditor value={description} onChange={setDescription} />
                    </div>
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
                  გაუქმება
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                  onClick={handleSave}
                >
                  {loading ? (
                    <span className="font-primary flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "შენახვა"
                  )}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
