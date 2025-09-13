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

interface CategoryTreeProps {
  Categories: CategoryModel[];
  onSelectCategory: (id: string | null) => void;
}

export function CategoryTree({ Categories, onSelectCategory }: CategoryTreeProps) {
  const [categories] = useState<CategoryModel[]>(Categories);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        className={`space-y-1 ${level > 0 ? "ml-4 pl-3 border-l border-brand-muted dark:border-brand-muteddark" : ""}`}
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
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 relative border",
                  isSelected
                    ? "bg-gradient-to-r from-brand-surface to-brand-surface/70 dark:from-brand-surfacedark dark:to-brand-surfacedark/70 border-brand-muted dark:border-brand-muteddark shadow-sm"
                    : "hover:bg-brand-surface dark:hover:bg-brand-surfacedark border-transparent",
                  isHighlighted && !isSelected ? "outline outline-1 outline-brand-primary/40" : "",
                ].join(" ")}
                role="button"
                onClick={() => handleCategorySelect(cat.id)}
              >
                {/* Toggle */}
                {hasChildCategories ? (
                  <button
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    className={[
                      "p-1 rounded-md transition-all duration-200",
                      isSelected
                        ? "hover:bg-brand-muted dark:hover:bg-brand-muteddark"
                        : "hover:bg-brand-muted/70 dark:hover:bg-brand-muteddark/70",
                    ].join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(cat.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-text-subtle" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-text-subtle" />
                    )}
                  </button>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-muted" />
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center">
                  {hasChildCategories ? (
                    isExpanded ? (
                      <FolderOpen
                        className={`h-4 w-4 ${isSelected ? "text-brand-primary" : "text-text-subtle"}`}
                      />
                    ) : (
                      <Folder
                        className={`h-4 w-4 ${isSelected ? "text-brand-primary" : "text-text-subtle"}`}
                      />
                    )
                  ) : (
                    <Tag
                      className={`h-4 w-4 ${isSelected ? "text-brand-primary" : "text-text-subtle"}`}
                    />
                  )}
                </div>

                {/* Name */}
                <span
                  className={[
                    "flex-1 text-sm font-medium truncate",
                    isSelected
                      ? "text-text-light dark:text-text-lightdark"
                      : "text-text-light dark:text-text-lightdark",
                    isHighlighted && !isSelected ? "underline decoration-brand-primary/50" : "",
                  ].join(" ")}
                  title={cat.name}
                >
                  {cat.name}
                </span>

                {/* Count */}
                {childrenCount > 0 && (
                  <Badge
                    className={[
                      "text-xs px-2 py-0.5 h-5 font-medium",
                      isSelected
                        ? "bg-brand-primary/15 text-brand-primary"
                        : "bg-brand-muted text-text-subtle dark:bg-brand-muteddark",
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
    <Card className="lg:sticky lg:top-4 bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted/60 dark:border-brand-muteddark/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-text-subtle" />
            <CardTitle className="text-lg text-text-light dark:text-text-lightdark">
              Categories
            </CardTitle>
            <Badge
              className="text-xs font-normal bg-brand-muted text-text-subtle dark:bg-brand-muteddark"
              variant="outline"
            >
              {rootCategories.length}
            </Badge>
          </div>

          {selectedCategory !== null && (
            <Button
              aria-label="Clear selection"
              className="h-7 w-7 p-0 text-text-subtle hover:text-text-light dark:hover:text-text-lightdark"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle h-4 w-4" />
          <Input
            className="pl-9 h-8 text-sm bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="lg:h-[calc(100vh-320px)] pr-3">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-text-subtle/40 mx-auto mb-3" />
              <p className="text-text-subtle text-sm">No categories found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* All Categories */}
              <div
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border",
                  selectedCategory === null
                    ? "bg-gradient-to-r from-brand-surface to-brand-surface/70 dark:from-brand-surfacedark dark:to-brand-surfacedark/70 border-brand-muted dark:border-brand-muteddark shadow-sm"
                    : "hover:bg-brand-surface dark:hover:bg-brand-surfacedark border-transparent",
                ].join(" ")}
                role="button"
                onClick={() => handleCategorySelect(null)}
              >
                <Folder className="h-4 w-4 text-text-subtle" />
                <span className="text-sm font-medium text-text-light dark:text-text-lightdark">
                  All Categories
                </span>
                <Badge
                  className="text-xs px-2 py-0.5 h-5 font-medium bg-brand-muted text-text-subtle dark:bg-brand-muteddark"
                  variant="secondary"
                >
                  {rootCategories.length}
                </Badge>
              </div>

              {renderTree(categories, null)}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
