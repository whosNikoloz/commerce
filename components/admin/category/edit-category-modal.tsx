"use client";

import type { CategoryModel } from "@/types/category";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

import { Button } from "@/components/ui/button";
import { updateCategory } from "@/app/api/services/categoryService";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";

interface EditCategoryModalProps {
  open: boolean;
  category: CategoryModel;
  categories: CategoryModel[];
  onOpenChange: (open: boolean) => void;
  onCategoryUpdated?: () => void;
}

type FormState = {
  name: string;
  description: string;
  parentId: string;
};

export function EditCategoryModal({
  open,
  category,
  categories,
  onOpenChange,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  const isMobile = useIsMobile();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    name: category.name ?? "",
    description: category.description ?? "",
    parentId: category.parentId ?? "",
  });

  useEffect(() => {
    setFormData({
      name: category.name ?? "",
      description: category.description ?? "",
      parentId: category.parentId ?? "",
    });
  }, [category]);

  const parentOptions = useMemo(() => {
    // Prevent selecting self as parent; show simple hierarchy indicator
    return [
      { id: "", label: "No parent (top level)" },
      ...categories
        .filter((c) => c.id !== category.id)
        .map((c) => ({
          id: c.id,
          label: buildLabel(c, categories),
        })),
    ];
  }, [categories, category.id]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");

      return;
    }

    setSaving(true);
    try {
      const payload: CategoryModel = {
        ...category,
        name: formData.name.trim(),
        description: formData.description,
        parentId: formData.parentId || undefined,
        images: category.images ?? [],
      };

      await updateCategory(payload);
      toast.success("Category updated successfully");
      onCategoryUpdated?.();
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update category:", error);
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      classNames={{
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
      }}
      hideCloseButton={isMobile}
      isOpen={open}
      scrollBehavior="inside"
      size={isMobile ? "full" : "lg"}
      onClose={() => onOpenChange(false)}
    >
      <ModalContent className="h-full">
        {() => (
          <>
            {isMobile ? (
              <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                <GoBackButton onClick={() => onOpenChange(false)} />
                <div className="flex flex-col min-w-0">
                  <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    Edit Category
                  </span>
                  <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    Update details or move it under a parent
                  </span>
                </div>
              </ModalHeader>
            ) : (
              <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-col min-w-0">
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Edit Category
                  </h2>
                  <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                    Rename, update description, or choose a parent category.
                  </p>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-4">
              <Input
                required
                label="Category Name"
                labelPlacement="outside"
                placeholder="Category name"
                value={formData.name}
                variant="bordered"
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />

              <Textarea
                label="Description"
                labelPlacement="outside"
                minRows={3}
                placeholder="Add a short description"
                value={formData.description}
                variant="bordered"
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />

              <Select
                items={parentOptions}
                label="Parent Category"
                labelPlacement="outside"
                placeholder="Select parent (optional)"
                selectedKeys={formData.parentId ? [formData.parentId] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setFormData((prev) => ({ ...prev, parentId: selected || "" }));
                }}
              >
                {(item) => (
                  <SelectItem key={item.id} textValue={item.label}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
            </ModalBody>

            <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
              <div className="flex w-full items-center justify-end gap-2">
                <Button
                  disabled={saving}
                  size={isMobile ? "sm" : "default"}
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={saving}
                  size={isMobile ? "sm" : "default"}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function buildLabel(category: CategoryModel, categories: CategoryModel[]): string {
  const chain: string[] = [];
  let current: CategoryModel | undefined = category;

  while (current) {
    chain.unshift(current.name || "Untitled");
    current = current.parentId ? categories.find((c) => c.id === current?.parentId) : undefined;
  }

  return chain.join(" / ");
}
