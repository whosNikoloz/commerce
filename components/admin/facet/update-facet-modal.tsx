"use client";

import type { CategoryModel } from "@/types/category";
import type { FacetModel, FacetValueModel } from "@/types/facet";

import { useEffect, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";

import FacetValuesEditor from "./facet-values-editor";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateFacet } from "@/app/api/services/facetService";
import { FacetValueNode } from "@/types/facet-ui";
import DisplayTypePicker from "./display-type-picker";
import { DisplayTypePreview } from "./displaytype-preview";

function toTree(list: FacetValueModel[]): FacetValueNode[] {
  const map = new Map<string, FacetValueNode>();
  const roots: FacetValueNode[] = [];

  for (const x of list) map.set(x.id, { ...x, children: [] });

  for (const x of list) {
    const node = map.get(x.id)!;

    if (x.parentId) {
      const parent = map.get(x.parentId);

      if (parent) parent.children!.push(node);
      else roots.push(node); // parent missing -> treat as root
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Facet</DialogTitle>
            <DialogDescription>Update facet settings and values</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* visual display-type picker + live preview */}
            <div className="grid gap-2">
              <Label>Display Type</Label>
              <DisplayTypePicker value={displayType} onChange={setDisplayType} />
              <div className="mt-3 rounded-lg border p-4 bg-muted/30">
                <div className="text-xs font-semibold mb-2">Preview</div>
                <DisplayTypePreview displayType={displayType} values={toFlat(values)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Custom</Label>
                <div className="h-10 rounded-md border flex items-center px-3">
                  <Switch checked={isCustom} onCheckedChange={setIsCustom} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Categories</Label>
                <select
                  className="h-10 rounded-md border bg-background px-3"
                  value={selectedCategories[0] ?? ""}
                  onChange={(e) => setSelectedCategories([e.target.value])}
                >
                  <option disabled value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Facet Values</Label>
              <FacetValuesEditor values={values} onChange={setValues} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={handleSave}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
