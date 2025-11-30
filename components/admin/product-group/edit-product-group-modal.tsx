/* eslint-disable no-console */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Package, DollarSign, Plus, Minus, Layers } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";
import {
  ProductGroupModel,
  searchProductsByFilter,
  updateProductGroup,
} from "@/app/api/services/productService";
import { ProductResponseModel } from "@/types/product";
import { FilterModel } from "@/types/filter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EditProductGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ProductGroupModel;
  categoryId?: string;
  brandId?: string;
  onGroupUpdated?: () => void;
}

export function EditProductGroupModal({
  open,
  onOpenChange,
  group,
  categoryId,
  brandId,
  onGroupUpdated,
}: EditProductGroupModalProps) {
  const isMobile = useIsMobile();
  const [filteredProducts, setFilteredProducts] = useState<ProductResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localProductIds, setLocalProductIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalProductIds(group.productIds || []);
    }
  }, [open, group.productIds]);

  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const filter: FilterModel = {};

          if (categoryId) {
            filter.categoryIds = [categoryId];
          }

          if (brandId) {
            filter.brandIds = [brandId];
          }

          // Fetch filtered products from server with large page size to get all results
          const result = await searchProductsByFilter({
            filter,
            page: 1,
            pageSize: 10000, // Large page size to get all products
            sortBy: "name",
          });

          setFilteredProducts(result.items || []);
        } catch (error) {
          console.error("Failed to fetch products:", error);
          setFilteredProducts([]);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [open, categoryId, brandId]);

  // Filter products by search term (client-side search only)
  const searchedProducts = useMemo(() => {
    if (!searchTerm) return filteredProducts;

    const search = searchTerm.toLowerCase();

    return filteredProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(search) ||
        p.id?.toLowerCase().includes(search)
    );
  }, [filteredProducts, searchTerm]);

  // Products in this group
  const productsInGroup = searchedProducts.filter((p) =>
    localProductIds.includes(p.id)
  );

  // Products not in this group (for potential addition)
  const productsNotInGroup = searchedProducts.filter(
    (p) => !localProductIds.includes(p.id)
  );

  const addProduct = (productId: string) => {
    setLocalProductIds((prev) => [...prev, productId]);
  };

  const removeProduct = (productId: string) => {
    setLocalProductIds((prev) => prev.filter((id) => id !== productId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProductGroup({
        ...group,
        productIds: localProductIds,
      });

      toast("Product group updated successfully");

      onGroupUpdated?.();
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update product group:", error);
      toast("Product group updated successfully");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localProductIds.sort()) !== JSON.stringify((group.productIds || []).sort());

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";

    return new Intl.NumberFormat("ka-GE", {
      style: "currency",
      currency: "GEL",
    }).format(price);
  };

  return (
    <Modal
      classNames={{
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
      }}
      hideCloseButton={isMobile}
      isOpen={open}
      scrollBehavior="inside"
      size={isMobile ? "full" : "5xl"}
      onClose={() => onOpenChange(false)}
    >
      <ModalContent className="h-full">
        {() => (
          <>
            {isMobile ? (
              <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                <GoBackButton onClick={() => onOpenChange(false)} />
                <div className="flex flex-col min-w-0">
                  <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    {group.name}
                  </span>
                  <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {productsInGroup.length} products in group
                  </span>
                </div>
              </ModalHeader>
            ) : (
              <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                      <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        {group.name}
                      </h2>
                      <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                        Edit product group
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categoryId && (
                      <Badge className="bg-purple-50 dark:bg-purple-900/20" variant="outline">
                        Category Filter Applied
                      </Badge>
                    )}
                    {brandId && (
                      <Badge className="bg-pink-50 dark:bg-pink-900/20" variant="outline">
                        Brand Filter Applied
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {productsInGroup.length} products in group
                    </Badge>
                  </div>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 bg-white/50 dark:bg-slate-800/50"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : (
            <>
              {/* Products in Group */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <h3 className="font-heading text-lg font-semibold">
                    Products in this Group
                  </h3>
                  <Badge variant="secondary">{productsInGroup.length}</Badge>
                </div>

                {productsInGroup.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    No products in this group match the current filters
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-purple-50 dark:bg-purple-900/20">
                          <TableRow>
                            <TableHead className="w-20">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right w-24">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productsInGroup.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                {product.images && product.images.length > 0 ? (
                                  <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                    <Image
                                      fill
                                      alt={product.name || "Product"}
                                      className="object-cover"
                                      src={product.images[0]}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {product.name || "Unnamed Product"}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {product.id}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(product.price)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    product.status === 1
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {product.status === 1
                                    ? "In Stock"
                                    : "Out of Stock"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeProduct(product.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {productsInGroup.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white dark:bg-slate-800 rounded-lg border p-4 space-y-3"
                        >
                          <div className="flex gap-3">
                            {product.images && product.images.length > 0 ? (
                              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  fill
                                  alt={product.name || "Product"}
                                  className="object-cover"
                                  src={product.images[0]}
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-medium truncate">
                                {product.name || "Unnamed Product"}
                              </h4>
                              <p className="font-primary text-sm text-muted-foreground truncate">
                                {product.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-primary font-semibold text-lg">
                                {formatPrice(product.price)}
                              </span>
                              <Badge
                                variant={
                                  product.status === 1
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {product.status === 1
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </Badge>
                            </div>
                            <Button
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeProduct(product.id)}
                            >
                              <Minus className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Filtered Products Not in Group */}
              {productsNotInGroup.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-pink-600" />
                    <h3 className="font-heading text-lg font-semibold">
                      Other Filtered Products
                    </h3>
                    <Badge variant="secondary">
                      {productsNotInGroup.length}
                    </Badge>
                  </div>

                  <p className="font-primary text-sm text-muted-foreground">
                    These products match your category/brand filters but are not
                    in this group
                  </p>

                  {/* Desktop Table */}
                  <div className="hidden md:block border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-pink-50 dark:bg-pink-900/20">
                        <TableRow>
                          <TableHead className="w-20">Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right w-24">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsNotInGroup.slice(0, 10).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              {product.images && product.images.length > 0 ? (
                                <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                  <Image
                                    fill
                                    alt={product.name || "Product"}
                                    className="object-cover"
                                    src={product.images[0]}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {product.name || "Unnamed Product"}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {product.id}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatPrice(product.price)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  product.status === 1
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {product.status === 1
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                size="sm"
                                variant="ghost"
                                onClick={() => addProduct(product.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {productsNotInGroup.slice(0, 10).map((product) => (
                      <div
                        key={product.id}
                        className="bg-white dark:bg-slate-800 rounded-lg border p-4 space-y-3"
                      >
                        <div className="flex gap-3">
                          {product.images && product.images.length > 0 ? (
                            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                fill
                                alt={product.name || "Product"}
                                className="object-cover"
                                src={product.images[0]}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading font-medium truncate">
                              {product.name || "Unnamed Product"}
                            </h4>
                            <p className="font-primary text-sm text-muted-foreground truncate">
                              {product.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-primary font-semibold text-lg">
                              {formatPrice(product.price)}
                            </span>
                            <Badge
                              variant={
                                product.status === 1 ? "default" : "secondary"
                              }
                            >
                              {product.status === 1
                                ? "In Stock"
                                : "Out of Stock"}
                            </Badge>
                          </div>
                          <Button
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            size="sm"
                            variant="ghost"
                            onClick={() => addProduct(product.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {productsNotInGroup.length > 10 && (
                    <p className="font-primary text-sm text-muted-foreground text-center">
                      Showing first 10 of {productsNotInGroup.length} products
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {hasChanges && (
                <span className="font-primary text-blue-600 dark:text-blue-400 font-medium">
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size={isMobile ? "sm" : "default"}
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!hasChanges || saving}
                size={isMobile ? "sm" : "default"}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
