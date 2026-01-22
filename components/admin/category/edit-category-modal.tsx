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
import { useDictionary } from "@/app/context/dictionary-provider";

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
  const dict = useDictionary();
  const t = dict.admin.categories.editModal;
  const tToast = dict.admin.categories.toast;
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
      { id: "", label: t.noParent },
      ...categories
        .filter((c) => c.id !== category.id)
        .map((c) => ({
          id: c.id,
          label: buildLabel(c, categories),
        })),
    ];
  }, [categories, category.id, t.noParent]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(tToast.enterCategoryName);

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
      toast.success(tToast.categoryUpdated);
      onCategoryUpdated?.();
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update category:", error);
      toast.error(tToast.categoryUpdateFailed);
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
                    {t.title}
                  </span>
                  <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    {t.subtitleMobile}
                  </span>
                </div>
              </ModalHeader>
            ) : (
              <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-col min-w-0">
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {t.title}
                  </h2>
                  <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                    {t.subtitle}
                  </p>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-4 md:space-y-6">
              <section className="space-y-3">

                <Input
                  required
                  classNames={{
                    inputWrapper:
                      "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                  }}
                  label={t.categoryName}
                  labelPlacement="outside"
                  placeholder={t.categoryNamePlaceholder}
                  value={formData.name}
                  variant="bordered"
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />

                <Textarea
                  classNames={{
                    inputWrapper:
                      "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                  }}
                  label={t.description}
                  labelPlacement="outside"
                  minRows={3}
                  placeholder={t.descriptionPlaceholder}
                  value={formData.description}
                  variant="bordered"
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </section>

              <section className="space-y-3">
                <Select
                  classNames={{
                    trigger:
                      "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                  }}
                  items={parentOptions}
                  label={t.parentCategory}
                  labelPlacement="outside"
                  placeholder={t.parentPlaceholder}
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
              </section>
            </ModalBody>

            <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
              <div className="flex w-full items-center justify-between gap-3">
                <p className="font-primary hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                  {t.footerNote}
                </p>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    className="rounded-lg border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    disabled={saving}
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                    disabled={saving}
                    size={isMobile ? "sm" : "default"}
                    onClick={handleSave}
                  >
                    {saving ? t.saving : t.saveChanges}
                  </Button>
                </div>
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
