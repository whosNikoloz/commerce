"use client";

import { useMemo, useState } from "react";
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

import { Button } from "@/components/ui/button";
import { createProductGroup } from "@/app/api/services/productGroupService";
import { CategoryModel } from "@/types/category";
import { BrandModel } from "@/types/brand";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";

interface CreateProductGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryModel[];
  brands: BrandModel[];
  onGroupCreated?: () => void;
}

export function CreateProductGroupModal({
  open,
  onOpenChange,
  categories,
  brands,
  onGroupCreated,
}: CreateProductGroupModalProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  type OptionItem = { id: string; name: string };
  const categoryItems = useMemo<OptionItem[]>(
    () => [
      { id: "", name: "No Category" },
      ...categories
        .filter((c) => c.parentId === null)
        .map((c) => ({ id: c.id, name: c.name ?? "" })),
    ],
    [categories]
  );

  const brandItems = useMemo<OptionItem[]>(
    () => [{ id: "", name: "No Brand" }, ...brands.map((b) => ({ id: b.id, name: b.name ?? "" }))],
    [brands]
  );

  const handleCreate = async () => {
    if (!name.trim()) {
      toast("Please enter a group name");

      return;
    }

    setCreating(true);
    try {
      await createProductGroup({
        name: name.trim(),
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
      });

      toast("Product group created successfully");

      setName("");
      setCategoryId("");
      setBrandId("");

      onGroupCreated?.();
      onOpenChange(false);
    } catch (error) {
      toast("Failed to create product group");
    } finally {
      setCreating(false);
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
      size={isMobile ? "full" : "3xl"}
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
                    Create Product Group
                  </span>
                  <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    Group similar products together
                  </span>
                </div>
              </ModalHeader>
            ) : (
              <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-col min-w-0">
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Create Product Group
                  </h2>
                  <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                    Group similar products together as variants
                  </p>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-4 md:space-y-6">
              <section className="space-y-3">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
                    General Information
                  </h3>
                </div>

                <Input
                  required
                  classNames={{
                    inputWrapper:
                      "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-5",
                  }}
                  label="Group Name"
                  labelPlacement="outside"
                  placeholder="Enter group name..."
                  value={name}
                  variant="bordered"
                  onChange={(e) => setName(e.target.value)}
                />
              </section>

              <section className="space-y-3">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Classification
                  </h3>
                  <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                    Assign a category and brand to this group to help organize your products.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    classNames={{
                      trigger:
                        "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                    }}
                    items={categoryItems}
                    label="Category (Optional)"
                    labelPlacement="outside"
                    placeholder="Select a category"
                    selectedKeys={categoryId ? [categoryId] : []}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setCategoryId(selected || "");
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item.id} textValue={item.name}>
                        {item.name}
                      </SelectItem>
                    )}
                  </Select>

                  <Select
                    classNames={{
                      trigger:
                        "rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                    }}
                    items={brandItems}
                    label="Brand (Optional)"
                    labelPlacement="outside"
                    placeholder="Select a brand"
                    selectedKeys={brandId ? [brandId] : []}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;

                      setBrandId(selected || "");
                    }}
                  >
                    {(item) => (
                      <SelectItem key={item.id} textValue={item.name}>
                        {item.name}
                      </SelectItem>
                    )}
                  </Select>
                </div>
              </section>
            </ModalBody>

            <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
              <div className="flex w-full items-center justify-between gap-3">
                <p className="font-primary hidden text-xs text-slate-500 dark:text-slate-400 md:block">
                  You can edit these details later and add products to this group.
                </p>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    className="rounded-lg border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    disabled={creating}
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
                    disabled={creating || !name.trim()}
                    size={isMobile ? "sm" : "default"}
                    onClick={handleCreate}
                  >
                    {creating ? "Creating..." : "Create Group"}
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
