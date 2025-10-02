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
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300" onClick={onOpen}>
          {children}
        </Button>
      ) : (
        <Button
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
          size="sm"
          onClick={onOpen}
        >
          + Add FAQ
        </Button>
      )}

      <Modal
        classNames={{
          backdrop: "bg-slate-900/80 backdrop-blur-xl",
          base: "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
          wrapper: "z-[999]",
          closeButton: "z-50",
        }}
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
        <ModalContent>
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none rounded-2xl" />
            <ModalHeader className="flex flex-col items-center gap-2 pb-4 pt-8 relative">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg mb-2">
                <Star className="h-6 w-6 text-white fill-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                FAQ-ის დამატება
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Add new frequently asked question</p>
            </ModalHeader>

            <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-6 relative">
              <Input
                isRequired
                classNames={{
                  label: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                  inputWrapper:
                    "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 data-[focus=true]:border-amber-500 dark:data-[focus=true]:border-amber-500 shadow-sm hover:shadow-md transition-all duration-300",
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
                    "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 data-[focus=true]:border-amber-500 dark:data-[focus=true]:border-amber-500 shadow-sm hover:shadow-md transition-all duration-300",
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
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active</span>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Switch
                    checked={featured}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-amber-600"
                    onCheckedChange={setFeatured}
                  />
                  <Star
                    className={`h-3.5 w-3.5 ${featured ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" : "text-slate-400"}`}
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Featured</span>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 relative">
              <Button
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                disabled={loading}
                variant="outline"
                onClick={onClose}
              >
                გაუქმება
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "შენახვა"
                )}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
