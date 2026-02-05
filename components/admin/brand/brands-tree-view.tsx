"use client";

import type { BrandModel } from "@/types/brand";
import { getBrandCoverImageUrl } from "@/types/brand";

import Image from "next/image";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Trash2,
  Search,
  Plus,
  Minus,
  MoreVertical,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDictionary } from "@/app/context/dictionary-provider";
import {
  updateBrand,
  deleteBrand,
  getAllBrands,
  createBrand,
} from "@/app/api/services/brandService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const AddBrandModal = dynamic(() => import("./add-brand-modal"), { ssr: false });
const UpdateBrandModal = dynamic(() => import("./update-brad-modal"), { ssr: false });
const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });

interface Props {
  initialBrands: BrandModel[];
}

export function BrandsTreeView({ initialBrands }: Props) {
  const dict = useDictionary();
  const t = dict.admin.brands.treeView || dict.admin.brands.table;
  const tToast = dict.admin.brands.toast;

  const [brands, setBrands] = useState<BrandModel[]>(initialBrands ?? []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<BrandModel | null>(null);

  const refreshBrands = async () => {
    try {
      const fresh = await getAllBrands();

      setBrands(fresh ?? []);
    } catch (error) {
      console.error("Failed to refresh brands", error);
    }
  };

  const handleImagesChanged = async (brandId: string, urls: string[]) => {
    const current = brands.find((b) => b.id === brandId);

    if (!current) return;

    const prev = brands;
    const patched: BrandModel = { ...current, images: urls };

    setBrands((prevList) => prevList.map((b) => (b.id === brandId ? patched : b)));

    try {
      await updateBrand(patched);
      toast.success(tToast.updated);
    } catch (err) {
      console.error("Failed to persist brand image order", err);
      toast.error(tToast.updateFailed);
      setBrands(prev);
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;

    // Check if brand has children
    const hasChildren = brands.some((b) => b.parentId === brandToDelete.id);

    if (hasChildren) {
      toast.error(t.cannotDeleteWithChildren || "Cannot delete brand with sub-brands");
      setDeleteDialogOpen(false);
      setBrandToDelete(null);

      return;
    }

    try {
      await deleteBrand(brandToDelete.id);
      setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
      toast.success(tToast.deleted);
    } catch (err) {
      console.error("Failed to delete brand", err);
      toast.error(tToast.deleteFailed);
    } finally {
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };

  const handleUpdateBrand = async (
    brandId: string,
    name: string,
    description: string,
    origin: string,
    parentId?: string | null,
  ) => {
    const current = brands.find((b) => b.id === brandId);

    if (!current) return;

    const prev = brands;
    const patched: BrandModel = {
      ...current,
      name,
      description,
      origin,
      parentId: parentId ?? current.parentId,
      images: current.images,
    };

    setBrands((list) => list.map((b) => (b.id === brandId ? patched : b)));
    try {
      await updateBrand(patched);
      toast.success(tToast.updated);
    } catch (err) {
      console.error("Failed to update brand", err);
      setBrands(prev);
      toast.error(tToast.updateFailed);
    }
  };

  const handleCreateBrand = async (
    name: string,
    description: string,
    origin: string,
    parentId?: string | null,
  ) => {
    const tempId = `temp-${Date.now()}`;
    const prev = brands;
    const draft: BrandModel = { id: tempId, name, description, origin, images: [], parentId: parentId ?? null };

    setBrands([draft, ...prev]);
    try {
      const createdId: string = await createBrand(name, origin, description, [], parentId);

      setBrands((list) => list.map((b) => (b.id === tempId ? { ...b, id: createdId } : b)));
      toast.success(tToast.created);
    } catch (err) {
      console.error("Failed to create brand", err);
      setBrands(prev);
      toast.error(tToast.createFailed);
    }
  };

  const toggleExpanded = (brandId: string) => {
    const next = new Set(expanded);

    next.has(brandId) ? next.delete(brandId) : next.add(brandId);
    setExpanded(next);
  };

  const expandAll = () => {
    const allParents = new Set<string>();

    brands.forEach((brand) => {
      if (brands.some((b) => b.parentId === brand.id)) {
        allParents.add(brand.id);
      }
    });
    setExpanded(allParents);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return brands;

    return brands.filter(
      (b) =>
        (b.name ?? "").toLowerCase().includes(q) ||
        (b.origin ?? "").toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q),
    );
  }, [brands, searchTerm]);

  const hasChildren = (brandId: string): boolean =>
    brands.some((b) => b.parentId === brandId);

  const renderBrandRow = (brand: BrandModel, level: number = 0) => {
    const isExpanded = expanded.has(brand.id);
    const hasChildBrands = hasChildren(brand.id);
    const childrenCount = brands.filter((b) => b.parentId === brand.id).length;

    return (
      <div key={brand.id} className="relative">
        <div
          className="group flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-4 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-950/20 dark:hover:to-blue-950/20 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {/* Expand/Collapse Toggle */}
          <div className="flex-shrink-0 w-5 sm:w-6">
            {hasChildBrands ? (
              <button
                aria-label={isExpanded ? "Collapse brand" : "Expand brand"}
                className="p-0.5 sm:p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(brand.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
                )}
              </button>
            ) : (
              <div className="w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            )}
          </div>

          {/* Icon */}
          <div className="flex-shrink-0 hidden sm:block">
            {hasChildBrands ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 dark:text-purple-400" />
              ) : (
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-500" />
              )
            ) : (
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>

          {/* Image */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <Image
              alt={brand.name ?? "Brand"}
              className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              height={48}
              src={getBrandCoverImageUrl(brand.images) || "/placeholder.png"}
              width={48}
            />
            {!!brand.images && brand.images.length > 1 && (
              <span className="font-primary absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1 py-0.5 rounded-full font-medium text-[10px]">
                +{brand.images.length}
              </span>
            )}
          </div>

          {/* Brand Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                {brand.name}
              </div>
              {childrenCount > 0 && (
                <Badge className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold px-1 sm:px-1.5" variant="secondary">
                  {childrenCount} sub
                </Badge>
              )}
              {brand.origin && (
                <Badge className="text-[10px] sm:text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-1 sm:px-1.5 hidden sm:inline-flex" variant="secondary">
                  {brand.origin}
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 hidden sm:block">
              {brand.description}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
              {brand.id}
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <UpdateBrandModal
              brandId={brand.id ?? ""}
              brands={brands}
              initialDescription={brand.description}
              initialName={brand.name}
              initialOrigin={brand.origin}
              initialParentId={brand.parentId}
              onSave={handleUpdateBrand}
            />
            <ReviewImagesModal
              brandId={brand.id}
              existing={(brand.images ?? []).map((url, idx) => ({
                key: (idx + 1).toString(),
                url,
              }))}
              maxFiles={8}
              maxSizeMB={5}
              onChanged={(urls) => handleImagesChanged(brand.id, urls)}
            />
            <Button
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setBrandToDelete(brand);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions - Mobile Dropdown */}
          <div className="md:hidden flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Brand actions menu" className="h-8 w-8 p-0" size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    // Trigger edit modal
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t.edit || "Edit"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Trigger images modal
                  }}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  {t.images || "Images"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => {
                    setBrandToDelete(brand);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.delete || "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && hasChildBrands && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            {brands
              .filter((b) => b.parentId === brand.id)
              .map((child) => renderBrandRow(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootBrands = filtered.filter((b) => b.parentId === null || b.parentId === "" || b.parentId === undefined);

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-lg" />

      <CardHeader className="relative p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top Row: Add Button + Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <AddBrandModal brands={brands} onCreate={handleCreateBrand} />
              <Button
                className="text-xs sm:text-sm font-semibold flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                onClick={expandAll}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-primary hidden sm:inline">{t.expandAll || "Expand All"}</span>
                <span className="font-primary sm:hidden">Expand</span>
              </Button>
              <Button
                className="text-xs sm:text-sm font-semibold flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                onClick={collapseAll}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-primary hidden sm:inline">{t.collapseAll || "Collapse All"}</span>
                <span className="font-primary sm:hidden">Collapse</span>
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <Input
                aria-label={t.searchPlaceholder || "Search brands..."}
                className="pl-8 sm:pl-9 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-400 dark:focus:border-purple-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm h-9"
                placeholder={t.searchPlaceholder || "Search brands..."}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Folder className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
              <span className="font-primary font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-primary hidden sm:inline">{rootBrands.length} root</span>
                <span className="font-primary sm:hidden">{rootBrands.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
              <span className="font-primary font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-primary hidden sm:inline">{brands.length} total</span>
                <span className="font-primary sm:hidden">{brands.length}</span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-280px)] relative p-0">
        {rootBrands.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 sm:py-12 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <p className="font-primary text-sm sm:text-base text-slate-500 dark:text-slate-400 font-semibold text-center">
              {t.noBrands || "No brands found"}
            </p>
            <p className="font-primary text-xs sm:text-sm text-slate-400 dark:text-slate-500 text-center">
              {searchTerm ? (t.adjustSearch || "Try adjusting your search") : (t.addFirstBrand || "Add your first brand to get started")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {rootBrands.map((brand) => renderBrandRow(brand, 0))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              {t.deleteDialogTitle || "Delete Brand"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {brandToDelete ? (
                <>
                  {t.deleteConfirmation || "Are you sure you want to delete"}{" "}
                  <span className="font-primary font-bold text-slate-900 dark:text-slate-100">
                    {brandToDelete.name}
                  </span>
                  {t.deleteWarning || "? This action cannot be undone."}
                </>
              ) : (
                t.actionCannotBeUndone || "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteBrand}
            >
              {t.deleteBrand || "Delete Brand"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
