"use client";

import type { CategoryModel } from "@/types/category";
import type { FacetValueModel } from "@/types/facet";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";

import FacetValuesEditor from "./facet-values-editor";
import DisplayTypePicker from "./display-type-picker";
import { DisplayTypePreview } from "./displaytype-preview";

import { FacetValueNode, hasChildren } from "@/types/facet-ui";
import { Button } from "@/components/ui/button";
import { createFacet, type CreateFacetRequest } from "@/app/api/services/facetService";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";

export default function AddFacetModal({
  categories,
  disabled,
  presetCategoryId,
  onCreated,
}: {
  categories: CategoryModel[];
  disabled?: boolean;
  presetCategoryId?: string;
  onCreated?: () => void;
}) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [displayType, setDisplayType] = useState("1");
  const [isCustom, setIsCustom] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    presetCategoryId ? [presetCategoryId] : []
  );

  useEffect(() => {
    if (presetCategoryId) setSelectedCategories([presetCategoryId]);
  }, [presetCategoryId]);

  const [values, setValues] = useState<FacetValueModel[]>([]);

  const effectiveCategoryIds = useMemo<string[]>(() => {
    if (presetCategoryId) return [presetCategoryId];

    return selectedCategories;
  }, [presetCategoryId, selectedCategories]);

  const payload: CreateFacetRequest = useMemo(
    () => ({
      name,
      displayType: parseInt(displayType, 10),
      isCustom,
      categoryId: effectiveCategoryIds[0] ?? "",
      facetValues: flattenValues(values),
    }),
    [name, displayType, isCustom, effectiveCategoryIds, values]
  );

  const canSubmit = name.trim().length > 0 && effectiveCategoryIds.length > 0;

  const resetForm = () => {
    setName("");
    setDisplayType("1");
    setIsCustom(true);
    setValues([]);
    if (!presetCategoryId) setSelectedCategories([]);
  };

  const handleOpen = () => {
    if (!disabled) {
      resetForm();
      onOpen();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("სავალდებულო ველები");

      return;
    }
    setLoading(true);
    try {
      // eslint-disable-next-line no-console
      console.log("Creating facet with payload:", JSON.stringify(payload, null, 2));
      await createFacet(payload);
      toast.success("Facet created");
      handleClose();
      onCreated?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to create facet:", e);
      toast.error("შექმნა ვერ მოხერხდა - Check console for details");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        disabled={disabled}
        onClick={handleOpen}
      >
        <Plus className="h-4 w-4" /> Add Facet
      </Button>

      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        scrollBehavior="inside"
        size={isMobile ? "full" : "3xl"}
        onClose={handleClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="h-full">
          {() => (
            <form className="flex h-full flex-col" onSubmit={handleSubmit}>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={handleClose} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      Add Facet
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      Create a new attribute (e.g., Size, Resolution)
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Add Facet
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      Create a new attribute (e.g., Size, Resolution)
                    </p>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-4">
                {/* Name */}
                <Input
                  required
                  label="Name"
                  labelPlacement="outside"
                  placeholder="Size"
                  value={name}
                  variant="bordered"
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Display Type */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Display Type
                  </div>
                  <DisplayTypePicker value={displayType} onChange={setDisplayType} />
                  <div className="mt-3 rounded-lg border p-4 bg-muted/30">
                    <div className="text-xs font-semibold mb-2">Preview</div>
                    <DisplayTypePreview displayType={displayType} values={values} />
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

                {/* Category Picker (only if no preset) */}
                {!presetCategoryId && (
                  <Select
                    isRequired
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
                    {categories.map(c => (
                      <SelectItem key={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}

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
                    disabled={loading}
                    size={isMobile ? "sm" : "default"}
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                    disabled={loading || !canSubmit}
                    size={isMobile ? "sm" : "default"}
                    type="submit"
                  >
                    {loading ? "Creating..." : "Create"}
                  </Button>
                </div>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

/** Robust flattener that:
 *  - accepts FacetValueNode | FacetValueModel (mixed)
 *  - guarantees an id for each node
 *  - uses `undefined` (not null) for root parentId
 *  - preserves order
 *  - skips empty rows (no value and no children)
 */
function flattenValues(
  values: Array<FacetValueNode | FacetValueModel>
): Array<Pick<FacetValueModel, "id" | "value" | "parentId">> {
  type Flat = Pick<FacetValueModel, "id" | "value" | "parentId">;
  const out: Flat[] = [];

  const ensureId = (id?: string) => id && id.length > 0 ? id : crypto.randomUUID();

  const walk = (arr: Array<FacetValueNode | FacetValueModel>, parentId?: string | null) => {
    for (const v of arr) {
      const children = hasChildren(v) ? (v.children ?? []) : [];
      const hasText = (v as FacetValueModel).value?.trim().length;

      // skip completely empty nodes w/ no children
      if (!hasText && children.length === 0) continue;

      const id = ensureId((v as FacetValueModel).id);

      // Only include parentId if it's actually set (not null/undefined)
      const item: any = {
        id,
        value: (v as FacetValueModel).value,
      };

      if (parentId) {
        item.parentId = parentId;
      }

      out.push(item);

      if (children.length) walk(children as Array<FacetValueNode | FacetValueModel>, id);
    }
  };

  walk(values, null);

  return out;
}
