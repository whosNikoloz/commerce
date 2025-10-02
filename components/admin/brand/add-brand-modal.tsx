"use client";

import { useEffect, useState } from "react";
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

import { CustomEditor } from "../../wysiwyg-text-custom";
import { GoBackButton } from "../../go-back-button";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddBrandModalProps {
  defaultName?: string;
  defaultOrigin?: string;
  defaultDescription?: string;
  onCreate: (name: string, description: string, origin: string) => void;
}

export default function AddBrandModal({
  defaultName = "",
  defaultOrigin = "",
  defaultDescription = "",
  onCreate,
}: AddBrandModalProps) {
  const { isOpen, onOpen, onClose  } = useDisclosure();
  const isMobile = useIsMobile();

  const [name, setName] = useState(defaultName);
  const [origin, setOrigin] = useState(defaultOrigin);
  const [description, setDescription] = useState(defaultDescription);

  useEffect(() => setName(defaultName), [defaultName]);
  useEffect(() => setOrigin(defaultOrigin), [defaultOrigin]);
  useEffect(() => setDescription(defaultDescription), [defaultDescription]);

  const resetForm = () => {
    setName(defaultName || "");
    setOrigin(defaultOrigin || "");
    setDescription(defaultDescription || "");
  };

  const handleOpen = () => {
    resetForm();
    onOpen();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = () => {
    onCreate(name.trim(), description, origin.trim());
    handleClose();
  };

  const isSaveDisabled = name.trim().length === 0;

  return (
    <>
      <Button
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
        size="sm"
        variant="default"
        onClick={handleOpen}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        დაამატე ბრენდი
      </Button>

      <Modal
        classNames={{
          backdrop: "bg-slate-900/80 backdrop-blur-xl",
          base: "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
          wrapper: "z-[999]",
          closeButton: "z-50",
        }}
        closeButton={true}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0 } },
            center: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 },
            },
            exit: {
              y: 40,
              opacity: 0,
              scale: 0.96,
              transition: { duration: 0.18, ease: "easeIn" },
            },
          },
          initial: "enter",
          animate: "center",
          exit: "exit",
        }}
        placement={isMobile ? "top" : "center"}
        scrollBehavior="inside"
        size={isMobile ? "full" : "3xl"}
        onClose={handleClose}
      >
        <ModalContent>
          {() => (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-2xl" />
              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50 relative">
                  <GoBackButton onClick={handleClose} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-2 pb-4 pt-8 relative">
                
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    ბრენდის დამატება
                  </h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-6 relative">
                {/* Name */}
                <Input
                  isRequired
                  classNames={{
                    label: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                    inputWrapper:
                      "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 data-[focus=true]:border-blue-500 dark:data-[focus=true]:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300",
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
                      "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 data-[focus=true]:border-blue-500 dark:data-[focus=true]:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300",
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
                  <label
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300 block"
                    htmlFor="description-editor"
                  >
                    აღწერა
                  </label>
                  <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <CustomEditor value={description} onChange={setDescription} />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 relative">
                <Button
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  variant="outline"
                  onClick={handleClose}
                >
                  გაუქმება
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaveDisabled}
                  onClick={handleCreate}
                >
                  შენახვა
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
