"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ProductRequestModel, ProductResponseModel } from "@/types/product";
import { deleteProductById, getAllProducts, updateProduct } from "@/app/api/services/productService";
import UpdateProductModal from "./update-product-modal";
import ReviewImagesModal from "./review-images-modal";
import { toast } from "sonner";

export function ProductsTable() {
  const [products, setProducts] = useState<ProductResponseModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductById(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Error deleting product.");
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
      categoryId: current.category?.id ?? "",
      status: current.status,
      condition: current.condition,
      isActive: current.isActive,
      description,
      isLiquidated: flags.isLiquidated,
      isComingSoon: flags.isComingSoon,
      isNewArrival: flags.isNewArrival,
      images: current.images ?? [],
      brandId: current.brand?.id ?? "",
      productFacetValues: [],
    };

    try {
      await updateProduct(payload);
      setProducts(prev => prev.map(p => (p.id === productId ? patched : p)));
      toast.success("პროდუქტი წარმატებით განახლდა.");
    } catch (err) {
      console.error("Failed to update product", err);
      toast.error("პროდუქტის განახლება ვერ მოხერხდა.");
      setProducts(prevProducts);
    }
  };

  const toggleProductVisibility = (productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isActive: !product.isActive } : product
      )
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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


  return (
    <Card className="dark:bg-brand-muteddark bg-brand-muted backdrop-blur ">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(100vh-240px)]">
        {loading && <p className="p-4 text-gray-500">Loading products...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                return (
                  <TableRow key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell>
                      <div className="relative w-16 h-16">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name ?? "Product"}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                        />
                        {product.images && product.images.length > 1 && (
                          <span className="absolute top-1 right-1 bg-slate-800 text-white text-xs px-2 py-0.5 rounded-full opacity-90">
                            +{product.images.length}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">ID: {product.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                        {product.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {product.discountPrice ? (
                        <>
                          <span className="text-sm text-red-500 line-through">{product.price} ₾</span>
                          <span className="text-sm text-green-600 ml-2">{product.discountPrice} ₾</span>
                        </>
                      ) : (
                        <span className="text-sm text-green-600">{product.price} ₾</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={getStatusClass(product.status)}
                      >
                        {getStatusLabel(product.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={getConditionClass(product.condition)}
                      >
                        {getConditionLabel(product.condition)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={() => toggleProductVisibility(product.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        {product.isActive ? (
                          <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <div className="flex justify-end space-x-2">
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
                        </div>
                        <div className="flex justify-end space-x-2">
                          <ReviewImagesModal />
                        </div>
                        {/* <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the product "{product.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogContent>
                        </AlertDialog> */}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}