"use client";

import { useEffect, useMemo, useState } from "react";
import { Tag, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateCategory } from "@/app/api/services/categoryService";
import type { CategoryModel } from "@/types/category";

interface Props {
  initialCategories: CategoryModel[];
}

export function CategoriesTable({ initialCategories }: Props) {
  const [categories, setCategories] = useState<CategoryModel[]>(initialCategories ?? []);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setCategories(initialCategories ?? []);
  }, [initialCategories]);

  const toggleCategoryVisibility = async (categoryId: string, nextVal: boolean) => {
    const current = categories.find((p) => p.id === categoryId);
    if (!current) return;

    const prev = categories;

    setCategories((list) =>
      list.map((c) => (c.id === categoryId ? { ...c, isActive: nextVal } : c)),
    );

    const payload: CategoryModel = {
      ...current,
      isActive: nextVal,
    };

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
        (c.name ?? "").toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [categories, searchTerm]);

  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            className="w-full md:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder:text-slate-500"
            placeholder="Search by name or description..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="overflow-auto max-h-[calc(100vh-240px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Facets</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((category) => {
              const parent = category.parentId
                ? categories.find((c) => c.id === category.parentId)
                : undefined;
              const isActive = !!category.isActive;

              return (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {category.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-xs">
                    <p className="truncate">{category.description}</p>
                  </TableCell>

                  <TableCell>
                    {parent ? (
                      <Badge
                        className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                        variant="outline"
                      >
                        {parent.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{category.facets?.length ?? 0} facets</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isActive}
                        className="data-[state=checked]:bg-blue-600"
                        onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
                      />
                      {isActive ? (
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-8 text-slate-500" colSpan={5}>
                  ჩანაწერები ვერ მოიძებნა.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
