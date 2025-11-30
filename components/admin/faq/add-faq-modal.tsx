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
import { GoBackButton } from "@/components/go-back-button";

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
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300" onClick={onOpen}>
          {children}
        </Button>
      ) : (
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
          size="sm"
          onClick={onOpen}
        >
          + Add FAQ
        </Button>
      )}

      <Modal
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "w-screen rounded-none bg-background dark:bg-slate-950 flex flex-col rounded-2xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        scrollBehavior="inside"
        size={isMobile ? "full" : "lg"}
        onClose={onClose}
      >
        <ModalContent className="h-full">
          <>
            {isMobile ? (
              <ModalHeader className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                <GoBackButton onClick={onClose} />
                <div className="flex flex-col min-w-0">
                  <span className="font-primary truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    FAQ-ის დამატება
                  </span>
                  <span className="font-primary line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                    Add new frequently asked question
                  </span>
                </div>
              </ModalHeader>
            ) : (
              <ModalHeader className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <div className="flex flex-col min-w-0">
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    FAQ-ის დამატება
                  </h2>
                  <p className="font-primary text-xs text-slate-500 dark:text-slate-400">
                    Add new frequently asked question
                  </p>
                </div>
              </ModalHeader>
            )}

            <ModalBody className="flex-1 overflow-y-auto px-4 md:px-6 pt-2 pb-3 space-y-6">
              <Input
                isRequired
                classNames={{
                  label: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                  inputWrapper:
                    "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 data-[focus=true]:border-blue-500 dark:data-[focus=true]:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300",
                  input:
                    "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium",
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
                  label: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                  inputWrapper:
                    "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 data-[focus=true]:border-blue-500 dark:data-[focus=true]:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300",
                  input:
                    "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium",
                }}
                label="პასუხი"
                placeholder="შეიყვანეთ პასუხი"
                size="lg"
                value={a}
                variant="bordered"
                onChange={(e) => setA(e.target.value)}
              />
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-center items-center gap-2">
                  <Switch
                    checked={active}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600"
                    onCheckedChange={setActive}
                  />
                  {active ? (
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="font-primary text-sm font-semibold text-slate-700 dark:text-slate-300">Active</span>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Switch
                    checked={featured}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                    onCheckedChange={setFeatured}
                  />
                  <Star
                    className={`h-3.5 w-3.5 ${featured ? "fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400" : "text-slate-400"}`}
                  />
                  <span className="font-primary text-sm font-semibold text-slate-700 dark:text-slate-300">Featured</span>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="shrink-0 border-t rounded-2xl border-slate-200/80 dark:border-slate-700/80 bg-background px-4 md:px-6 py-3">
              <div className="flex w-full items-center justify-end gap-2">
                <Button
                  disabled={loading}
                  size={isMobile ? "sm" : "default"}
                  variant="outline"
                  onClick={onClose}
                >
                  გაუქმება
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
                  disabled={loading}
                  size={isMobile ? "sm" : "default"}
                  onClick={handleSave}
                >
                  {loading ? (
                    <span className="font-primary flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "შენახვა"
                  )}
                </Button>
              </div>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
