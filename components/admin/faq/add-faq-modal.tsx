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

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "@/components/ui/switch";

export default function AddFaqModal({
  onCreate,
  children,
}: {
  onCreate: (q: string, a: string, isActive: boolean, isFeatured: boolean) => Promise<void>;
  children?: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsMobile();

  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQ("");
      setA("");
      setActive(true);
      setFeatured(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!q.trim() || !a.trim()) {
      toast.error("შეავსე ველები");

      return;
    }
    setLoading(true);
    try {
      await onCreate(q.trim(), a.trim(), active, featured);
      toast.success("დაემატა");
      onClose();
    } catch {
      toast.error("ვერ დაემატა");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white" onClick={onOpen}>
          {children}
        </Button>
      ) : (
        <Button
          className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          size="sm"
          onClick={onOpen}
        >
          + Add FAQ
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
                FAQ-ის დამატება
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
