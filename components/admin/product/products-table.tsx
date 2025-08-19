"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Edit, Trash2, Search, Package, RefreshCw, MoreHorizontal, Filter, Grid, List, SortAsc } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ProductRequestModel, ProductResponseModel } from "@/types/product";
import { deleteProductById, getProductsByCategory, updateProduct } from "@/app/api/services/productService";
import UpdateProductModal from "./update-product-modal";
import ReviewImagesModal from "./review-images-modal";
import { toast } from "sonner";
import { CategoryTree } from "./category-tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type ViewMode = 'table' | 'grid';
type SortOption = 'name' | 'price' | 'created' | 'status';

export function ProductsTable() {
  const [products, setProducts] = useState<ProductRequestModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProductsByCategory(selectedCategoryId);
        setProducts(response);
      } catch (err) {
        setError("Failed to load products");
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
    flags: { isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean }
  ) => {
    const current = products.find(p => p.id === productId);
    if (!current) return;

    const prevProducts = products;

    const patched = {
      ...current,
      description,
      isLiquidated: flags.isLiquidated,
      isComingSoon: flags.isComingSoon,
      isNewArrival: flags.isNewArrival,
    };

    setProducts(prev =>
      prev.map(p => (p.id === productId ? patched : p))
    );

    const payload: ProductRequestModel = {
      id: current.id,
      name: current.name ?? "",
      price: current.price,
      discountPrice: current.discountPrice ?? undefined,
      categoryId: current.categoryId,
      status: current.status,
      condition: current.condition,
      isActive: current.isActive,
      description,
      isLiquidated: flags.isLiquidated,
      isComingSoon: flags.isComingSoon,
      isNewArrival: flags.isNewArrival,
      images: current.images ?? [],
      brandId: current.brandId,
      productFacetValues: current.productFacetValues ?? [],
    };

    try {
      await updateProduct(payload);
      toast.success("პროდუქტი წარმატებით განახლდა");
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("პროდუქტის განახლება ვერ მოხერხდა");
      setProducts(prevProducts);
    }
  };

  const toggleProductVisibility = async (productId: string) => {
    const current = products.find(p => p.id === productId);
    if (!current) return;

    const prevProducts = products;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isActive: !product.isActive } : product
      )
    );

    const payload: ProductRequestModel = {
      id: current.id,
      name: current.name ?? "",
      price: current.price,
      discountPrice: current.discountPrice ?? undefined,
      categoryId: current.categoryId ?? "",
      status: current.status,
      condition: current.condition,
      isActive: !current.isActive,
      description: current.description,
      isLiquidated: current.isLiquidated,
      isComingSoon: current.isComingSoon,
      isNewArrival: current.isNewArrival,
      images: current.images ?? [],
      brandId: current.brandId ?? "",
      productFacetValues: [],
    };

    try {
      await updateProduct(payload);
      toast.success("პროდუქტის ხილვადობა შეიცვალა");
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("პროდუქტის განახლება ვერ მოხერხდა");
      setProducts(prevProducts);
    }
  };

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price':
          return a.price - b.price;
        case 'status':
          return a.status - b.status;
        default:
          return 0;
      }
    });

  const getStatusClass = (status: StockStatus) => {
    switch (status) {
      case 0:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case 1:
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: StockStatus) => {
    switch (status) {
      case 0:
        return "მარაგშია";
      case 1:
        return "არ არის მარაგში";
      default:
        return "უცნობი სტატუსი";
    }
  };

  const getConditionClass = (condition: Condition) => {
    switch (condition) {
      case 0:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case 1:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case 2:
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getConditionLabel = (condition: Condition) => {
    switch (condition) {
      case 0:
        return "ახალი";
      case 1:
        return "მეორადი";
      case 2:
        return "როგორც ახალი";
      default:
        return "უცნობი მდგომარეობა";
    }
  };

  const ProductCard = ({ product }: { product: ProductRequestModel }) => (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <div className="relative w-full h-48">
            <Image
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.name ?? "Product"}
              fill
              className="rounded-lg object-cover"
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
          {/* <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {product.category?.name || "Uncategorized"}
            </Badge>
          </div> */}

          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusClass(product.status)}`}>
              {getStatusLabel(product.status)}
            </Badge>
            <Badge className={`text-xs ${getConditionClass(product.condition)}`}>
              {getConditionLabel(product.condition)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-medium">
              {product.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-500 line-through text-sm">{product.price} ₾</span>
                  <span className="text-green-600 text-sm font-bold">{product.discountPrice} ₾</span>
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
              <div className="flex items-center gap-1">
                <UpdateProductModal
                  productId={product.id}
                  initialDescription={product.description}
                  initialIsLiquidated={product.isLiquidated}
                  initialIsComingSoon={product.isComingSoon}
                  initialIsNewArrival={product.isNewArrival}
                  onSave={(id, desc, flags) => {
                    handleUpdateProduct(id, desc, flags);
                  }}
                />
                <ReviewImagesModal />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <CategoryTree onSelectCategory={setSelectedCategoryId} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="rounded-r-none border-r-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-l-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {selectedCategoryId && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Package className="h-4 w-4" />
                  <span>{filteredAndSortedProducts.length} products found</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-280px)] overflow-auto">
                {!selectedCategoryId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center p-6">
                    <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Select a Category
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500 max-w-sm">
                      Choose a category from the sidebar to view and manage products
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12 p-6">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-slate-600 dark:text-slate-400">Loading products...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 p-6">
                    <div className="text-red-500 mb-2">{error}</div>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center p-6">
                    <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500 max-w-sm">
                      {searchTerm ? "Try adjusting your search terms" : "No products available in this category"}
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredAndSortedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Visible</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedProducts.map((product) => (
                          <TableRow key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell>
                              <div className="relative w-16 h-16">
                                <Image
                                  src={product.images?.[0] || "/placeholder.svg"}
                                  alt={product.name ?? "Product"}
                                  width={64}
                                  height={64}
                                  className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
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
                                <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">ID: {product.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {product.discountPrice ? (
                                  <div className="space-y-1">
                                    <div className="text-red-500 line-through text-sm">{product.price} ₾</div>
                                    <div className="text-green-600 font-bold">{product.discountPrice} ₾</div>
                                  </div>
                                ) : (
                                  <div className="text-green-600 font-bold">{product.price} ₾</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className={getStatusClass(product.status)}>
                                {getStatusLabel(product.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className={getConditionClass(product.condition)}>
                                {getConditionLabel(product.condition)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={product.isActive}
                                  onCheckedChange={() => toggleProductVisibility(product.id)}
                                  className="data-[state=checked]:bg-green-600"
                                />
                                {product.isActive ? (
                                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <UpdateProductModal
                                  productId={product.id}
                                  initialDescription={product.description}
                                  initialIsLiquidated={product.isLiquidated}
                                  initialIsComingSoon={product.isComingSoon}
                                  initialIsNewArrival={product.isNewArrival}
                                  onSave={(id, desc, flags) => {
                                    handleUpdateProduct(id, desc, flags);
                                  }}
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