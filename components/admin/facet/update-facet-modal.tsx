/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import type { CategoryModel } from "@/types/category";
import type { FacetModel, FacetValueModel } from "@/types/facet";

import { useEffect, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
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

  useEffect(() => {
    if (!open) return;
    setName(facet.name ?? "");
    setDisplayType(String(facet.displayType ?? 1));
    setIsCustom(!!facet.isCustom);
    setSelectedCategories(facet.categoryIds ?? []);
    setValues(toTree(facet.facetValues ?? []));
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
                    <span className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      Edit Facet
                    </span>
                    <span className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      Update facet settings and values
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Edit Facet
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Custom
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Mark as custom facet
                    </p>
                  </div>
                  <Switch
                    isSelected={isCustom}
                    onValueChange={setIsCustom}
                  />
                </div>

                {/* Categories */}
                <Select
                  label="Category"
                  labelPlacement="outside"
                  placeholder="Select category"
                  selectedKeys={selectedCategories[0] ? [selectedCategories[0]] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setSelectedCategories(selected ? [selected] : []);
                  }}
                >
                  {categories.map((c) => (
                    <SelectItem key={c.id} textValue={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>

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
