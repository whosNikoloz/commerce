"use client";

import type { ProductRequestModel } from "@/types/product";
import type { CategoryModel } from "@/types/category";
import type { BrandModel } from "@/types/brand";
import type { ProductFacetValueModel } from "@/types/facet";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";

import { CustomEditor } from "../../wysiwyg-text-custom";
import { Select, SelectItem } from "@heroui/select";

import { ProductGroupCategoryTree } from "../product-group/product-group-category-tree";

import { FacetSelector } from "./facet-selector";

import { Button } from "@/components/ui/button";
import { StockStatus, Condition } from "@/types/enums";
import { createProduct } from "@/app/api/services/productService";
import { getAllProductGroups, type ProductGroupModel } from "@/app/api/services/productGroupService";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";
import { useDictionary } from "@/app/context/dictionary-provider";

interface AddProductModalProps {
  categories: CategoryModel[];
  brands: BrandModel[];
  onProductAdded?: () => void;
}

type FormState = {
  name: string;
  price: string;
  discountPrice: string;
  description: string;
  categoryId: string;
  brandId: string;
  productGroupId: string;
  status: string;
  condition: string;
};

const initialFormState: FormState = {
  name: "",
  price: "",
  discountPrice: "",
  description: "",
  categoryId: "",
  brandId: "",
  productGroupId: "",
  status: StockStatus.InStock.toString(),
  condition: Condition.New.toString(),
};

export default function AddProductModal({
  categories,
  brands,
  onProductAdded,
}: AddProductModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const isMobile = useIsMobile();
  const dictionary = useDictionary();
  const t = dictionary?.admin?.products?.addModal || {};
  const tCommon = dictionary?.common || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialFormState);

  const [selectedFacetValues, setSelectedFacetValues] =
    useState<ProductFacetValueModel[]>([]);

  const [productGroups, setProductGroups] = useState<ProductGroupModel[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  // Normalize product groups for HeroUI `items`
  const productGroupOptions = useMemo(
    () => [
      { id: "none", label: "None (standalone product)" },
      ...productGroups.map((pg) => ({
        id: pg.id,
        label: `${pg.name} (ID: ${pg.id})`,
      })),
    ],
    [productGroups]
  );

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedFacetValues([]);
    setProductGroups([]);
    setCategorySearchTerm("");
  };

  const handleOpen = () => {
    resetForm();
    onOpen();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Load product groups when category or brand changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (!formData.categoryId && !formData.brandId) {
        setProductGroups([]);

        return;
      }

      setLoadingGroups(true);
      try {
        const groups = await getAllProductGroups(
          formData.categoryId || undefined,
          formData.brandId || undefined
        );

        setProductGroups(groups);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch product groups:", error);
        toast.error("Failed to load product groups");
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [formData.categoryId, formData.brandId]);

  const handleCategorySelect = (categoryId: string | null) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: categoryId ?? "",
      productGroupId: "",
    }));
  };

  const selectedCategoryName = useMemo(
    () => categories.find((cat) => cat.id === formData.categoryId)?.name,
    [categories, formData.categoryId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.categoryId ||
      !formData.brandId
    ) {
      toast.error("Please fill in all required fields");

      return;
    }

    setLoading(true);

    try {
      const productData: ProductRequestModel = {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : undefined,
        description: formData.description,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        status: parseInt(formData.status) as StockStatus,
        condition: parseInt(formData.condition) as Condition,
        isActive: true,
        isLiquidated: false,
        isComingSoon: false,
        isNewArrival: true,
        images: [],
        productFacetValues: selectedFacetValues,
        productGroupId:
          formData.productGroupId && formData.productGroupId !== "none"
            ? formData.productGroupId
            : undefined,
      };

      await createProduct(productData);
      toast.success("Product created successfully");

      handleClose();
      onProductAdded?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        className="gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:translate-y-[1px] hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/35"
        size="sm"
        onClick={handleOpen}
      >
        <Plus className="h-4 w-4" />
        {dictionary?.admin?.products?.table?.addProduct}
      </Button>

      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base:
            " w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        scrollBehavior="inside"
        size={isMobile ? "full" : "4xl"}
        onClose={handleClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="h-full">
          {() => (
            <form
              className="flex h-full flex-col"
              onSubmit={handleSubmit}
            >
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={handleClose} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      {t?.title}
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {t?.subtitle}
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {t?.title}
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t?.subtitle}
                    </p>
                  </div>
                </ModalHeader>
              )}

              {/* BODY (scrolls on BOTH mobile + desktop) */}
              <ModalBody
                className="
                  flex-1 overflow-y-auto
                  px-4 md:px-6
                  pt-2 pb-3
                  space-y-4 md:space-y-5
                "
              >
                <section className="space-y-3">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100 mb-10">
                      {t?.basicInformation}
                    </h3>
                  </div>

                  <Input
                    required
                    classNames={{
                      inputWrapper:
                        "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                    }}
                    label={t?.productName}
                    labelPlacement="outside"
                    placeholder={t?.productNamePlaceholder}
                    value={formData.name}
                    variant="bordered"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {t?.description}
                    </label>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden min-h-[200px]">
                      <CustomEditor
                        value={formData.description}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section className="space-y-3">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t?.pricing}
                    </h3>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t?.pricingDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input
                      required
                      classNames={{
                        inputWrapper:
                          "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                      }}
                      label={t?.price}
                      labelPlacement="outside"
                      min="0"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      value={formData.price}
                      variant="bordered"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />

                    <Input
                      classNames={{
                        inputWrapper:
                          "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                      }}
                      label={t?.discountPrice}
                      labelPlacement="outside"
                      min="0"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      value={formData.discountPrice}
                      variant="bordered"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountPrice: e.target.value,
                        }))
                      }
                    />
                  </div>
                </section>

                {/* Classification */}
                <section className="space-y-3">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t?.classification}
                    </h3>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t?.classificationDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-sm p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {t?.categoryTree}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {selectedCategoryName
                                ? `${selectedCategoryName}`
                                : t?.pickCategory}
                            </p>
                          </div>
                          {formData.categoryId && (
                            <Button
                              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCategorySelect(null)}
                            >
                              {tCommon?.back}
                            </Button>
                          )}
                        </div>

                        <Input
                          classNames={{
                            inputWrapper:
                              "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                          }}
                          placeholder={t?.searchCategories}
                          startContent={<Search className="h-4 w-4 text-blue-500" />}
                          value={categorySearchTerm}
                          variant="bordered"
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                        />

                        <div className="h-64 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900">
                          <ProductGroupCategoryTree
                            categories={categories}
                            searchTerm={categorySearchTerm}
                            selectedCategoryId={formData.categoryId || null}
                            onSelectCategory={handleCategorySelect}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-3">
                      <Select
                        isRequired
                        classNames={{
                          trigger:
                            "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                        }}
                        label={t?.brand}
                        labelPlacement="outside"
                        placeholder={t?.selectBrand}
                        selectedKeys={
                          formData.brandId ? [formData.brandId] : []
                        }
                        variant="bordered"
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;

                          setFormData((prev) => ({
                            ...prev,
                            brandId: selected || "",
                            productGroupId: "",
                          }));
                        }}
                      >
                        {brands.map((brand) => (
                          <SelectItem key={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </Select>

                      <Select
                        classNames={{
                          trigger:
                            "rounded-lg border-slate-200 mt-5 dark:border-slate-700 bg-white dark:bg-slate-900",
                        }}
                        description={
                          !formData.categoryId && !formData.brandId
                            ? t?.selectCategoryOrBrandFirst
                            : undefined
                        }
                        isDisabled={
                          loadingGroups ||
                          (!formData.categoryId && !formData.brandId)
                        }
                        items={productGroupOptions}
                        label={t?.productGroup}
                        labelPlacement="outside"
                        placeholder={
                          loadingGroups
                            ? tCommon?.loading
                            : t?.selectProductGroup
                        }
                        selectedKeys={
                          formData.productGroupId
                            ? [formData.productGroupId]
                            : []
                        }
                        variant="bordered"
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;

                          setFormData((prev) => ({
                            ...prev,
                            productGroupId: selected || "none",
                          }));
                        }}
                      >
                        {(item) => (
                          <SelectItem key={item.id}>{item.label}</SelectItem>
                        )}
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Inventory */}
                <section className="space-y-3">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t.inventoryCondition || "Inventory & Condition"}
                    </h3>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t.inventoryConditionDescription || "Control how this product appears in stock and condition filters."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Select
                      classNames={{
                        trigger:
                          "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                      }}
                      label={t.stockStatus || "Stock Status"}
                      labelPlacement="outside"
                      selectedKeys={[formData.status]}
                      variant="bordered"
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;

                        setFormData((prev) => ({
                          ...prev,
                          status: selected,
                        }));
                      }}
                    >
                      <SelectItem key={StockStatus.InStock.toString()}>
                        {tCommon.inStock || "In Stock"}
                      </SelectItem>
                      <SelectItem key={StockStatus.OutOfStock.toString()}>
                        {tCommon.soldOut || "Out of Stock"}
                      </SelectItem>
                    </Select>

                    <Select
                      classNames={{
                        trigger:
                          "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                      }}
                      label={t.condition || "Condition"}
                      labelPlacement="outside"
                      selectedKeys={[formData.condition]}
                      variant="bordered"
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;

                        setFormData((prev) => ({
                          ...prev,
                          condition: selected,
                        }));
                      }}
                    >
                      <SelectItem key={Condition.New.toString()}>
                        {tCommon.new || "New"}
                      </SelectItem>
                      <SelectItem key={Condition.Used.toString()}>
                        {tCommon.used || "Used"}
                      </SelectItem>
                      <SelectItem key={Condition.LikeNew.toString()}>
                        {tCommon.likeNew || "Like New"}
                      </SelectItem>
                    </Select>
                  </div>
                </section>

                {/* Facets */}
                <section className="space-y-3 pb-1">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t.attributesFilters || "Attributes & Filters"}
                    </h3>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      {t.attachFacetValues || "Attach facet values (size, color, material, etc.) so customers can filter."}
                    </p>
                  </div>

                  <FacetSelector
                    categoryId={formData.categoryId}
                    selectedFacetValues={selectedFacetValues}
                    onChange={setSelectedFacetValues}
                  />
                </section>
              </ModalBody>

              {/* FOOTER (fixed) */}
              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="font-primary hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                    {t.editDetailsLater || "You can edit all details later from the product page."}
                  </p>

                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      className="rounded-lg border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      disabled={loading}
                      size={isMobile ? "sm" : "default"}
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      {t.cancel || "Cancel"}
                    </Button>
                    <Button
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                      disabled={loading}
                      size={isMobile ? "sm" : "default"}
                      type="submit"
                    >
                      {loading ? (tCommon.loading || "Creating...") : (t.create || "Create Product")}
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
