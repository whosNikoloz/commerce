"use client";

import type { CategoryModel } from "@/types/category";

import { useEffect, useMemo, useState } from "react";
import { Tag, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { updateCategory } from "@/app/api/services/categoryService";

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
    <Card className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark backdrop-blur">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            className="w-full md:w-64 rounded-md border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark px-3 py-2 text-sm text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Search by name or description..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="overflow-auto max-h-[calc(100lvh-210px)]">
        <Table>
          <TableHeader className="bg-brand-surface/60 dark:bg-brand-surfacedark/60">
            <TableRow>
              <TableHead className="text-text-subtle">Category</TableHead>
              <TableHead className="text-text-subtle">Description</TableHead>
              <TableHead className="text-text-subtle">Parent</TableHead>
              <TableHead className="text-text-subtle">Facets</TableHead>
              <TableHead className="text-text-subtle">Status</TableHead>
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
                  className="hover:bg-brand-surface/60 dark:hover:bg-brand-surfacedark/60"
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-text-subtle" />
                      <div>
                        <div className="font-medium text-text-light dark:text-text-lightdark">
                          {category.name}
                        </div>
                        <div className="text-sm text-text-subtle">ID: {category.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-xs">
                    <p className="truncate text-text-light dark:text-text-lightdark">
                      {category.description}
                    </p>
                  </TableCell>

                  <TableCell>
                    {parent ? (
                      <Badge
                        className="border border-brand-primary/30 text-brand-primary dark:text-brand-primary"
                        variant="outline"
                      >
                        {parent.name}
                      </Badge>
                    ) : (
                      <span className="text-text-subtle">-</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className="bg-brand-muted dark:bg-brand-muteddark text-text-light dark:text-text-lightdark"
                      variant="secondary"
                    >
                      {category.facets?.length ?? 0} facets
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isActive}
                        className="data-[state=checked]:bg-brand-primary"
                        onCheckedChange={(val) => toggleCategoryVisibility(category.id, val)}
                      />
                      {isActive ? (
                        <Eye className="h-4 w-4 text-brand-primary" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-text-subtle" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell className="text-center py-8 text-text-subtle" colSpan={5}>
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
