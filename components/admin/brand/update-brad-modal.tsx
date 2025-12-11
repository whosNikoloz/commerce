"use client";

import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";

import { CustomEditor } from "../../wysiwyg-text-custom";
import { GoBackButton } from "../../go-back-button";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface UpdateBrandModalProps {
  brandId: string;
  initialDescription?: string;
  initialOrigin?: string;
  initialName?: string;
  onSave: (id: string, name: string, description: string, origin: string) => void;
}

export default function UpdateBrandModal({
  brandId,
  initialDescription = "",
  initialOrigin = "",
  initialName = "",
  onSave,
}: UpdateBrandModalProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [description, setDescription] = useState(initialDescription);
  const [origin, setOrigin] = useState(initialOrigin);
  const [name, setName] = useState(initialName);
  const isMobile = useIsMobile();

  useEffect(() => setDescription(initialDescription), [initialDescription]);
  useEffect(() => setOrigin(initialOrigin), [initialOrigin]);
  useEffect(() => setName(initialName), [initialName]);

  const handleSave = () => {
    onSave(brandId, name, description, origin);
    onClose();
  };

  return (
    <>
      <Button
        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-600 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
        size="sm"
        variant="outline"
        onClick={onOpen}
      >
        <Edit className="h-4 w-4" />
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
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="h-full">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                  <GoBackButton onClick={onClose} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      ბრენდის განახლება
                    </span>
                    <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      Update brand information
                    </span>
                  </div>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <div className="flex flex-col min-w-0">
                    <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      ბრენდის განახლება
                    </h2>
                    <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                      Update brand description and origin
                    </p>
                  </div>
                </ModalHeader>
              )}

              <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-6">
                {/* Name */}
                <Input
                  classNames={{
                    label: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                    inputWrapper:
                      "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 data-[focus=true]:border-purple-500 dark:data-[focus=true]:border-purple-500 shadow-sm hover:shadow-md transition-all duration-300",
                    input:
                      "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium",
                  }}
                  label="ბრენდის სახელი"
                  placeholder="შეიყვანეთ ბრენდის სახელი"
                  size="lg"
                  value={name}
                  variant="bordered"
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Origin */}
                <Input
                  classNames={{
                    label: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                    inputWrapper:
                      "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 data-[focus=true]:border-purple-500 dark:data-[focus=true]:border-purple-500 shadow-sm hover:shadow-md transition-all duration-300",
                    input:
                      "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium",
                  }}
                  label="წარმოშობა"
                  placeholder="საქართველო / ევროკავშირი"
                  size="lg"
                  value={origin}
                  variant="bordered"
                  onChange={(e) => setOrigin(e.target.value)}
                />

                {/* Description */}
                <div className="space-y-2">
                  <label className="font-primary text-sm font-semibold text-slate-700 dark:text-slate-300 block"
                    htmlFor="description-editor"
                  >
                    აღწერა
                  </label>
                  <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <CustomEditor value={description} onChange={setDescription} />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
                <div className="flex w-full items-center justify-end gap-2">
                  <Button
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    onClick={onClose}
                  >
                    გაუქმება
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold"
                    size={isMobile ? "sm" : "default"}
                    onClick={handleSave}
                  >
                    შენახვა
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
