"use client";

import { useState } from "react";
import { Box, Clock3, Edit, Sparkles } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";

import { CustomEditor } from "../../wysiwyg-text-custom";
import { GoBackButton } from "../../go-back-button";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface UpdateProductModalProps {
  productId: string;
  initialDescription?: string;
  initialIsLiquidated?: boolean;
  initialIsComingSoon?: boolean;
  initialIsNewArrival?: boolean;
  onSave: (
    id: string,
    newDescription: string,
    flags: { isLiquidated: boolean; isComingSoon: boolean; isNewArrival: boolean },
  ) => void;
}

export default function UpdateProductModal({
  productId,
  initialDescription = "",
  initialIsLiquidated = false,
  initialIsComingSoon = false,
  initialIsNewArrival = false,
  onSave,
}: UpdateProductModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [description, setDescription] = useState(initialDescription);
  const [isLiquidated, setIsLiquidated] = useState(initialIsLiquidated);
  const [isComingSoon, setIsComingSoon] = useState(initialIsComingSoon);
  const [isNewArrival, setIsNewArrival] = useState(initialIsNewArrival);

  const handleSave = () => {
    onSave(productId, description, { isLiquidated, isComingSoon, isNewArrival });
    onClose();
  };

  const isMobile = useIsMobile();

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
                    პროდუქტის აღწერის განახლება
                  </h2>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isLiquidated}
                        className="data-[state=checked]:bg-red-600"
                        id="is-liquidated"
                        onCheckedChange={setIsLiquidated}
                      />
                      <span className="text-sm flex items-center gap-1 text-text-light dark:text-text-lightdark">
                        <Box className="w-4 h-4" />
                        ლიკვიდირებულია
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isComingSoon}
                        className="data-[state=checked]:bg-brand-primarydark"
                        id="is-coming-soon"
                        onCheckedChange={setIsComingSoon}
                      />
                      <span className="text-sm flex items-center gap-1 text-text-light dark:text-text-lightdark">
                        <Clock3 className="w-4 h-4" />
                        მალე შემოვა
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isNewArrival}
                        className="data-[state=checked]:bg-brand-primary"
                        id="is-new-arrival"
                        onCheckedChange={setIsNewArrival}
                      />
                      <span className="text-sm flex items-center gap-1 text-text-light dark:text-text-lightdark">
                        <Sparkles className="w-4 h-4" />
                        ახალი პროდუქტი
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark">
                    <CustomEditor value={description} onChange={setDescription} />
                  </div>
                </div>

                <ModalFooter className="mt-4">
                  <Button
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                    onClick={handleSave}
                  >
                    შენახვა
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
