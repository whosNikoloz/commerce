"use client";

import type { CategoryModel } from "@/types/category";

import { useEffect, useMemo, useState } from "react";
import { Tag, Eye, EyeOff, Trash2 } from "lucide-react";
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
import { updateCategory, deleteCategory, getAllCategories } from "@/app/api/services/categoryService";

const AddCategoryModal = dynamic(() => import("./add-category-modal"), { ssr: false });

interface Props {
  initialCategories: CategoryModel[];
}

export function CategoriesTable({ initialCategories }: Props) {
  const { config } = useTenant();
  const isCustomMerchant = config?.merchantType === "CUSTOM";

  const [categories, setCategories] = useState<CategoryModel[]>(initialCategories ?? []);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setCategories(initialCategories ?? []);
  }, [initialCategories]);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error("Failed to delete category", err);
      toast.error("Failed to delete category");
    }
  };

  const refreshCategories = async () => {
    try {
      const fresh = await getAllCategories();

      setCategories(fresh);
    } catch (error) {
      console.error("Failed to refresh categories", error);
    }
  };

  const toggleCategoryVisibility = async (categoryId: string, nextVal: boolean) => {
    const current = categories.find((p) => p.id === categoryId);

    if (!current) return;

    const prev = categories;

    setCategories((list) =>
      list.map((c) => (c.id === categoryId ? { ...c, isActive: nextVal } : c)),
    );

    const payload: CategoryModel = { ...current, isActive: nextVal };

    try {
      await updateCategory(payload);
      toast.success("კატეგორია წარმატებით განახლდა.");
    } catch (err) {
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
        (c.name ?? "").toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, searchTerm]);

  return (
    <Card className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none rounded-lg" />
      <CardHeader className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Add Category Button - Only for CUSTOM merchants */}
          {isCustomMerchant && (
            <AddCategoryModal categories={categories} onCategoryAdded={refreshCategories} />
          )}

          <div className="relative flex-1 max-w-md">
            <input
              className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2.5 text-sm
                         text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 dark:focus:border-emerald-600
                         shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              placeholder="🔍 Search categories..."
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
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">Category</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">Description</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">Parent</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">Facets</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">Status</TableHead>
                {isCustomMerchant && (
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold text-sm uppercase tracking-wide">Actions</TableHead>
                )}
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
                  className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20
                             transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800">
                        <Tag className="h-5 w-5 text-white" />
                      </div>
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

                  <TableCell className="max-w-xs">
                    <p className="truncate text-slate-600 dark:text-slate-400 font-medium">
                      {category.description}
                    </p>
                  </TableCell>

                  <TableCell>
                    {parent ? (
                      <Badge
                        className="border-2 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 font-semibold px-3 py-1"
                        variant="outline"
                      >
                        {parent.name}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 ring-1 ring-slate-200 dark:ring-slate-700"
                      variant="secondary"
                    >
                      {category.facets?.length ?? 0} facets
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isActive}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                        onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
                      />
                      {isActive ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800">
                          <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                          <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Inactive</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {isCustomMerchant && (
                    <TableCell>
                      <Button
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell className="text-center py-12" colSpan={5}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Tag className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">No categories found</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
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
                {/* Card Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 border-b-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800 flex-shrink-0">
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg truncate">{category.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                        ID: {category.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Description</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{category.description}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Parent</div>
                      {parent ? (
                        <Badge
                          className="border-2 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 font-semibold px-2 py-0.5 text-xs"
                          variant="outline"
                        >
                          {parent.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-medium text-sm">-</span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 text-right">Facets</div>
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
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</span>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isActive}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                        onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
                      />
                      {isActive ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800">
                          <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                          <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isCustomMerchant && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Tag className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold">No categories found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
