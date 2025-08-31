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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      <Button size="sm" variant="default" onClick={handleOpen}>
        <Plus className="h-4 w-4 mr-1" />
        დაამატე ბრენდი
      </Button>

      <Modal
        classNames={{ backdrop: "backdrop-blur-3xl", base: "rounded-t-xl" }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: 40,
              opacity: 0,
              scale: 0.96,
              transition: { duration: 0 },
            },
            center: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 32,
                mass: 0.8,
              },
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
        size={isMobile ? "full" : "3xl"}
        onClose={handleClose}
      >
        <ModalContent className="bg-brand-muted dark:bg-brand-muteddark">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={handleClose} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-1 pb-4">
                  <h2 className="text-2xl font-bold dark:text-text-lightdark text-text-light">
                    ბრენდის დამატება
                  </h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-5">
                {/* Name */}
                <Input
                  isRequired
                  label="ბრენდის სახელი"
                  placeholder="შეიყვანეთ ბრენდის სახელი"
                  size="lg"
                  value={name}
                  variant="bordered"
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Origin */}
                <Input
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
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    htmlFor="description-editor"
                  >
                    აღწერა
                  </label>
                  <CustomEditor value={description} onChange={setDescription} />
                </div>
              </ModalBody>

              <ModalFooter className="gap-2">
                <Button variant="outline" onClick={handleClose}>
                  გაუქმება
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
