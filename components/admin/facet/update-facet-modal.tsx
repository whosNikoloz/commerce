/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import type { CategoryModel } from "@/types/category";
import type { FacetModel, FacetValueModel } from "@/types/facet";

import { JSX, useEffect, useMemo, useState } from "react";
import { Edit, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";

import FacetValuesEditor from "./facet-values-editor";
import DisplayTypePicker from "./display-type-picker";
import { DisplayTypePreview } from "./displaytype-preview";

import { Button } from "@/components/ui/button";
import { updateFacet } from "@/app/api/services/facetService";
import { FacetValueNode } from "@/types/facet-ui";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";

function toTree(list: FacetValueModel[]): FacetValueNode[] {
  const map = new Map<string, FacetValueNode>();
  const roots: FacetValueNode[] = [];

  for (const x of list) map.set(x.id, { ...x, children: [] });

  for (const x of list) {
    const node = map.get(x.id)!;

    if (x.parentId) {
      const parent = map.get(x.parentId);

      if (parent) parent.children!.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }

  return Array.from(new Set(roots));
}

function toFlat(tree: FacetValueNode[]): FacetValueModel[] {
  const out: FacetValueModel[] = [];
  const walk = (arr: FacetValueNode[], parentId?: string) => {
    for (const n of arr) {
      const id = n.id || crypto.randomUUID();

      out.push({ id, value: n.value, parentId: parentId ?? undefined });
      if (n.children?.length) walk(n.children, id);
    }
  };

  walk(tree, undefined);

  return out;
}

export default function UpdateFacetModal({
  facet,
  categories,
  onUpdated,
}: {
  facet: FacetModel;
  categories: CategoryModel[];
  onUpdated?: (model: FacetModel) => void;
}) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(facet.name ?? "");
  const [displayType, setDisplayType] = useState(String(facet.displayType ?? 1));
  const [isCustom, setIsCustom] = useState(!!facet.isCustom);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(facet.categoryIds ?? []);
  const [values, setValues] = useState<FacetValueNode[]>(toTree(facet.facetValues ?? []));
  const [showCategoryTree, setShowCategoryTree] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setName(facet.name ?? "");
    setDisplayType(String(facet.displayType ?? 1));
    setIsCustom(!!facet.isCustom);
    setSelectedCategories(facet.categoryIds ?? []);
    setValues(toTree(facet.facetValues ?? []));
    setShowCategoryTree(false);
  }, [open, facet]);

  const model: FacetModel = useMemo(
    () => ({
      ...facet,
      name,
      displayType: parseInt(displayType, 10),
      isCustom,
      categoryIds: selectedCategories,
      facetValues: toFlat(values),
    }),
    [facet, name, displayType, isCustom, selectedCategories, values]
  );

  // Category tree helpers
  const { categoriesByParent, categoriesById } = useMemo(() => {
    const byParent: Record<string, CategoryModel[]> = {};
    const byId: Record<string, CategoryModel> = {};

    categories.forEach((cat) => {
      byId[cat.id] = cat;
      const parentKey = cat.parentId ?? "root";

      byParent[parentKey] = byParent[parentKey] || [];
      byParent[parentKey].push(cat);
    });

    Object.values(byParent).forEach((list) => {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    });

    return { categoriesByParent: byParent, categoriesById: byId };
  }, [categories]);

  const getChildren = (parentId: string | null) => categoriesByParent[parentId ?? "root"] || [];

  useEffect(() => {
    if (!selectedCategories.length) return;
    const selectedId = selectedCategories[0];

    setExpandedCategories((prev) => {
      const next = new Set(prev);
      let current = categoriesById[selectedId];

      while (current?.parentId) {
        next.add(current.parentId);
        current = categoriesById[current.parentId];
      }

      return next;
    });
  }, [selectedCategories, categoriesById]);

  useEffect(() => {
    const roots = categoriesByParent["root"] || [];
    const next = new Set<string>();

    roots.forEach((root) => {
      if (getChildren(root.id).length > 0) next.add(root.id);
    });

    setExpandedCategories((prev) => {
      const merged = new Set(prev);

      next.forEach((id) => merged.add(id));

      return merged;
    });
  }, [categoriesByParent]);

  const renderCategoryTree = (parentId: string | null, depth = 0): JSX.Element | null => {
    const children = getChildren(parentId);

    if (!children.length) return null;

    return (
      <div className={depth > 0 ? "ml-4 pl-3 border-l border-slate-200 dark:border-slate-700" : ""}>
        {children.map((cat) => {
          const hasChildren = getChildren(cat.id).length > 0;
          const isExpanded = expandedCategories.has(cat.id);
          const isSelected = selectedCategories.includes(cat.id);

          return (
            <div key={cat.id} className="py-0.5">
              <div
                className={[
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-all",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-800 dark:text-slate-100 border border-transparent",
                ].join(" ")}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedCategories([cat.id]);
                  setShowCategoryTree(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCategories([cat.id]);
                    setShowCategoryTree(false);
                  }
                }}
              >
                {hasChildren ? (
                  <button
                    aria-label={isExpanded ? "Collapse category" : "Expand category"}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCategories((prev) => {
                        const next = new Set(prev);

                        next.has(cat.id) ? next.delete(cat.id) : next.add(cat.id);

                        return next;
                      });
                    }}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                ) : (
                  <div className="w-5 h-5" />
                )}

                <span className="flex-1 truncate">{cat.name || "Untitled"}</span>
              </div>

              {hasChildren && isExpanded && renderCategoryTree(cat.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  async function handleSave() {
    setLoading(true);
    try {
      await updateFacet({ ...model, facetValues: toFlat(values) });
      toast.success("Facet updated");
      onUpdated?.(model);
      setOpen(false);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error("განახლება ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={open}
        scrollBehavior="inside"
        size={isMobile ? "full" : "3xl"}
        onClose={() => setOpen(false)}
      >
        <ModalContent className="h-full">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={() => setOpen(false)} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      Edit Facet
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      Update facet settings and values
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Edit Facet
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      Update facet settings and values
                    </p>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-4">
                {/* Name */}
                <Input
                  label="Name"
                  labelPlacement="outside"
                  placeholder="Facet name"
                  value={name}
                  variant="bordered"
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Display Type */}
                <div className="space-y-2">
                  <label className="font-primary text-sm font-medium text-slate-700 dark:text-slate-300">
                    Display Type
                  </label>
                  <DisplayTypePicker value={displayType} onChange={setDisplayType} />
                  <div className="mt-3 rounded-lg border p-4 bg-muted/30">
                    <div className="text-xs font-semibold mb-2">Preview</div>
                    <DisplayTypePreview displayType={displayType} values={toFlat(values)} />
                  </div>
                </div>

                {/* Custom Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-primary text-sm font-medium text-slate-900 dark:text-slate-100">
                      Custom
                    </p>
                    <p className="font-primary text-xs text-slate-600 dark:text-slate-400">
                      Mark as custom facet
                    </p>
                  </div>
                  <Switch
                    isSelected={isCustom}
                    onValueChange={setIsCustom}
                  />
                </div>

                {/* Categories */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                  <div className="mb-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Edit category selection from the tree (similar to facet settings/values).
                    </p>
                  </div>

                  {categories.length > 0 ? (
                    <div className="space-y-2">
                      <Button
                        className="w-full justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        type="button"
                        variant="outline"
                        onClick={() => setShowCategoryTree((prev) => !prev)}
                      >
                        <span className="truncate text-left">
                          {selectedCategories[0] && categoriesById[selectedCategories[0]]
                            ? categoriesById[selectedCategories[0]].name
                            : "Select category"}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-60 transition-transform ${showCategoryTree ? "rotate-180" : ""}`}
                        />
                      </Button>

                      {showCategoryTree && (
                        <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 p-2">
                            {renderCategoryTree(null)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      No categories available. Check console for errors.
                    </div>
                  )}
                </div>

                {/* Facet Values */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Facet Values
                  </div>
                  <FacetValuesEditor values={values} onChange={setValues} />
                </div>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                    disabled={loading}
                    size={isMobile ? "sm" : "default"}
                    onClick={handleSave}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
