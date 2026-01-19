"use client";

import type { CategoryModel } from "@/types/category";

import { useState } from "react";
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
import { Textarea } from "@heroui/input";

import { Button } from "@/components/ui/button";
import { createCategory } from "@/app/api/services/categoryService";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";

interface AddCategoryModalProps {
  categories: CategoryModel[];
  onCategoryAdded?: () => void;
}

export default function AddCategoryModal({
  categories,
  onCategoryAdded,
}: AddCategoryModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentId: "",
    });
  };

  const handleOpen = () => {
    resetForm();
    onOpen();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter a category name");

      return;
    }

    setLoading(true);

    try {
      const categoryData: CategoryModel = {
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || undefined,
        isActive: true,
        facets: [],
        images: [],
      };

      await createCategory(categoryData);
      toast.success("Category created successfully");

      handleClose();
      onCategoryAdded?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        className="gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/35"
        size="sm"
        onClick={handleOpen}
      >
        <Plus className="h-4 w-4" />
        Add Category
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
                      Add New Category
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      Create a category for organizing products
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Add New Category
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      Create a category for organizing products
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
                    label="Category Name"
                    labelPlacement="outside"
                    placeholder="e.g., Smartphones"
                    value={formData.name}
                    variant="bordered"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <Textarea
                    classNames={{
                      inputWrapper:
                        "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                    }}
                    label="Description"
                    labelPlacement="outside"
                    minRows={3}
                    placeholder="Category description..."
                    value={formData.description}
                    variant="bordered"
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </section>

                <section className="space-y-3">
                  <Select
                    classNames={{
                      trigger:
                        "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                    }}
                    label="Parent Category (Optional)"
                    labelPlacement="outside"
                    placeholder="None (Top Level)"
                    selectedKeys={formData.parentId ? [formData.parentId] : []}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setFormData({ ...formData, parentId: selected || "" });
                    }}
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} textValue={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </Select>
                </section>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="font-primary hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                    You can edit these details later and add facets to this category.
                  </p>

                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      className="rounded-lg border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      disabled={loading}
                      size={isMobile ? "sm" : "default"}
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                      disabled={loading}
                      size={isMobile ? "sm" : "default"}
                      type="submit"
                    >
                      {loading ? "Creating..." : "Create Category"}
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
