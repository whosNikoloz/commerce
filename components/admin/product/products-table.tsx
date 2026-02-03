"use client";

import type { ProductRequestModel } from "@/types/product";
import type { CategoryModel } from "@/types/category";
import type { BrandModel } from "@/types/brand";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Search,
  Package,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  Filter,
  Layers,
  Plus,
  Minus,
  Check,
} from "lucide-react";

import { useDictionary } from "@/app/context/dictionary-provider";
import { getProductImageUrls, getCoverImageUrl } from "@/types/product";
import { getAllBrands } from "@/app/api/services/brandService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StockStatus, Condition } from "@/types/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteProductById,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
} from "@/app/api/services/productService";
import {
  addStock,
  removeStock,
  updateStock,
} from "@/app/api/services/stockService";
import { isCustomMerchant as checkIsCustomMerchant } from "@/app/api/services/integrationService";

// ✅ Lazy-load heavy pieces
const UpdateProductModal = dynamic(() => import("./update-product-modal"), { ssr: false });
const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });
const CategoryTree = dynamic(() => import("./category-tree").then((m) => m.CategoryTree), {
  ssr: false,
});
const AddProductModal = dynamic(() => import("./add-product-modal"), { ssr: false });

type ViewMode = "table" | "grid";
type SortOption = "name" | "price" | "created" | "status";

interface ProductsTableProps {
  initialCategories: CategoryModel[];
}

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);

    return () => clearTimeout(id);
  }, [value, delay]);

  return v;
}

export function ProductsTable({ initialCategories }: ProductsTableProps) {
  const dictionary = useDictionary();
  const t = dictionary?.admin?.products?.table || {};
  const tCommon = dictionary?.common || {};

  const [products, setProducts] = useState<ProductRequestModel[]>([]);
  const [brands, setBrands] = useState<BrandModel[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_brandsLoading, setBrandsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounced(searchTerm, 250);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductRequestModel | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_mounted, setMounted] = useState(false);

  // Stock loading state for UI feedback
  const [stockLoading, setStockLoading] = useState<Record<string, boolean>>({});

  // Custom merchant state (not using Fina integration)
  const [isCustomMerchant, setIsCustomMerchant] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isSmall = window.matchMedia("(max-width: 1023px)").matches;

      if (isSmall) setViewMode("grid");
    }

    // Check if this is a custom merchant (not using Fina integration)
    checkIsCustomMerchant()
      .then(setIsCustomMerchant)
      .catch(() => setIsCustomMerchant(false));

    // Load brands for product modals
    setBrandsLoading(true);
    getAllBrands()
      .then((data) => {
        // eslint-disable-next-line no-console
        //console.log("✅ Brands loaded:", data);
        setBrands(data);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to load brands:", err);
        toast.error(t?.toast?.failedToLoadBrands || "Failed to load brands");
      })
      .finally(() => {
        setBrandsLoading(false);
      });
  }, []);

  const handleImagesChanged = async (productId: string, urls: string[]) => {
    const current = products.find((p) => p.id === productId);

    if (!current) return;

    const prev = products;
    const patched: ProductRequestModel = { ...current, images: urls };

    setProducts((prevList) => prevList.map((p) => (p.id === productId ? patched : p)));

    try {
      await updateProduct(patched);
      toast.success(t?.toast?.productUpdated || "Product updated successfully");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to persist image order", err);
      toast.error(t?.toast?.productUpdateFailed || "Failed to persist image order");
      setProducts(prev);
    }
  };

  useEffect(() => {
    let aborted = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // If no category selected, fetch all products
        const response = selectedCategoryId
          ? await getProductsByCategory(selectedCategoryId)
          : await getAllProducts();

        if (!aborted) setProducts(response);
      } catch (err) {
        if (!aborted) {
          setError("Failed to load products");
          // eslint-disable-next-line no-console
          console.error("Failed to fetch products", err);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [selectedCategoryId]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductById(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(t?.toast?.productDeleted || "Product deleted successfully");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete product", err);
      toast.error(t?.toast?.productDeleteFailed || "Failed to delete product");
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    name: string,
    description: string,
    brandId: string,
    categoryId: string,
    flags: { isActive: boolean; isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean },
    facetValues: import("@/types/facet").ProductFacetValueModel[],
    productGroupId?: string | null,
    stockStatus?: StockStatus,
    condition?: Condition,
    price?: number,
    discountPrice?: number,
    productAdditionalJson?: string,
  ) => {
    const current = products.find((p) => p.id === productId);

    if (!current) return;

    const prev = products;
    const patched: ProductRequestModel = {
      ...current,
      name,
      description,
      brandId,
      categoryId,
      price: price ?? current.price,
      discountPrice: discountPrice ?? current.discountPrice ?? undefined,
      isActive: flags.isActive,
      isLiquidated: flags.isLiquidated,
      isComingSoon: flags.isComingSoon,
      isNewArrival: flags.isNewArrival,
      status: stockStatus ?? current.status,
      condition: condition ?? current.condition,
      images: current.images ?? [],
      productFacetValues: facetValues,
      productGroupId: productGroupId || undefined,
      productAdditionalJson,
    };

    setProducts((prevList) => prevList.map((p) => (p.id === productId ? patched : p)));

    try {
      await updateProduct(patched);
      toast.success(t?.toast?.productUpdated || "Product updated successfully");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update product", err);
      toast.error(t?.toast?.productUpdateFailed || "Failed to update product");
      setProducts(prev);
    }
  };

  const toggleProductVisibility = async (productId: string) => {
    const current = products.find((p) => p.id === productId);

    if (!current) return;

    const prev = products;
    const nextActive = !current.isActive;

    setProducts((list) =>
      list.map((p) => (p.id === productId ? { ...p, isActive: nextActive } : p)),
    );

    const payload: ProductRequestModel = {
      ...current,
      isActive: nextActive,
      discountPrice: current.discountPrice ?? undefined,
      images: current.images ?? [],
      productFacetValues: current.productFacetValues ?? [],
      brandId: current.brandId ?? "",
      categoryId: current.categoryId ?? "",
    };

    try {
      await updateProduct(payload);
      toast.success(t?.toast?.visibilityChanged || "Product visibility changed");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update product", err);
      toast.error(t?.toast?.productUpdateFailed || "Failed to update product");
      setProducts(prev);
    }
  };

  // Helper to update product stock in local state
  const updateProductStockLocally = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newStock } : p))
    );
  };

  // Handle adding stock
  const handleAddStock = async (productId: string, amount: number = 1) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    const currentStock = product.stockQuantity ?? 0;

    setStockLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      await addStock(productId, amount);
      updateProductStockLocally(productId, currentStock + amount);
      toast.success(t?.toast?.stockAdded || "Stock added");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to add stock", err);
      toast.error(t?.toast?.stockAddFailed || "Failed to add stock");
    } finally {
      setStockLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Handle removing stock
  const handleRemoveStock = async (productId: string, amount: number = 1) => {
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    const currentStock = product.stockQuantity ?? 0;

    if (currentStock < amount) {
      toast.error(t?.toast?.insufficientStock || "Insufficient stock");

      return;
    }

    setStockLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      await removeStock(productId, amount);
      updateProductStockLocally(productId, currentStock - amount);
      toast.success(t?.toast?.stockRemoved || "Stock removed");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to remove stock", err);
      toast.error(t?.toast?.stockRemoveFailed || "Failed to remove stock");
    } finally {
      setStockLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Handle manual stock update (set exact quantity)
  const handleSetStock = async (productId: string, quantity: number) => {
    if (quantity < 0) {
      toast.error(t?.toast?.invalidQuantity || "Quantity must be 0 or greater");

      return;
    }

    setStockLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      await updateStock(productId, quantity);
      updateProductStockLocally(productId, quantity);
      toast.success(t?.toast?.stockUpdated || "Stock updated");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update stock", err);
      toast.error(t?.toast?.stockUpdateFailed || "Failed to update stock");
    } finally {
      setStockLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    const list = products
      .filter((p) => {
        const matchesSearch = q ? (p.name ?? "").toLowerCase().includes(q) : true;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && p.isActive) ||
          (statusFilter === "inactive" && !p.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          case "price":
            return a.price - b.price;
          case "status":
            return a.status - b.status;
          default:
            return 0;
        }
      });

    return list;
  }, [products, debouncedSearch, statusFilter, sortBy]);

  // ——— Token-based status/condition badges ———
  const getStatusClass = (status: StockStatus) =>
    status === StockStatus.InStock
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
      : "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400";

  const getStatusLabel = (status: StockStatus) =>
    status === StockStatus.InStock ? tCommon?.inStock : tCommon?.soldOut;

  const getConditionClass = (condition: Condition) =>
    condition === Condition.New
      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      : condition === Condition.Used
        ? "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
        : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400";

  const getConditionLabel = (condition: Condition) =>
    condition === Condition.New
      ? tCommon?.new
      : condition === Condition.Used
        ? tCommon?.used
        : tCommon?.likeNew;

  // Stock control component with +/- buttons and manual input
  const StockControl = ({ productId, stock, size = "default" }: { productId: string; stock: number; size?: "small" | "default" }) => {
    const [manualValue, setManualValue] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const currentStock = stock;
    const isLoading = stockLoading[productId];

    const buttonSize = size === "small" ? "h-6 w-6" : "h-7 w-7";
    const iconSize = size === "small" ? "h-3 w-3" : "h-3 w-3";
    const textSize = size === "small" ? "text-sm" : "text-base";
    const minWidth = size === "small" ? "min-w-[32px]" : "min-w-[40px]";

    const handleManualSubmit = () => {
      const qty = parseInt(manualValue);

      if (!isNaN(qty) && qty >= 0) {
        handleSetStock(productId, qty);
        setIsPopoverOpen(false);
        setManualValue("");
      }
    };

    return (
      <div className="flex items-center gap-1">
        <Button
          className={`${buttonSize} border-slate-300 dark:border-slate-600`}
          disabled={isLoading || currentStock <= 0}
          size="icon"
          variant="outline"
          onClick={() => handleRemoveStock(productId)}
        >
          <Minus className={iconSize} />
        </Button>

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={`${minWidth} ${textSize} text-center font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 py-0.5 transition-colors ${
                currentStock === 0
                  ? "text-red-600 dark:text-red-400"
                  : currentStock <= 5
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-900 dark:text-slate-100"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "..." : currentStock}
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-48 p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t?.setStock || "Set stock quantity"}
              </p>
              <div className="flex gap-2">
                <Input
                  className="h-8"
                  min="0"
                  placeholder={String(currentStock)}
                  type="number"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleManualSubmit();
                    }
                  }}
                />
                <Button
                  className="h-8 w-8 shrink-0"
                  disabled={!manualValue || isNaN(parseInt(manualValue))}
                  size="icon"
                  onClick={handleManualSubmit}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          className={`${buttonSize} border-slate-300 dark:border-slate-600`}
          disabled={isLoading}
          size="icon"
          variant="outline"
          onClick={() => handleAddStock(productId)}
        >
          <Plus className={iconSize} />
        </Button>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: ProductRequestModel }) => (
    <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <div className="relative w-full h-40 sm:h-48">
            <Image
              fill
              alt={product.name ?? "Product"}
              className="rounded-lg object-cover"
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={getCoverImageUrl(product.images) || "/placeholder.png"}
            />
            {getProductImageUrls(product.images).length > 1 && (
              <span className="font-primary absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full">
                +{getProductImageUrls(product.images).length}
              </span>
            )}
            <div className="absolute top-2 left-2">
              {product.isActive ? (
                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-sm  text-slate-900 dark:text-slate-100">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-xs ${getStatusClass(product.status)}`}>
              {getStatusLabel(product.status)}
            </Badge>
            <Badge className={`text-xs ${getConditionClass(product.condition)}`}>
              {getConditionLabel(product.condition)}
            </Badge>
            {product.isLiquidated && (
              <Badge className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs">
                {tCommon?.liquidation}
              </Badge>
            )}
            {product.isComingSoon && (
              <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-xs">
                {tCommon?.comingSoon}
              </Badge>
            )}
            {product.isNewArrival && (
              <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                {tCommon?.new}
              </Badge>
            )}
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="font-medium">
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="font-primary text-slate-500 dark:text-slate-400 line-through text-sm">{product.price} ₾</span>
                  <span className="font-primary text-blue-700 dark:text-blue-400 text-sm font-bold">
                    {product.discountPrice} ₾
                  </span>
                </div>
              ) : (
                <span className="font-primary text-blue-700 dark:text-blue-400 text-sm font-bold">{product.price} ₾</span>
              )}
            </div>

            {/* Stock controls */}
            <StockControl productId={product.id} size="small" stock={product.stockQuantity ?? 0} />
          </div>

          <div className="flex items-center justify-end gap-1">
            <Switch
              checked={product.isActive}
              className="data-[state=checked]:bg-blue-600"
              onCheckedChange={() => toggleProductVisibility(product.id)}
            />
            <UpdateProductModal
              brands={brands}
              categories={initialCategories}
              initialBrandId={product.brandId}
              initialCategoryId={product.categoryId}
              initialCondition={product.condition}
              initialDescription={product.description}
              initialDiscountPrice={product.discountPrice}
              initialFacetValues={product.productFacetValues ?? []}
              initialIsActive={product.isActive}
              initialIsComingSoon={product.isComingSoon}
              initialIsLiquidated={product.isLiquidated}
              initialIsNewArrival={product.isNewArrival}
              initialName={product.name}
              initialPrice={product.price}
              initialProductAdditionalJson={product.productAdditionalJson}
              initialProductGroupId={product.productGroupId}
              initialStockStatus={product.status}
              productId={product.id}
              onSave={handleUpdateProduct}
            />
            <ReviewImagesModal
              existing={getProductImageUrls(product.images).map((url, idx) => ({ key: (idx + 1).toString(), url }))}
              maxFiles={12}
              maxSizeMB={5}
              productId={product.id}
              onChanged={(urls) => handleImagesChanged(product.id, urls)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-1 h-min">
          <CategoryTree
            Categories={initialCategories}
            onSelectCategory={(id) => startTransition(() => setSelectedCategoryId(id))}
          />
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          <Card className="bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
            <CardHeader className="pb-4 relative">
              <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {/* Add Product Button - Only for CUSTOM merchants */}
                  {isCustomMerchant && (
                    <AddProductModal
                      brands={brands}
                      categories={initialCategories}
                      onProductAdded={() => {
                        if (selectedCategoryId) {
                          getProductsByCategory(selectedCategoryId)
                            .then(setProducts)
                            // eslint-disable-next-line no-console
                            .catch(console.error);
                        }
                      }}
                    />
                  )}

                  {/* Mobile: open categories */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        className="lg:hidden shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                        size="sm"
                        variant="outline"
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        {t?.categories}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="h-[85vh] p-0 bg-white dark:bg-slate-900"
                      side="bottom"
                    >
                      <SheetHeader className="px-6 pt-6 mb-6">
                        <SheetTitle className="text-slate-900 dark:text-slate-100">
                          {t?.categories}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="px-4 pb-4">
                        <CategoryTree
                          Categories={initialCategories}
                          onSelectCategory={(id) =>
                            startTransition(() => setSelectedCategoryId(id))
                          }
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 dark:text-cyan-400 h-4 w-4" />
                    <Input
                      aria-label={t?.searchProducts}
                      className="pl-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm"
                      placeholder={t?.searchProducts}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filters / sort / view */}
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(v: "all" | "active" | "inactive") => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={t?.filter?.placeholder || "Status"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                      <SelectItem value="all">{t?.filter?.allStatus || "All Status"}</SelectItem>
                      <SelectItem value="active">{t?.filter?.active || "Active"}</SelectItem>
                      <SelectItem value="inactive">{t?.filter?.inactive || "Inactive"}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                    <SelectTrigger className="w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={t?.sort?.placeholder || "Sort"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                      <SelectItem value="name">{t?.sort?.name || "Name"}</SelectItem>
                      <SelectItem value="price">{t?.sort?.price || "Price"}</SelectItem>
                      <SelectItem value="status">{t?.sort?.status || "Status"}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Separator
                    className="h-6 hidden md:block bg-slate-200 dark:bg-slate-800"
                    orientation="vertical"
                  />

                  <div className="flex items-center border-2 rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
                    <Button
                      aria-pressed={viewMode === "table"}
                      className={`rounded-none ${viewMode === "table" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"}`}
                      size="sm"
                      variant={viewMode === "table" ? "default" : "ghost"}
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      aria-pressed={viewMode === "grid"}
                      className={`rounded-none ${viewMode === "grid" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"}`}
                      size="sm"
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Package className="h-4 w-4" />
                <span>
                  {isPending
                    ? (t?.updating || "Updating...")
                    : (t?.productsFound?.replace("{count}", String(filteredAndSortedProducts.length)) || `${filteredAndSortedProducts.length} products found`)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-280px)] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12 px-6">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                      <span className="font-primary text-slate-600 dark:text-slate-400">{t?.loading || "Loading products..."}</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 px-6">
                    <div className="text-red-500 mb-2">{error}</div>
                    <Button
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                      variant="outline"
                      onClick={() => location.reload()}
                    >
                      {t?.tryAgain || "Try Again"}
                    </Button>
                  </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <Package className="h-14 w-14 text-slate-400 dark:text-slate-500 mb-4" />
                    <h3 className="font-heading text-base md:text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      {t?.empty?.noProductsFound || "No Products Found"}
                    </h3>
                    <p className="font-primary text-slate-500 dark:text-slate-400 max-w-sm">
                      {debouncedSearch
                        ? (t?.empty?.adjustSearchTerms || "Try adjusting your search terms")
                        : (t?.empty?.noProductsInCategory || "No products available in this category")}
                    </p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {filteredAndSortedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto relative">
                    <Table>
                      <TableHeader className="bg-slate-100 dark:bg-slate-800/60 sticky top-0">
                        <TableRow className="border-b-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60">
                          <TableHead className="w-[72px] sm:w-[80px] text-slate-700 dark:text-slate-300 font-bold">
                            {t?.headers?.image || "Image"}
                          </TableHead>
                          <TableHead className="min-w-[120px] text-slate-700 dark:text-slate-300 font-bold">{t?.headers?.product || "Product"}</TableHead>
                          <TableHead className="whitespace-nowrap text-slate-700 dark:text-slate-300 font-bold">
                            {t?.headers?.price || "Price"}
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-slate-700 dark:text-slate-300 font-bold">
                            {t?.headers?.status || "Status"}
                          </TableHead>
                          <TableHead className="hidden lg:table-cell text-slate-700 dark:text-slate-300 font-bold">
                            {t?.headers?.condition || "Condition"}
                          </TableHead>
                          <TableHead className="hidden xl:table-cell text-slate-700 dark:text-slate-300 font-bold">
                            {t?.headers?.flags || "Flags"}
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-slate-700 dark:text-slate-300 font-bold text-center">
                            {t?.headers?.stock || "Stock"}
                          </TableHead>
                          <TableHead className="hidden sm:table-cell text-slate-700 dark:text-slate-300 font-bold">
                            {t?.headers?.visible || "Visible"}
                          </TableHead>
                          <TableHead className="text-right text-slate-700 dark:text-slate-300 font-bold">{t?.headers?.actions || "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedProducts.map((product) => (
                          <TableRow
                            key={product.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
                          >
                            <TableCell>
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <Image
                                    fill
                                    alt={product.name ?? "Product"}
                                    className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                                    sizes="48px"
                                    src={getCoverImageUrl(product.images) || "/placeholder.png"}
                                  />
                                  {getProductImageUrls(product.images).length > 1 && (
                                    <span className="font-primary absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] px-1 py-0.5 rounded-full font-medium">
                                      +{getProductImageUrls(product.images).length}
                                    </span>
                                  )}
                                </div>
                                <button
                                  className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[48px] hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors"
                                  title={t?.copyId || "Click to copy ID"}
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(product.id);
                                    toast.success(t?.toast?.idCopied || "ID copied!");
                                  }}
                                >
                                  {product.id}
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[120px] max-w-[200px]">
                              <div className="space-y-1">
                                <div className="font-medium text-slate-900 dark:text-slate-100 overflow-hidden break-words">
                                  {product.name}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1 md:hidden">
                                  <Badge
                                    className={getStatusClass(product.status)}
                                    variant="default"
                                  >
                                    {getStatusLabel(product.status)}
                                  </Badge>
                                  <Badge
                                    className={getConditionClass(product.condition)}
                                    variant="default"
                                  >
                                    {getConditionLabel(product.condition)}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {product.discountPrice ? (
                                <div className="space-y-1">
                                  <div className="text-slate-500 dark:text-slate-400 line-through text-sm">
                                    {product.price} ₾
                                  </div>
                                  <div className="text-blue-700 dark:text-blue-400 font-bold">
                                    {product.discountPrice} ₾
                                  </div>
                                </div>
                              ) : (
                                <div className="text-blue-700 dark:text-blue-400 font-bold">
                                  {product.price} ₾
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge className={getStatusClass(product.status)} variant="default">
                                {getStatusLabel(product.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge
                                className={getConditionClass(product.condition)}
                                variant="default"
                              >
                                {getConditionLabel(product.condition)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {product.isLiquidated && (
                                  <Badge className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs">
                                    {tCommon.liquidation || "Liquidation"}
                                  </Badge>
                                )}
                                {product.isComingSoon && (
                                  <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-xs">
                                    {tCommon.comingSoon || "Coming soon"}
                                  </Badge>
                                )}
                                {product.isNewArrival && (
                                  <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                                    {tCommon.new || "New"}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center justify-center">
                                <StockControl productId={product.id} stock={product.stockQuantity ?? 0} />
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Switch
                                checked={product.isActive}
                                className="data-[state=checked]:bg-blue-600"
                                onCheckedChange={() => toggleProductVisibility(product.id)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <div className="sm:hidden mr-1">
                                  <Switch
                                    checked={product.isActive}
                                    className="data-[state=checked]:bg-blue-600"
                                    onCheckedChange={() => toggleProductVisibility(product.id)}
                                  />
                                </div>
                                <UpdateProductModal
                                  brands={brands}
                                  categories={initialCategories}
                                  initialBrandId={product.brandId}
                                  initialCategoryId={product.categoryId}
                                  initialCondition={product.condition}
                                  initialDescription={product.description}
                                  initialDiscountPrice={product.discountPrice}
                                  initialFacetValues={product.productFacetValues ?? []}
                                  initialIsActive={product.isActive}
                                  initialIsComingSoon={product.isComingSoon}
                                  initialIsLiquidated={product.isLiquidated}
                                  initialIsNewArrival={product.isNewArrival}
                                  initialName={product.name}
                                  initialPrice={product.price}
                                  initialProductAdditionalJson={product.productAdditionalJson}
                                  initialProductGroupId={product.productGroupId}
                                  initialStockStatus={product.status}
                                  productId={product.id}
                                  onSave={handleUpdateProduct}
                                />
                                <ReviewImagesModal
                                  existing={getProductImageUrls(product.images).map((url, idx) => ({
                                    key: (idx + 1).toString(),
                                    url,
                                  }))}
                                  maxFiles={8}
                                  maxSizeMB={5}
                                  productId={product.id}
                                  onChanged={(urls) => handleImagesChanged(product.id, urls)}
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  {t?.delete || "Delete"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t?.deleteDialog?.title || "Delete Product?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {productToDelete ? (
                <>
                  {t?.deleteDialog?.confirmation || "Are you sure you want to delete"}{" "}
                  <span className="font-primary font-bold text-slate-900 dark:text-slate-100">
                    {productToDelete.name}
                  </span>
                  {t?.deleteDialog?.warning || "? This action cannot be undone and will permanently delete the product."}
                </>
              ) : (
                t?.deleteDialog?.fallbackWarning || "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t?.deleteDialog?.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteProduct}
            >
              {t?.deleteDialog?.deleteProduct || "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
