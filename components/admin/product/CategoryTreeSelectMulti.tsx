"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Search } from "lucide-react";
import type { CategoryModel } from "@/types/category";

type CategoryNode = CategoryModel & { children: CategoryNode[] };

type SelectionMode = "single" | "multiple";

interface CategoryTreeSelectMultiProps {
  categories: CategoryModel[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  selectionMode?: SelectionMode;
  emptyState?: string;
  placeholder?: string;
}

interface BuiltTree {
  roots: CategoryNode[];
  parentLookup: Record<string, string | undefined>;
}

function buildCategoryTree(categories: CategoryModel[]): BuiltTree {
  const map = new Map<string, CategoryNode>();
  const parentLookup: Record<string, string | undefined> = {};

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
    parentLookup[cat.id] = cat.parentId ?? undefined;
  });

  const roots: CategoryNode[] = [];

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    nodes.forEach((n) => sortNodes(n.children));
  };

  sortNodes(roots);

  return { roots, parentLookup };
}

function filterTree(nodes: CategoryNode[], query: string): CategoryNode[] {
  if (!query.trim()) return nodes;

  const term = query.trim().toLowerCase();

  return nodes
    .map((node) => {
      const nameMatches = (node.name || node.id).toLowerCase().includes(term);
      const filteredChildren = filterTree(node.children, term);
      if (nameMatches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    })
    .filter(Boolean) as CategoryNode[];
}

export function CategoryTreeSelectMulti({
  categories,
  selectedIds,
  onSelectionChange,
  selectionMode = "multiple",
  emptyState = "No categories available.",
  placeholder = "Search categories...",
}: CategoryTreeSelectMultiProps) {
  const { roots, parentLookup } = useMemo(() => buildCategoryTree(categories), [categories]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Expand root nodes and ancestors of selected categories
    setExpanded((prev) => {
      const next = new Set(prev);
      roots.forEach((root) => next.add(root.id));

      selectedIds.forEach((id) => {
        let current = parentLookup[id];
        while (current) {
          next.add(current);
          current = parentLookup[current];
        }
      });

      return next;
    });
  }, [roots, selectedIds, parentLookup]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelection = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (selectionMode === "single") {
      onSelectionChange(isSelected ? [] : [id]);
    } else {
      onSelectionChange(
        isSelected ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
      );
    }
  };

  const renderNode = (node: CategoryNode, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedIds.includes(node.id);
    const padding = depth * 16;

    return (
      <div key={node.id} className="space-y-0.5">
        <div
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/30"
              : "hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          style={{ paddingLeft: padding + 8 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              aria-label={isExpanded ? "Collapse category" : "Expand category"}
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleToggleSelection(node.id)}
            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-slate-800 h-4 w-4"
          />

          <button
            type="button"
            onClick={() => handleToggleSelection(node.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {node.images?.[0] && (
              <img
                src={node.images[0]}
                alt={node.name || node.id}
                className="w-5 h-5 rounded object-cover border border-slate-200 dark:border-slate-700"
              />
            )}
            <span className={`text-sm ${isSelected ? "text-blue-700 dark:text-blue-300 font-medium" : "text-slate-800 dark:text-slate-100"}`}>
              {node.name || node.id}
            </span>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 dark:border-slate-700 ml-4">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredRoots = filterTree(roots, search);

  if (!categories.length) {
    return <p className="text-xs text-slate-500 dark:text-slate-400">{emptyState}</p>;
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="max-h-56 overflow-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-1.5 space-y-0.5">
          {filteredRoots.length > 0 ? (
            filteredRoots.map((node) => renderNode(node))
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-2 py-3 text-center">
              No categories match your search.
            </p>
          )}
        </div>
      </div>

      {/* Selected badges */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const cat = categories.find((c) => c.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-100 border border-blue-200 dark:border-blue-800"
              >
                {cat?.name || id}
                <button
                  type="button"
                  onClick={() => handleToggleSelection(id)}
                  className="text-blue-500 hover:text-red-500 transition-colors"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
