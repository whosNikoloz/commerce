"use client";

import type { CategoryModel } from "@/types/category";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductGroupCategoryTreeProps {
  categories: CategoryModel[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  searchTerm?: string;
}

export function ProductGroupCategoryTree({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchTerm = "",
}: ProductGroupCategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const next = new Set(expanded);

    next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
    setExpanded(next);
  };

  const getChildrenCount = (parentId: string | null): number =>
    categories.filter((c) => c.parentId === parentId).length;
  const hasChildren = (categoryId: string): boolean =>
    categories.some((c) => c.parentId === categoryId);

  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [categories, searchTerm]
  );

  const expandAllParents = (categoryId: string) => {
    const next = new Set(expanded);
    const findParentIds = (catId: string): string[] => {
      const category = categories.find((c) => c.id === catId);

      if (!category || !category.parentId) return [];

      return [category.parentId, ...findParentIds(category.parentId)];
    };

    findParentIds(categoryId).forEach((id) => next.add(id));
    setExpanded(next);
  };

  useEffect(() => {
    if (searchTerm && filteredCategories.length > 0) {
      filteredCategories.forEach((cat) => expandAllParents(cat.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categories]);

  const renderTree = (
    cats: CategoryModel[],
    parentId: string | null = null,
    level: number = 0
  ) => {
    const visibleCats = searchTerm
      ? cats.filter(
        (c) =>
          c.parentId === parentId &&
          filteredCategories.some((fc) => fc.id === c.id)
      )
      : cats.filter((c) => c.parentId === parentId);

    if (visibleCats.length === 0) return null;

    return (
      <div
        className={`space-y-1 ${level > 0 ? "ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-700" : ""}`}
      >
        {visibleCats.map((cat) => {
          const isExpanded = expanded.has(cat.id);
          const isSelected = selectedCategoryId === cat.id;
          const childrenCount = getChildrenCount(cat.id);
          const hasChildCategories = hasChildren(cat.id);
          const isHighlighted =
            searchTerm && cat.name?.toLowerCase().includes(searchTerm.toLowerCase());

          return (
            <div key={cat.id} className="group">
              <div
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 relative border-2",
                  isSelected
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 shadow-md"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700",
                  isHighlighted && !isSelected
                    ? "ring-2 ring-blue-300 dark:ring-blue-700"
                    : "",
                ].join(" ")}
                role="button"
                tabIndex={0}
                onClick={() => onSelectCategory(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCategory(cat.id);
                  }
                }}
              >
                {/* Toggle */}
                {hasChildCategories ? (
                  <button
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    className={[
                      "p-1 rounded-md transition-all duration-200",
                      isSelected
                        ? "hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700",
                    ].join(" ")}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(cat.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown
                        className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                      />
                    ) : (
                      <ChevronRight
                        className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                      />
                    )}
                  </button>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-600"}`}
                    />
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center">
                  {hasChildCategories ? (
                    isExpanded ? (
                      <FolderOpen
                        className={`h-4 w-4 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                      />
                    ) : (
                      <Folder
                        className={`h-4 w-4 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                      />
                    )
                  ) : (
                    <Tag
                      className={`h-4 w-4 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
                    />
                  )}
                </div>

                {/* Name */}
                <span
                  className={[
                    "flex-1 text-sm font-semibold truncate",
                    isSelected
                      ? "text-blue-900 dark:text-blue-300"
                      : "text-slate-900 dark:text-slate-100",
                    isHighlighted && !isSelected
                      ? "underline decoration-blue-500/50"
                      : "",
                  ].join(" ")}
                  title={cat.name}
                >
                  {cat.name}
                </span>

                {/* Count */}
                {childrenCount > 0 && (
                  <Badge
                    className={[
                      "text-xs px-2 py-0.5 h-5 font-bold",
                      isSelected
                        ? "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
                    ].join(" ")}
                    variant="secondary"
                  >
                    {childrenCount}
                  </Badge>
                )}
              </div>

              {/* Children */}
              {isExpanded && hasChildCategories && (
                <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                  {renderTree(cats, cat.id, level + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const rootCategories = categories.filter((c) => c.parentId === null);

  return (
    <ScrollArea className="h-full">
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <Folder className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-primary text-slate-600 dark:text-slate-400 text-sm font-medium">
            No categories found
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* All Categories */}
          <div
            className={[
              "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 border-2",
              selectedCategoryId === null
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 shadow-md"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700",
            ].join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => onSelectCategory(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCategory(null);
              }
            }}
          >
            <Folder
              className={`h-4 w-4 ${selectedCategoryId === null ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
            />
            <span
              className={`text-sm font-semibold ${selectedCategoryId === null ? "text-blue-900 dark:text-blue-300" : "text-slate-900 dark:text-slate-100"}`}
            >
              All Categories
            </span>
            <Badge
              className={`text-xs px-2 py-0.5 h-5 font-bold ml-auto ${selectedCategoryId === null ? "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"}`}
              variant="secondary"
            >
              {rootCategories.length}
            </Badge>
          </div>

          {renderTree(categories, null)}
        </div>
      )}
    </ScrollArea>
  );
}
