"use client";

import type { CategoryModel } from "@/types/category";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Tag, Eye, EyeOff, Edit } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/app/context/tenantContext";
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
  updateCategory,
  deleteCategory,
  getAllCategories,
} from "@/app/api/services/categoryService";

const AddCategoryModal = dynamic(() => import("./add-category-modal"), { ssr: false });
const ReviewImagesModal = dynamic(() => import("./review-images-modal"), { ssr: false });
const EditCategoryModal = dynamic(
  () => import("./edit-category-modal").then((m) => m.EditCategoryModal),
  { ssr: false },
);

interface Props {
  initialCategories: CategoryModel[];
}

export function CategoriesTable({ initialCategories }: Props) {
  const { config } = useTenant();
  const isCustomMerchant = config?.merchantType === "CUSTOM";

  const [categories, setCategories] = useState<CategoryModel[]>(initialCategories ?? []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryModel | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryModel | null>(null);

  useEffect(() => {
    setCategories(initialCategories ?? []);
  }, [initialCategories]);

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

    // keep images & other fields when updating
    const payload: CategoryModel = { ...current, isActive: nextVal, images: current.images ?? [] };

    try {
      await updateCategory(payload);
      toast.success("კატეგორია წარმატებით განახლდა.");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update category", err);
      setCategories(prev);
      toast.error("კატეგორიის განახლება ვერ მოხერხდა.");
    }
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

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none rounded-lg" />
      <CardHeader className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {isCustomMerchant && (
            <AddCategoryModal categories={categories} onCategoryAdded={refreshCategories} />
          )}

          <div className="relative flex-1 max-w-md">
            <input
              aria-label="Search categories"
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 text-sm
                         text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-600
                         shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              placeholder="Search categories..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-auto max-h-[calc(100lvh-210px)] relative">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="border-b-2 border-slate-200 dark:border-slate-700">
                <TableHead className="w-[72px] sm:w-[80px] text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Image
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Description
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Parent
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Facets
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((category) => {
                const parent = category.parentId
                  ? categories.find((c) => c.id === category.parentId)
                  : undefined;
                const isActive = !!category.isActive;

                return (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20
                               transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
                  >
                    {/* IMAGE */}
                    <TableCell>
                      <div className="relative w-16 h-16">
                        <Image
                          alt={category.name ?? "Category"}
                          className="rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                          height={64}
                          src={category.images?.[0] || "/placeholder.png"}
                          width={64}
                        />
                        {!!category.images && category.images.length > 1 && (
                          <span className="font-primary absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                            +{category.images.length}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* CATEGORY / ID */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {category.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                            ID: {category.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* DESCRIPTION */}
                    <TableCell className="max-w-xs">
                      <p className="font-primary truncate text-slate-600 dark:text-slate-400 font-medium">
                        {category.description}
                      </p>
                    </TableCell>

                    {/* PARENT */}
                    <TableCell>
                      {parent ? (
                        <Badge
                          className="border-2 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold px-3 py-1"
                          variant="outline"
                        >
                          {parent.name}
                        </Badge>
                      ) : (
                        <span className="font-primary text-slate-400 dark:text-slate-500 font-medium">-</span>
                      )}
                    </TableCell>

                    {/* FACETS */}
                    <TableCell>
                      <Badge
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-700"
                        variant="secondary"
                      >
                        {category.facets?.length ?? 0} facets
                      </Badge>
                    </TableCell>

                    {/* STATUS + TOGGLE */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isActive}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                          onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
                        />
                        {isActive ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800">
                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-primary text-xs font-bold text-blue-700 dark:text-blue-400">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                            <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="font-primary text-xs font-bold text-slate-600 dark:text-slate-400">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
                          size="sm"
                          onClick={() => setCategoryToEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell className="text-center py-12" colSpan={7}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Tag className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="font-primary text-slate-500 dark:text-slate-400 font-semibold">
                        No categories found
                      </p>
                      <p className="font-primary text-sm text-slate-400 dark:text-slate-500">
                        Try adjusting your search
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filtered.map((category) => {
            const parent = category.parentId
              ? categories.find((c) => c.id === category.parentId)
              : undefined;
            const isActive = !!category.isActive;

            return (
              <div
                key={category.id}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image banner */}
                <div className="relative w-full h-40">
                  <Image
                    fill
                    alt={category.name ?? "Category"}
                    className="object-cover"
                    priority={false}
                    sizes="100vw"
                    src={category.images?.[0] || "/placeholder.png"}
                  />
                  {!!category.images && category.images.length > 1 && (
                    <span className="font-primary absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full">
                      +{category.images.length}
                    </span>
                  )}
                </div>

                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border-b-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800 flex-shrink-0">
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-black text-slate-900 dark:text-slate-100 text-lg truncate">
                        {category.name}
                      </h3>
                      <p className="font-primary text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                        ID: {category.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      Description
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {category.description}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Parent
                      </div>
                      {parent ? (
                        <Badge
                          className="border-2 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold px-2 py-0.5 text-xs"
                          variant="outline"
                        >
                          {parent.name}
                        </Badge>
                      ) : (
                        <span className="font-primary text-slate-400 dark:text-slate-500 font-medium text-sm">
                          -
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 text-right">
                        Facets
                      </div>
                      <Badge
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-1 ring-1 ring-slate-200 dark:ring-slate-700"
                        variant="secondary"
                      >
                        {category.facets?.length ?? 0}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-primary text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Status
                    </span>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isActive}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                        onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
                      />
                      {isActive ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800">
                          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-primary text-xs font-bold text-blue-700 dark:text-blue-400">
                            Active
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                          <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="font-primary text-xs font-bold text-slate-600 dark:text-slate-400">
                            Inactive
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                      size="sm"
                      onClick={() => setCategoryToEdit(category)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {isCustomMerchant && (
                      <>
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
                        <Button
                          className="flex-1"
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Tag className="h-8 w-8 text-slate-400" />
              </div>
              <p className="font-primary text-slate-500 dark:text-slate-400 font-semibold">No categories found</p>
              <p className="font-primary text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
            </div>
          )}
        </div>
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

      {categoryToEdit && (
        <EditCategoryModal
          categories={categories}
          category={categoryToEdit}
          open={Boolean(categoryToEdit)}
          onCategoryUpdated={refreshCategories}
          onOpenChange={(open) => {
            if (!open) setCategoryToEdit(null);
          }}
        />
      )}
    </Card>
  );
}
