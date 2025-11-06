"use client";

import type { FacetModel, ProductFacetValueModel } from "@/types/facet";

import { useEffect, useState } from "react";
import { CheckSquare, Square, ChevronDown, ChevronRight, Layers } from "lucide-react";

import { getAllFacets } from "@/app/api/services/facetService";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FacetSelectorProps {
  categoryId: string;
  selectedFacetValues: ProductFacetValueModel[];
  onChange: (facetValues: ProductFacetValueModel[]) => void;
}

export function FacetSelector({
  categoryId,
  selectedFacetValues,
  onChange,
}: FacetSelectorProps) {
  const [facets, setFacets] = useState<FacetModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!categoryId) {
      setFacets([]);
      return;
    }

    let aborted = false;

    (async () => {
      setLoading(true);
      try {
        const data = await getAllFacets(categoryId);
        if (!aborted) {
          setFacets(data);
          // Auto-expand all facets
          setExpandedFacets(new Set(data.map(f => f.id)));
        }
      } catch (error) {
        console.error("Failed to load facets:", error);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [categoryId]);

  const toggleFacetExpanded = (facetId: string) => {
    setExpandedFacets((prev) => {
      const next = new Set(prev);
      if (next.has(facetId)) {
        next.delete(facetId);
      } else {
        next.add(facetId);
      }
      return next;
    });
  };

  const isFacetValueSelected = (facetValueId: string): boolean => {
    return selectedFacetValues.some((pfv) => pfv.facetValueId === facetValueId);
  };

  const toggleFacetValue = (facetValueId: string) => {
    const isSelected = isFacetValueSelected(facetValueId);

    if (isSelected) {
      // Remove
      onChange(selectedFacetValues.filter((pfv) => pfv.facetValueId !== facetValueId));
    } else {
      // Add
      onChange([
        ...selectedFacetValues,
        {
          id: crypto.randomUUID(),
          facetValueId,
        },
      ]);
    }
  };

  if (!categoryId) {
    return (
      <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          Please select a category first to see available facets
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          Loading facets...
        </p>
      </div>
    );
  }

  if (facets.length === 0) {
    return (
      <div className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          No facets available for this category
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Product Attributes (Facets)
      </Label>
      <ScrollArea className="h-[300px] rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
        <div className="p-4 space-y-3">
          {facets.map((facet) => {
            const isExpanded = expandedFacets.has(facet.id);
            const facetValues = facet.facetValues ?? [];
            const selectedCount = facetValues.filter((fv) =>
              isFacetValueSelected(fv.id)
            ).length;

            return (
              <Collapsible
                key={facet.id}
                open={isExpanded}
                onOpenChange={() => toggleFacetExpanded(facet.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      )}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {facet.name}
                      </span>
                    </div>
                    {selectedCount > 0 && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        {selectedCount} selected
                      </span>
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-1 pl-6">
                  {facetValues.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
                      No values available
                    </p>
                  ) : (
                    facetValues.map((facetValue) => {
                      const isSelected = isFacetValueSelected(facetValue.id);

                      return (
                        <button
                          key={facetValue.id}
                          type="button"
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                              : "hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                          }`}
                          onClick={() => toggleFacetValue(facetValue.id)}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          )}
                          <span className="text-sm">{facetValue.value}</span>
                        </button>
                      );
                    })
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
      {selectedFacetValues.length > 0 && (
        <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
          {selectedFacetValues.length} attribute{selectedFacetValues.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
