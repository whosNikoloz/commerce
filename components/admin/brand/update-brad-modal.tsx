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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        className="border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
        size="sm"
        variant="outline"
        onClick={onOpen}
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Modal
        classNames={{ backdrop: "backdrop-blur-3xl", base: "rounded-t-xl" }}
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
        size={isMobile ? "full" : "3xl"}
        onClose={onClose}
      >
        <ModalContent className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={onClose} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-1 pb-4">
                  <h2 className="text-2xl font-bold text-text-light dark:text-text-lightdark">
                    ბრენდის განახლება
                  </h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-5">
                {/* Name */}
                <Input
                  classNames={{
                    label: "text-text-subtle dark:text-text-subtledark",
                    inputWrapper:
                      "bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark",
                    input:
                      "text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark",
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
                    label: "text-text-subtle dark:text-text-subtledark",
                    inputWrapper:
                      "bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark",
                    input:
                      "text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark",
                  }}
                  label="წარმოშობა"
                  placeholder=" напр. საქართველო / ევროკავშირი"
                  size="lg"
                  value={origin}
                  variant="bordered"
                  onChange={(e) => setOrigin(e.target.value)}
                />

                {/* Description */}
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-text-light dark:text-text-lightdark"
                    htmlFor="description-editor"
                  >
                    აღწერა
                  </label>
                  <div className="rounded-md border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark">
                    <CustomEditor value={description} onChange={setDescription} />
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="gap-2">
                <Button
                  className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
                  variant="outline"
                  onClick={onClose}
                >
                  გაუქმება
                </Button>
                <Button
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                  onClick={handleSave}
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
