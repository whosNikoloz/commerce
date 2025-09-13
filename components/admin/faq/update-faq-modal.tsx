"use client";

import { useEffect, useState } from "react";
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
import { Eye, EyeOff, Star } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function UpdateFaqModal({
  faqId,
  initialQuestion,
  initialAnswer,
  initialActive,
  initialFeatured,
  onSave,
  trigger,
}: {
  faqId: string;
  initialQuestion?: string;
  initialAnswer?: string;
  initialActive?: boolean;
  initialFeatured?: boolean;
  onSave: (
    id: string,
    q: string,
    a: string,
    isActive: boolean,
    isFeatured: boolean,
  ) => Promise<void>;
  trigger?: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsMobile();

  const [q, setQ] = useState(initialQuestion ?? "");
  const [a, setA] = useState(initialAnswer ?? "");
  const [active, setActive] = useState(!!initialActive);
  const [featured, setFeatured] = useState(!!initialFeatured);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQ(initialQuestion ?? "");
      setA(initialAnswer ?? "");
      setActive(!!initialActive);
      setFeatured(!!initialFeatured);
    }
  }, [isOpen, initialQuestion, initialAnswer, initialActive, initialFeatured]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(faqId, q.trim(), a.trim(), active, featured);
      toast.success("განახლდა");
      onClose();
    } catch {
      toast.error("ვერ განახლდა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <Button
          className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
          onClick={onOpen}
        >
          {trigger}
        </Button>
      ) : (
        <Button
          className="border-brand-muted dark:border-brand-muteddark text-text-light dark:text-text-lightdark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
          size="sm"
          variant="outline"
          onClick={onOpen}
        >
          Edit
        </Button>
      )}

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
        size={isMobile ? "full" : "lg"}
        onClose={onClose}
      >
        <ModalContent className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark">
          <>
            <ModalHeader className="flex flex-col items-center gap-1 pb-2">
              <h2 className="text-2xl font-bold text-text-light dark:text-text-lightdark">
                FAQ-ის ჩასწორება
              </h2>
            </ModalHeader>

            <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-5">
              <Input
                isRequired
                classNames={{
                  label: "text-text-subtle dark:text-text-subtledark",
                  inputWrapper:
                    "bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark",
                  input:
                    "text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark",
                }}
                label="კითხვა"
                placeholder="შეიყვანეთ კითხვა"
                size="lg"
                value={q}
                variant="bordered"
                onChange={(e) => setQ(e.target.value)}
              />
              <Input
                isRequired
                classNames={{
                  label: "text-text-subtle dark:text-text-subtledark",
                  inputWrapper:
                    "bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark",
                  input:
                    "text-text-light dark:text-text-lightdark placeholder:text-text-subtle dark:placeholder:text-text-subtledark",
                }}
                label="პასუხი"
                placeholder="შეიყვანეთ პასუხი"
                size="lg"
                value={a}
                variant="bordered"
                onChange={(e) => setA(e.target.value)}
              />
              <div className="flex items-center gap-6">
                <div className="flex justify-center items-center gap-1">
                  <Switch
                    checked={active}
                    className="data-[state=checked]:bg-brand-primary"
                    onCheckedChange={setActive}
                  />
                  {active ? (
                    <Eye className="h-4 w-4 text-brand-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-text-subtle" />
                  )}
                </div>
                <div className="flex justify-center items-center gap-1">
                  <Switch
                    checked={featured}
                    className="data-[state=checked]:bg-brand-primary"
                    onCheckedChange={setFeatured}
                  />
                  <Star
                    className={`h-3.5 w-3.5 ${featured ? "fill-white text-white" : "text-text-subtle"}`}
                  />
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="gap-2">
              <Button
                className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
                disabled={loading}
                variant="outline"
                onClick={onClose}
              >
                გაუქმება
              </Button>
              <Button
                className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? "Saving..." : "შენახვა"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
