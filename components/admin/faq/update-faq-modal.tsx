"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";

import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, EyeOff, Star } from "lucide-react";
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
    onSave: (id: string, q: string, a: string, isActive: boolean, isFeatured: boolean) => Promise<void>;
    trigger?: React.ReactNode; // external trigger button
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
                <span onClick={onOpen}>{trigger}</span>
            ) : (
                <Button variant="outline" size="sm" onClick={onOpen}>Edit</Button>
            )}

            <Modal
                classNames={{ backdrop: "backdrop-blur-3xl", base: "rounded-t-xl" }}
                hideCloseButton={isMobile}
                isOpen={isOpen}
                motionProps={{
                    variants: {
                        enter: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0 } },
                        center: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 } },
                        exit: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: "easeIn" } },
                    },
                    initial: "enter",
                    animate: "center",
                    exit: "exit",
                }}
                placement={isMobile ? "top" : "center"}
                size={isMobile ? "full" : "lg"}
                onClose={onClose}
            >
                <ModalContent className="bg-brand-muted dark:bg-brand-muteddark">
                    <>
                        <ModalHeader className="flex flex-col items-center gap-1 pb-2">
                            <h2 className="text-2xl font-bold dark:text-text-lightdark text-text-light">FAQ-ის ჩასწორება</h2>
                        </ModalHeader>

                        <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)] space-y-5">
                            <Input
                                label="კითხვა"
                                placeholder="შეიყვანეთ კითხვა"
                                size="lg"
                                variant="bordered"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                isRequired
                            />
                            <Input
                                label="პასუხი"
                                placeholder="შეიყვანეთ პასუხი"
                                size="lg"
                                variant="bordered"
                                value={a}
                                onChange={(e) => setA(e.target.value)}
                                isRequired
                            />
                            <div className="flex items-center gap-6">
                                <div className="flex justify-center items-center gap-1">
                                    <Switch
                                        checked={active}
                                        className="data-[state=checked]:bg-blue-600"
                                        onCheckedChange={setActive}
                                    />
                                    {active ? (
                                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex justify-center items-center gap-1">
                                    <Switch
                                        checked={featured}
                                        className="data-[state=checked]:bg-blue-600"
                                        onCheckedChange={setFeatured}
                                    />
                                    <Star className={`h-3.5 w-3.5 ${featured ? "fill-white text-white" : "text-slate-400"}`} />
                                </div>
                            </div>
                        </ModalBody>

                        <ModalFooter className="gap-2">
                            <Button variant="outline" onClick={onClose} disabled={loading}>გაუქმება</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={loading}>
                                {loading ? "Saving..." : "შენახვა"}
                            </Button>
                        </ModalFooter>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
}
