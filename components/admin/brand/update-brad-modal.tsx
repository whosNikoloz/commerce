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

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  useEffect(() => {
    setOrigin(initialOrigin);
  }, [initialOrigin]);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = () => {
    // ✅ keep param order: (id, name, description, origin)
    onSave(brandId, name, description, origin);
    onClose();
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={onOpen}>
        <Edit className="h-4 w-4" />
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
        onClose={onClose}
      >
        <ModalContent className="bg-brand-muted dark:bg-brand-muteddark">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={onClose} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col items-center gap-1 pb-4">
                  <h2 className="text-2xl font-bold dark:text-text-lightdark text-text-light">
                    ბრენდის განახლება
                  </h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-5">
                {/* Name */}
                <Input
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
                  placeholder=" напр. საქართველო / ევროკავშირი"
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

              <ModalFooter>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
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
