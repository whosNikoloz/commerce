"use client";

import type { BrandModel } from "@/types/brand";
import type { ProductFacetValueModel } from "@/types/facet";

import { useEffect, useState } from "react";
import { Box, Clock3, Edit, Sparkles, Layers } from "lucide-react";
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

import { getAllProductGroups, type ProductGroupModel } from "@/app/api/services/productService";
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
  onSave: (
    id: string,
    newDescription: string,
    brandId: string,
    flags: { isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean },
    facetValues: ProductFacetValueModel[],
    productGroupId?: string,
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
  onSave,
}: UpdateProductModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [description, setDescription] = useState(initialDescription);
  const [brandId, setBrandId] = useState(initialBrandId);
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

  // Fetch product groups when modal opens
  useEffect(() => {
    if (isOpen && (initialCategoryId || initialBrandId)) {
      fetchProductGroups();
    }
  }, [isOpen, initialCategoryId, initialBrandId]);

  const fetchProductGroups = async () => {
    if (!initialCategoryId && !initialBrandId) return;

    setLoadingGroups(true);
    try {
      const groups = await getAllProductGroups(
        initialCategoryId || undefined,
        initialBrandId || undefined
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
    if (!brandId) {
      alert("Please select a brand");

      return;
    }

    try {
      setLoading(true);
      await Promise.resolve(
        onSave(
          productId,
          description,
          brandId,
          { isLiquidated, isComingSoon, isNewArrival },
          selectedFacetValues,
          productGroupId || undefined
        ),
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

 

  const validBrandId = brands.some(b => b.id === brandId) ? brandId : undefined;
  const selectedKeys = validBrandId ? new Set([validBrandId]) : new Set<string>();

   useEffect(() => {
      if (!validBrandId && brands.length > 0) {
        setBrandId(brands[0].id); 
      }
    }, [brands, validBrandId]);

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
          backdrop: "bg-slate-900/80 backdrop-blur-xl",
          base:
            "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
          wrapper: "z-[999]",
          closeButton: "z-50",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0 } },
            center: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 },
            },
            exit: {
              y: 40,
              opacity: 0,
              scale: 0.96,
              transition: { duration: 0.18, ease: "easeIn" },
            },
          },
          initial: "enter",
          animate: "center",
          exit: "exit",
        }}
        placement={isMobile ? "top" : "center"}
        size={isMobile ? "full" : "5xl"}
        onClose={onClose}
      >
        <ModalContent>
          {() => (
            <>
              {/* დეკორატიული overlay Add/Update FAQ სტილში */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none rounded-2xl" />

              <ModalHeader className={isMobile ? "flex flex-col gap-2 px-4 pt-6 mx-4 z-50" : "flex flex-col gap-3 pb-3 pt-6 relative"}>
                {isMobile && (
                  <div className="flex items-center gap-2">
                    <GoBackButton onClick={onClose} />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      განახლება
                    </h2>
                  </div>
                )}

                {!isMobile && (
                  <div className="flex items-center justify-between px-6">
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        პროდუქტის აღწერის განახლება
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        განაახლე პროდუქტის ინფორმაცია და აღწერა
                      </p>
                    </div>
                  </div>
                )}

                {/* Tabs - Both Mobile and Desktop */}
                <div className={`flex gap-1 border-b border-slate-200 dark:border-slate-700 ${isMobile ? "" : "px-6"}`}>
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

              <ModalBody className={`py-4 overflow-hidden ${isMobile ? "px-4" : "px-6"}`}>
                {/* Tab Content */}
                {activeTab === "settings" && (
                  <div className={`space-y-4 overflow-y-auto ${isMobile ? "h-[calc(100vh-12rem)]" : "h-[calc(100vh-16rem)]"}`}
                       style={{
                         scrollbarWidth: 'thin',
                         scrollbarColor: '#cbd5e1 transparent'
                       }}>
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
                        selectedKeys={selectedKeys}
                        selectionMode="single"
                        variant="bordered"
                        onSelectionChange={(keys) => {
                          const k = Array.from(keys)[0] as string | undefined;

                          setBrandId(k ?? "");
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
                      <span className="text-xs flex flex-col text-slate-800 dark:text-slate-200">
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
                      <span className="text-xs flex flex-col text-slate-800 dark:text-slate-200">
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
                      <span className="text-xs flex flex-col text-slate-800 dark:text-slate-200">
                        <Sparkles className="w-3 h-3 mb-0.5" />
                        ახალი
                      </span>
                    </div>
                  </div>

                  {/* Product Group Selector */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                      Product Group
                      <span className="text-xs font-normal text-slate-500 ml-1">
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
                    {initialCategoryId && (
                      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 p-3">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          Product Facets
                        </Label>
                        <FacetSelector
                          categoryId={initialCategoryId}
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

              <ModalFooter className="gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 relative">
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
                    <span className="flex items-center gap-2">
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
