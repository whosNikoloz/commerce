"use client";

import type { ProductRequestModel } from "@/types/product";
import type { CategoryModel } from "@/types/category";
import type { BrandModel } from "@/types/brand";
import type { ProductFacetValueModel } from "@/types/facet";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockStatus, Condition } from "@/types/enums";
import { createProduct, getAllProductGroups, type ProductGroupModel } from "@/app/api/services/productService";
import { FacetSelector } from "./facet-selector";

interface AddProductModalProps {
  categories: CategoryModel[];
  brands: BrandModel[];
  onProductAdded?: () => void;
}

export default function AddProductModal({
  categories,
  brands,
  onProductAdded,
}: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productGroups, setProductGroups] = useState<ProductGroupModel[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountPrice: "",
    description: "",
    categoryId: "",
    brandId: "",
    productGroupId: "",
    status: StockStatus.InStock.toString(),
    condition: Condition.New.toString(),
  });

  const [selectedFacetValues, setSelectedFacetValues] = useState<ProductFacetValueModel[]>([]);

  // Fetch product groups when category or brand changes
  const fetchProductGroups = async () => {
    if (!formData.categoryId && !formData.brandId) return;

    setLoadingGroups(true);
    try {
      const groups = await getAllProductGroups(
        formData.categoryId || undefined,
        formData.brandId || undefined
      );
      console.log('🔍 Fetched product groups:', groups);
      console.log('🔍 First group structure:', groups[0]);
      setProductGroups(groups);
    } catch (error) {
      console.error("Failed to fetch product groups:", error);
      toast.error("Failed to load product groups");
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch groups when category or brand changes
  useState(() => {
    if (open && (formData.categoryId || formData.brandId)) {
      fetchProductGroups();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.categoryId || !formData.brandId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const productData: ProductRequestModel = {
        id: crypto.randomUUID(), // Generate new ID
        name: formData.name,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
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
        productGroupId: formData.productGroupId || undefined,
      };

      await createProduct(productData);
      toast.success("Product created successfully");

      // Reset form
      setFormData({
        name: "",
        price: "",
        discountPrice: "",
        description: "",
        categoryId: "",
        brandId: "",
        productGroupId: "",
        status: StockStatus.InStock.toString(),
        condition: Condition.New.toString(),
      });
      setSelectedFacetValues([]);
      setProductGroups([]);

      setOpen(false);
      onProductAdded?.();
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Add New Product
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Create a new product for your store
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="name">
                Product Name *
              </Label>
              <Input
                required
                className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                id="name"
                placeholder="e.g., iPhone 15 Pro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="price">
                  Price (₾) *
                </Label>
                <Input
                  required
                  className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  id="price"
                  min="0"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="discountPrice">
                  Discount Price (₾)
                </Label>
                <Input
                  className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  id="discountPrice"
                  min="0"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="description">
                Description
              </Label>
              <Textarea
                className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[100px]"
                id="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="category">
                  Category *
                </Label>
                <Select
                  required
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="brand">
                  Brand *
                </Label>
                <Select
                  required
                  value={formData.brandId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, brandId: value });
                    fetchProductGroups();
                  }}
                >
                  <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Group Selector */}
            <div className="grid gap-2">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="productGroup">
                Product Group (Variants)
                <span className="text-xs font-normal text-slate-500 ml-2">
                  Optional - Connect products that are variants of each other
                </span>
              </Label>
              <Select
                disabled={loadingGroups || (!formData.categoryId && !formData.brandId)}
                value={formData.productGroupId || undefined}
                onValueChange={(value) => {
                  console.log('✅ Selected productGroupId:', value);
                  setFormData({ ...formData, productGroupId: value === "none" ? "" : value });
                }}
              >
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder={loadingGroups ? "Loading groups..." : "Select product group (optional)"} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
                  <SelectItem value="none">None (standalone product)</SelectItem>
                  {productGroups.map((group) => {
                    console.log('🔍 Rendering group:', { id: group.id, name: group.name, fullObject: group });
                    return (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} (ID: {group.id})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!formData.categoryId && !formData.brandId && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Select a category or brand first to see available product groups
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="status">
                  Stock Status *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
                    <SelectItem value={StockStatus.InStock.toString()}>In Stock</SelectItem>
                    <SelectItem value={StockStatus.OutOfStock.toString()}>Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold" htmlFor="condition">
                  Condition *
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
                    <SelectItem value={Condition.New.toString()}>New</SelectItem>
                    <SelectItem value={Condition.Used.toString()}>Used</SelectItem>
                    <SelectItem value={Condition.LikeNew.toString()}>Like New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Facet Selector */}
            <div className="grid gap-2 pt-2">
              <FacetSelector
                categoryId={formData.categoryId}
                selectedFacetValues={selectedFacetValues}
                onChange={setSelectedFacetValues}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600"
              disabled={loading}
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
              disabled={loading}
              type="submit"
            >
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
