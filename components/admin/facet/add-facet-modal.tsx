"use client";

import type { CategoryModel } from "@/types/category";
import type { FacetValueModel } from "@/types/facet";


import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import FacetValuesEditor from "./facet-values-editor";
import DisplayTypePicker from "./display-type-picker";
import { DisplayTypePreview } from "./displaytype-preview";

import { FacetValueNode, hasChildren } from "@/types/facet-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFacet, type CreateFacetRequest } from "@/app/api/services/facetService";

export default function AddFacetModal({
  categories,
  disabled,
  presetCategoryId,           // ← current category from FacetsTable
  onCreated,
}: {
  categories: CategoryModel[];
  disabled?: boolean;
  presetCategoryId?: string;  // ← when present, we hide category picker
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [displayType, setDisplayType] = useState("1"); // default: Checkbox List
  const [isCustom, setIsCustom] = useState(true);

  // Keep local selectedCategories ONLY for the “no preset” case
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    presetCategoryId ? [presetCategoryId] : []
  );

  // If preset changes while modal is open, sync it
  useEffect(() => {
    if (presetCategoryId) setSelectedCategories([presetCategoryId]);
  }, [presetCategoryId]);

  const [values, setValues] = useState<FacetValueModel[]>([]);

  const effectiveCategoryIds = useMemo<string[]>(() => {
    // If parent passes presetCategoryId, force-use it and ignore local selector
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
      setOpen(false);
      setName("");
      setValues([]);
      // reset local selector only if we're in the manual-category mode
      if (!presetCategoryId) setSelectedCategories([]);
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
    <Dialog open={open} onOpenChange={(v) => { if (!disabled) setOpen(v); }}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" disabled={disabled}>
          <Plus className="h-4 w-4" /> Add Facet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Facet</DialogTitle>
          <DialogDescription>Create a new attribute (e.g., Size, Resolution)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fname">Name *</Label>
              <Input id="fname" placeholder="Size" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 grid gap-2">
                <Label>Display Type</Label>
                <DisplayTypePicker value={displayType} onChange={setDisplayType} />
                <div className="mt-3 rounded-lg border p-4 bg-muted/30">
                  <div className="text-xs font-semibold mb-2">Preview</div>
                  <DisplayTypePreview displayType={displayType} values={values} />
                </div>
              </div>

              {/* Custom toggle */}
              <div className="grid gap-2">
                <Label>Custom</Label>
                <div className="h-10 rounded-md border flex items-center px-3">
                  <Switch checked={isCustom} onCheckedChange={setIsCustom} />
                </div>
              </div>

              {/* Category picker (only if no preset) */}
              {!presetCategoryId && (
                <div className="grid gap-2">
                  <Label>Categories *</Label>
                  <Select
                    value={selectedCategories[0] ?? ""}
                    onValueChange={(v) => setSelectedCategories([v])}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Facet Values</Label>
              <FacetValuesEditor values={values} onChange={setValues} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading || !canSubmit} type="submit">
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
