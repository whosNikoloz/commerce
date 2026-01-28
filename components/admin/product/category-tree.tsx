"use client";

import type { CategoryModel } from "@/types/category";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Filter,
  X,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDictionary } from "@/app/context/dictionary-provider";

interface CategoryTreeProps {
  Categories: CategoryModel[];
  onSelectCategory: (id: string | null) => void;
  showCard?: boolean;
}

export function CategoryTree({ Categories, onSelectCategory, showCard = true }: CategoryTreeProps) {
  const [categories] = useState<CategoryModel[]>(Categories);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dictionary = useDictionary();
  const t = dictionary?.admin?.products.table || {};

  const toggleExpanded = (categoryId: string) => {
    const next = new Set(expanded);

    next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
    setExpanded(next);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    onSelectCategory(categoryId);
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    onSelectCategory(null);
  };

  const getChildrenCount = (parentId: string | null): number =>
    categories.filter((c) => c.parentId === parentId).length;
  const hasChildren = (categoryId: string): boolean =>
    categories.some((c) => c.parentId === categoryId);

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [categories, searchTerm],
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

  const renderTree = (cats: CategoryModel[], parentId: string | null = null, level: number = 0) => {
    const visibleCats = searchTerm
      ? cats.filter(
        (c) => c.parentId === parentId && filteredCategories.some((fc) => fc.id === c.id),
      )
      : cats.filter((c) => c.parentId === parentId);

    if (visibleCats.length === 0) return null;

    return (
      <div
        className={`space-y-1 ${level > 0 ? "ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-700" : ""}`}
      >
        {visibleCats.map((cat) => {
          const isExpanded = expanded.has(cat.id);
          const isSelected = selectedCategory === cat.id;
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
                  isHighlighted && !isSelected ? "ring-2 ring-blue-300 dark:ring-blue-700" : "",
                ].join(" ")}
                role="button"
                tabIndex={0}
                onClick={() => handleCategorySelect(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategorySelect(cat.id);
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
                      <ChevronDown className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                    ) : (
                      <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                    )}
                  </button>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-600"}`} />
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center">
                  {hasChildCategories ? (
                    isExpanded ? (
                      <FolderOpen
                        className={`h-4 w-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                      />
                    ) : (
                      <Folder
                        className={`h-4 w-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                      />
                    )
                  ) : (
                    <Tag
                      className={`h-4 w-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
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
                    isHighlighted && !isSelected ? "underline decoration-blue-500/50" : "",
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

  const TreeContent = (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 h-4 w-4" />
          <Input
            aria-label="Search categories"
            className="pl-9 h-9 text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className={`${showCard ? "lg:h-[calc(100vh-320px)]" : "h-[350px]"} pr-3`}>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-primary text-slate-600 dark:text-slate-400 text-sm font-medium">No categories found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* All Categories */}
              <div
                className={[
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 border-2",
                  selectedCategory === null
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 shadow-md"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700",
                ].join(" ")}
                role="button"
                tabIndex={0}
                onClick={() => handleCategorySelect(null)}
              >
                <Folder className={`h-4 w-4 ${selectedCategory === null ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                <span className={`text-sm font-semibold ${selectedCategory === null ? "text-blue-900 dark:text-blue-300" : "text-slate-900 dark:text-slate-100"}`}>
                  {t.allCategories}
                </span>
              </div>

              {renderTree(categories, null)}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );

  if (!showCard) {
    return TreeContent;
  }

  return (
    <Card className=" lg:sticky lg:top-4 bg-white/70 dark:bg-slate-900/70 border-2 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-sm">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-black text-slate-900 dark:text-slate-100">
              {t.categories}
            </CardTitle>
            <Badge
              className="text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              variant="outline"
            >
              {rootCategories.length}
            </Badge>
          </div>

          {selectedCategory !== null && (
            <Button
              aria-label="Clear selection"
              className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative">
        {TreeContent}
      </CardContent>
    </Card>
  );
}
