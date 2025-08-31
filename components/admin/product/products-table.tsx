// components/admin/product/products-table.tsx
"use client";

import type { ProductRequestModel } from "@/types/product";
import type { CategoryModel } from "@/types/category";

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
} from "lucide-react";

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
  deleteProductById,
  getProductsByCategory,
  updateProduct,
} from "@/app/api/services/productService";

// ✅ Lazy-load heavy pieces to reduce TTI
const UpdateProductModal = dynamic(() => import("./update-product-modal"), { ssr: false });
const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });
const CategoryTree = dynamic(() => import("./category-tree").then((m) => m.CategoryTree), {
  ssr: false,
});

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
  const [products, setProducts] = useState<ProductRequestModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounced(searchTerm, 250);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // ✅ Non-blocking UI when switching categories
  const [isPending, startTransition] = useTransition();

  // Prefer grid on small screens by default (runs once)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSmall = window.matchMedia("(max-width: 1023px)").matches;

      if (isSmall) setViewMode("grid");
    }
  }, []);

  // Fetch on category changes only
  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);

      return;
    }

    let aborted = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ mark the route non-cacheable server side on this API if needed (noStore)
        const response = await getProductsByCategory(selectedCategoryId);

        if (!aborted) setProducts(response);
      } catch (err) {
        if (!aborted) {
          setError("Failed to load products");
          console.error("Failed to fetch products", err);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    run();

    return () => {
      aborted = true;
    };
  }, [selectedCategoryId]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductById(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("პროდუქტი წარმატებით წაიშალა");
    } catch (err) {
      console.error("Failed to delete product", err);
      toast.error("პროდუქტის წაშლა ვერ მოხერხდა");
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    description: string,
    flags: { isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean },
  ) => {
    const current = products.find((p) => p.id === productId);

    if (!current) return;

    const prev = products;
    const patched: ProductRequestModel = {
      ...current,
      description,
      isLiquidated: flags.isLiquidated,
      isComingSoon: flags.isComingSoon,
      isNewArrival: flags.isNewArrival,
      // ensure required fields exist:
      discountPrice: current.discountPrice ?? undefined,
      images: current.images ?? [],
      productFacetValues: current.productFacetValues ?? [],
      brandId: current.brandId,
      categoryId: current.categoryId,
    };

    setProducts((prevList) => prevList.map((p) => (p.id === productId ? patched : p)));

    try {
      await updateProduct(patched);
      toast.success("პროდუქტი წარმატებით განახლდა");
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("პროდუქტის განახლება ვერ მოხერხდა");
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
      toast.success("პროდუქტის ხილვადობა შეიცვალა");
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("პროდუქტის განახლება ვერ მოხერხდა");
      setProducts(prev);
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

  const getStatusClass = (status: StockStatus) =>
    status === StockStatus.InStock
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  const getStatusLabel = (status: StockStatus) =>
    status === StockStatus.InStock ? "მარაგშია" : "არ არის მარაგში";

  const getConditionClass = (condition: Condition) =>
    condition === Condition.New
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : condition === Condition.Used
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";

  const getConditionLabel = (condition: Condition) =>
    condition === Condition.New
      ? "ახალი"
      : condition === Condition.Used
        ? "მეორადი"
        : "როგორც ახალი";

  const ProductCard = ({ product }: { product: ProductRequestModel }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-brand-surface dark:bg-brand-surfacedark">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <div className="relative w-full h-40 sm:h-48">
            <Image
              fill
              alt={product.name ?? "Product"}
              className="rounded-lg object-cover"
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              src={product.images?.[0] || "/placeholder.svg"}
            />
            {product.images && product.images.length > 1 && (
              <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                +{product.images.length}
              </span>
            )}
            <div className="absolute top-2 left-2">
              {product.isActive ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-xs ${getStatusClass(product.status)}`}>
              {getStatusLabel(product.status)}
            </Badge>
            <Badge className={`text-xs ${getConditionClass(product.condition)}`}>
              {getConditionLabel(product.condition)}
            </Badge>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="font-medium">
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-500 line-through text-sm">{product.price} ₾</span>
                  <span className="text-green-600 text-sm font-bold">
                    {product.discountPrice} ₾
                  </span>
                </div>
              ) : (
                <span className="text-green-600 text-sm font-bold">{product.price} ₾</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Switch
                checked={product.isActive}
                onCheckedChange={() => toggleProductVisibility(product.id)}
              />
              <UpdateProductModal
                initialDescription={product.description}
                initialIsComingSoon={product.isComingSoon}
                initialIsLiquidated={product.isLiquidated}
                initialIsNewArrival={product.isNewArrival}
                productId={product.id}
                onSave={handleUpdateProduct}
              />
              <ReviewImagesModal />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar (desktop/tablet) */}
        <div className="hidden lg:block lg:col-span-1">
          <CategoryTree
            Categories={initialCategories}
            onSelectCategory={(id) => startTransition(() => setSelectedCategoryId(id))}
          />
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          <Card className="dark:bg-brand-muteddark bg-brand-muted">
            <CardHeader className="pb-4">
              {/* Top controls */}
              <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {/* Mobile: open categories */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="lg:hidden shrink-0" size="sm" variant="outline">
                        <Layers className="mr-2 h-4 w-4" />
                        Categories
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="h-[85vh] p-0 bg-inherit" side="bottom">
                      <SheetHeader className="px-6 pt-6 mb-6">
                        <SheetTitle>Categories</SheetTitle>
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

                  {/* Search (debounced) */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      aria-label="Search products"
                      className="pl-10"
                      placeholder="Search products..."
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
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                    <SelectTrigger className="w-32">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>

                  <Separator className="h-6 hidden md:block" orientation="vertical" />

                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      aria-pressed={viewMode === "table"}
                      className="rounded-none"
                      size="sm"
                      variant={viewMode === "table" ? "default" : "ghost"}
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      aria-pressed={viewMode === "grid"}
                      className="rounded-none"
                      size="sm"
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {selectedCategoryId && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Package className="h-4 w-4" />
                  <span>
                    {isPending
                      ? "Updating..."
                      : `${filteredAndSortedProducts.length} products found`}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-280px)] overflow-auto">
                {!selectedCategoryId ? (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <Package className="h-14 w-14 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Select a Category
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500 max-w-sm">
                      Choose a category from the sidebar (or button on mobile) to view and manage
                      products.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12 px-6">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Loading products...
                      </span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 px-6">
                    <div className="text-red-500 mb-2">{error}</div>
                    <Button variant="outline" onClick={() => location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <Package className="h-14 w-14 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500 max-w-sm">
                      {debouncedSearch
                        ? "Try adjusting your search terms"
                        : "No products available in this category"}
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[72px] sm:w-[80px]">Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead className="whitespace-nowrap">Price</TableHead>
                          <TableHead className="hidden md:table-cell">Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Condition</TableHead>
                          <TableHead className="hidden sm:table-cell">Visible</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedProducts.map((product) => (
                          <TableRow
                            key={product.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <TableCell>
                              <div className="relative w-16 h-16">
                                <Image
                                  alt={product.name ?? "Product"}
                                  className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                  height={64}
                                  src={product.images?.[0] || "/placeholder.svg"}
                                  width={64}
                                />
                                {product.images && product.images.length > 1 && (
                                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                    +{product.images.length}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                                  {product.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  ID: {product.id}
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
                                  <div className="text-red-500 line-through text-sm">
                                    {product.price} ₾
                                  </div>
                                  <div className="text-green-600 font-bold">
                                    {product.discountPrice} ₾
                                  </div>
                                </div>
                              ) : (
                                <div className="text-green-600 font-bold">{product.price} ₾</div>
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
                            <TableCell className="hidden sm:table-cell">
                              <Switch
                                checked={product.isActive}
                                className="data-[state=checked]:bg-green-600"
                                onCheckedChange={() => toggleProductVisibility(product.id)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <div className="sm:hidden mr-1">
                                  <Switch
                                    checked={product.isActive}
                                    onCheckedChange={() => toggleProductVisibility(product.id)}
                                  />
                                </div>
                                <UpdateProductModal
                                  initialDescription={product.description}
                                  initialIsComingSoon={product.isComingSoon}
                                  initialIsLiquidated={product.isLiquidated}
                                  initialIsNewArrival={product.isNewArrival}
                                  productId={product.id}
                                  onSave={handleUpdateProduct}
                                />
                                <ReviewImagesModal />
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
    </div>
  );
}
