"use client";

import type { CreateStoreRequest } from "@/types/store";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";

import { Button } from "@/components/ui/button";
import { createStore } from "@/app/api/services/storeService";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";

interface AddStoreModalProps {
  onSuccess?: () => void;
}

export default function AddStoreModal({ onSuccess }: AddStoreModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStoreRequest>({
    name: "",
    address: "",
    phone: "",
    email: "",
    city: "",
    country: "",
    manager: "",
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      city: "",
      country: "",
      manager: "",
      isActive: true,
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

    if (!formData.name.trim()) {
      toast.error("Store name is required");

      return;
    }

    setLoading(true);
    try {
      await createStore(formData);
      toast.success("Store created successfully");
      handleClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpen}>
        <Plus className="mr-2 h-4 w-4" />
        Add Store
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
      >
        <ModalContent className="h-full">
          <form className="flex h-full flex-col" onSubmit={handleSubmit}>
            {isMobile ? (
              <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                <GoBackButton onClick={handleClose} />
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    Add New Store
                  </span>
                  <span className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    Create a new store location
                  </span>
                </div>
              </ModalHeader>
            ) : (
              <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-col min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    Add New Store
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Create a new store location
                  </p>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-4">
              {/* Store Name */}
              <Input
                required
                label="Store Name"
                labelPlacement="outside"
                placeholder="Downtown Store"
                value={formData.name}
                variant="bordered"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              {/* Address */}
              <Input
                label="Address"
                labelPlacement="outside"
                placeholder="123 Main Street"
                value={formData.address}
                variant="bordered"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              {/* City and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  labelPlacement="outside"
                  placeholder="New York"
                  value={formData.city}
                  variant="bordered"
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="Country"
                  labelPlacement="outside"
                  placeholder="USA"
                  value={formData.country}
                  variant="bordered"
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  labelPlacement="outside"
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  value={formData.phone}
                  variant="bordered"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Email"
                  labelPlacement="outside"
                  placeholder="store@example.com"
                  type="email"
                  value={formData.email}
                  variant="bordered"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Manager */}
              <Input
                label="Manager"
                labelPlacement="outside"
                placeholder="John Doe"
                value={formData.manager}
                variant="bordered"
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Active Status
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Enable this store for operations
                  </p>
                </div>
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                  size={isMobile ? "sm" : "default"}
                  type="submit"
                >
                  {loading ? "Creating..." : "Create Store"}
                </Button>
              </div>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
