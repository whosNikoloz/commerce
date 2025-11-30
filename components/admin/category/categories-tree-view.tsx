"use client";

import type { CategoryModel } from "@/types/category";

import Image from "next/image";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Plus,
  Minus,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTenant } from "@/app/context/tenantContext";
import {
  updateCategory,
  deleteCategory,
  getAllCategories,
} from "@/app/api/services/categoryService";
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

const AddCategoryModal = dynamic(() => import("./add-category-modal"), { ssr: false });
const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });

interface Props {
  initialCategories: CategoryModel[];
}

export function CategoriesTreeView({ initialCategories }: Props) {
  const { config } = useTenant();
  const isCustomMerchant = config?.merchantType === "CUSTOM";

  const [categories, setCategories] = useState<CategoryModel[]>(initialCategories ?? []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryModel | null>(null);

  const refreshCategories = async () => {
    try {
      const fresh = await getAllCategories();

      setCategories(fresh ?? []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to refresh categories", error);
    }
  };

  const handleImagesChanged = (categoryId: string, urls: string[]) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, images: urls } : c)),
    );
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    // Check if category has children
    const hasChildren = categories.some((c) => c.parentId === categoryToDelete.id);

    if (hasChildren) {
      toast.error("Cannot delete category with subcategories. Please delete child categories first.");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);

      return;
    }

    try {
      await deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast.success("Category deleted successfully");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete category", err);
      toast.error("Failed to delete category");
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const toggleCategoryVisibility = async (categoryId: string, nextVal: boolean) => {
    const current = categories.find((p) => p.id === categoryId);

    if (!current) return;

    const prev = categories;

    setCategories((list) =>
      list.map((c) => (c.id === categoryId ? { ...c, isActive: nextVal } : c)),
    );

    const payload: CategoryModel = { ...current, isActive: nextVal, images: current.images ?? [] };

    try {
      await updateCategory(payload);
      toast.success("Category updated successfully");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update category", err);
      setCategories(prev);
      toast.error("Failed to update category");
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const next = new Set(expanded);

    next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
    setExpanded(next);
  };

  const expandAll = () => {
    const allParents = new Set<string>();

    categories.forEach((cat) => {
      if (categories.some((c) => c.parentId === cat.id)) {
        allParents.add(cat.id);
      }
    });
    setExpanded(allParents);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    if (!q) return categories;

    return categories.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, searchTerm]);

  const hasChildren = (categoryId: string): boolean =>
    categories.some((c) => c.parentId === categoryId);

  // Desktop View
  const renderDesktopRow = (category: CategoryModel, level: number = 0) => {
    const isExpanded = expanded.has(category.id);
    const isActive = !!category.isActive;
    const hasChildCategories = hasChildren(category.id);
    const childrenCount = categories.filter((c) => c.parentId === category.id).length;

    return (
      <div key={category.id} className="relative">
        <div
          className="group flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-4 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
          style={{ paddingLeft: `${level * 24 + 8}px` }}
        >
          {/* Expand/Collapse Toggle */}
          <div className="flex-shrink-0 w-5 sm:w-6">
            {hasChildCategories ? (
              <button
                aria-label={isExpanded ? "Collapse category" : "Expand category"}
                className="p-0.5 sm:p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
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
            {hasChildCategories ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 dark:text-amber-400" />
              ) : (
                <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-500" />
              )
            ) : (
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          {/* Image */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <Image
              alt={category.name ?? "Category"}
              className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              height={48}
              src={category.images?.[0] || "/placeholder.png"}
              width={48}
            />
            {!!category.images && category.images.length > 1 && (
              <span className="font-primary absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full font-medium text-[10px]">
                +{category.images.length}
              </span>
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                {category.name}
              </div>
              {childrenCount > 0 && (
                <Badge className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold px-1 sm:px-1.5" variant="secondary">
                  {childrenCount}
                </Badge>
              )}
              <Badge className="text-[10px] sm:text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-1 sm:px-1.5 hidden sm:inline-flex" variant="secondary">
                {category.facets?.length ?? 0} facets
              </Badge>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 hidden sm:block">
              {category.description}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
              {category.id}
            </div>
          </div>

          {/* Status Toggle - Desktop */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <Switch
              checked={isActive}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
              onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
            />
            {isActive ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800">
                <Eye className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-primary text-xs font-bold text-emerald-700 dark:text-emerald-400">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                <EyeOff className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                <span className="font-primary text-xs font-bold text-slate-600 dark:text-slate-400">Hidden</span>
              </div>
            )}
          </div>

          {/* Status Badge - Mobile/Tablet */}
          <div className="lg:hidden flex-shrink-0">
            {isActive ? (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                <Eye className="h-3 w-3" />
              </Badge>
            ) : (
              <Badge className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-xs">
                <EyeOff className="h-3 w-3" />
              </Badge>
            )}
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <ReviewImagesModal
              categoryId={category.id}
              existing={(category.images ?? []).map((url, idx) => ({
                key: idx.toString(),
                url,
              }))}
              maxFiles={8}
              maxSizeMB={5}
              onChanged={(urls) => handleImagesChanged(category.id, urls)}
            />
            {isCustomMerchant && (
              <Button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryToDelete(category);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Actions - Mobile Dropdown */}
          <div className="md:hidden flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Category actions menu" className="h-8 w-8 p-0" size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleCategoryVisibility(category.id, !isActive)}>
                  {isActive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Category
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Category
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const modal = document.querySelector(`[data-category-id="${category.id}"]`);

                    if (modal) (modal as HTMLElement).click();
                  }}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Images
                </DropdownMenuItem>
                {isCustomMerchant && (
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={() => {
                      setCategoryToDelete(category);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Hidden trigger for modal */}
            <div className="hidden">
              <ReviewImagesModal
                categoryId={category.id}
                existing={(category.images ?? []).map((url, idx) => ({
                  key: idx.toString(),
                  url,
                }))}
                maxFiles={8}
                maxSizeMB={5}
                onChanged={(urls) => handleImagesChanged(category.id, urls)}
              />
            </div>
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && hasChildCategories && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            {categories
              .filter((c) => c.parentId === category.id)
              .map((child) => renderDesktopRow(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCategories = filtered.filter((c) => c.parentId === null || c.parentId === "");

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none rounded-lg" />

      <CardHeader className="relative p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top Row: Add Button + Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isCustomMerchant && (
                <AddCategoryModal categories={categories} onCategoryAdded={refreshCategories} />
              )}
              <Button
                className="text-xs sm:text-sm font-semibold flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                onClick={expandAll}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-primary hidden sm:inline">Expand All</span>
                <span className="font-primary sm:hidden">Expand</span>
              </Button>
              <Button
                className="text-xs sm:text-sm font-semibold flex-1 sm:flex-none"
                size="sm"
                variant="outline"
                onClick={collapseAll}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="font-primary hidden sm:inline">Collapse All</span>
                <span className="font-primary sm:hidden">Collapse</span>
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <Input
                aria-label="Search categories"
                className="pl-8 sm:pl-9 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-400 dark:focus:border-emerald-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm h-9"
                placeholder="Search categories..."
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
                <span className="font-primary hidden sm:inline">{rootCategories.length} root</span>
                <span className="font-primary sm:hidden">{rootCategories.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
              <span className="font-primary font-semibold text-slate-700 dark:text-slate-300">
                <span className="font-primary hidden sm:inline">{categories.length} total</span>
                <span className="font-primary sm:hidden">{categories.length}</span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-auto max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-280px)] relative p-0">
        {rootCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 sm:py-12 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <p className="font-primary text-sm sm:text-base text-slate-500 dark:text-slate-400 font-semibold text-center">
              No categories found
            </p>
            <p className="font-primary text-xs sm:text-sm text-slate-400 dark:text-slate-500 text-center">
              {searchTerm ? "Try adjusting your search" : "Add your first category to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {rootCategories.map((category) => renderDesktopRow(category, 0))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              Delete Category?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {categoryToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-primary font-bold text-slate-900 dark:text-slate-100">
                    {categoryToDelete.name}
                  </span>
                  ? This action cannot be undone and will permanently delete the category.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteCategory}
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
