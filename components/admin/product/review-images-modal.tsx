"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images, Trash2, Upload, X, RefreshCw, Star } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { GoBackButton } from "@/components/go-back-button";
import { compressImages } from "@/lib/image-compression";
import { useDictionary } from "@/app/context/dictionary-provider";

// Generic Image Model that maps common fields
export interface BaseImageModel {
  id: string;
  imagePath: string;
  isCover: boolean;
  displayOrder: number;
  productId?: string;
  [key: string]: any; // Allow for productId, brandId, categoryId, etc.
}

type ReviewImagesModalProps<T extends BaseImageModel> = {
  entityId: string;
  existing?: T[];
  maxFiles?: number;
  maxSizeMB?: number;
  onChanged?: (images: T[]) => void | Promise<void>;
  trigger?: React.ReactNode;
  uploadService: (id: string, files: File[], coverIndex?: number) => Promise<T[]>;
  setCoverService: (id: string, position: number) => Promise<any>;
  deleteService: (id: string, key: string) => Promise<any>;
  entityType?: "product" | "brand" | "category";
};

type UnifiedImage = {
  id: string;
  url: string;
  type: "server" | "pending";
  toDelete?: boolean;
  serverKey?: string;
  file?: File;
  isCover?: boolean;
};

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  return (
    <div ref={setNodeRef} className={cn("relative group", isDragging && "opacity-50 z-50")} style={style}>
      {children}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
        title="Drag to reorder"
        type="button"
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

// ... (keep UnifiedImage, SortableItem)

export default function ReviewImagesModal<T extends BaseImageModel>({
  entityId,
  existing,
  maxFiles = 8,
  maxSizeMB = 0.5,
  onChanged,
  trigger,
  uploadService,
  setCoverService,
  deleteService,
  entityType = "product",
}: ReviewImagesModalProps<T>) {

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const dict = useDictionary();
  const t = dict?.admin?.products?.imagesModal;

  const normalizedExisting = useMemo<T[]>(() => {
    if (Array.isArray(existing)) return existing;

    return [];
  }, [existing]);

  const [unifiedImages, setUnifiedImages] = useState<UnifiedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    if (!isOpen) return;

    // Initialize unifiedImages from existing
    const existingMapped: UnifiedImage[] = normalizedExisting.map((i) => ({
      id: i.id, // Use image id as id for existing
      url: i.imagePath,
      type: "server",
      toDelete: false,
      serverKey: String(i.displayOrder),
      isCover: i.isCover,
    }));

    setUnifiedImages(existingMapped);
  }, [isOpen, normalizedExisting]);

  useEffect(() => {
    return () => {
      unifiedImages.forEach((img) => {
        if (img.type === "pending") URL.revokeObjectURL(img.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingSlots = useMemo(
    () => Math.max(0, maxFiles - unifiedImages.filter((s) => !s.toDelete).length),
    [unifiedImages, maxFiles],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      if (!files?.length) return;
      if (remainingSlots <= 0) return;

      const imgsOnly = files.filter((f) => f.type.startsWith("image/"));
      const toAdd = imgsOnly.slice(0, remainingSlots);

      if (toAdd.length === 0) return;

      // Compress images before adding
      try {
        const compressed = await compressImages(toAdd, {
          maxWidthOrHeight: 1920,
          maxSizeMB: maxSizeMB || 0.5,
          quality: 0.85,
        });

        const newImages: UnifiedImage[] = compressed.map((file) => {
          const id = crypto.randomUUID();

          return {
            id,
            url: URL.createObjectURL(file),
            type: "pending",
            file,
          };
        });

        setUnifiedImages((prev) => [...prev, ...newImages]);
      } catch (err) {
        console.error("Failed to compress images:", err);
      }
    },
    [remainingSlots],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files?.length) addFiles(Array.from(files));
    e.currentTarget.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dt = e.dataTransfer;
    const files = dt.files ? Array.from(dt.files) : [];

    addFiles(files);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files: File[] = [];

    Array.from(e.clipboardData?.items ?? []).forEach((item) => {
      if (item.kind === "file") {
        const f = item.getAsFile();

        if (f) files.push(f);
      }
    });
    if (files.length) addFiles(files);
  };

  const removeImage = (id: string) => {
    setUnifiedImages((prev) => {
      const img = prev.find((p) => p.id === id);

      if (img?.type === "pending") {
        URL.revokeObjectURL(img.url);

        return prev.filter((p) => p.id !== id);
      }

      // For server images, we just toggle toDelete
      return prev.map((s) => (s.id === id ? { ...s, toDelete: !s.toDelete } : s));
    });
  };

  const setAsCover = (id: string) => {
    setUnifiedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  const clearAllPending = () => {
    setUnifiedImages((prev) => {
      prev.forEach((p) => {
        if (p.type === "pending") URL.revokeObjectURL(p.url);
      });

      return prev.filter((p) => p.type === "server");
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setUnifiedImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1. Identify deletions (existing images that are marked toDelete)
      // Note: We MUST delete from highest index to lowest if the backend shift indices.
      // But we also need to maintain the new order.
      // Easiest way: Delete all that need to be deleted, then upload new, then the UI order wins.

      const toDelete = unifiedImages
        .filter((s) => s.type === "server" && s.toDelete)
        .map((s) => Number.parseInt(s.serverKey as string, 10))
        .sort((a, b) => b - a);

      for (const pos of toDelete) {
        await deleteService(entityId, String(pos));
      }

      // 2. Upload new images (with cover index if a pending image is marked as cover)
      const pendingImages = unifiedImages.filter((i) => i.type === "pending");
      const pendingFiles = pendingImages.map((i) => i.file!);
      const pendingCoverIndex = pendingImages.findIndex((i) => i.isCover);
      let uploaded: T[] = [];

      if (pendingFiles.length) {
        uploaded = await uploadService(
          entityId,
          pendingFiles,
          pendingCoverIndex >= 0 ? pendingCoverIndex : undefined
        );
      }
      // 3. Set cover image by position (excluding images marked for deletion)
      const visibleImages = unifiedImages.filter((img) => !img.toDelete);
      const coverIndex = visibleImages.findIndex((img) => img.isCover);

      if (coverIndex >= 0) {
        try {
          // Pass the position index to the updated service
          await setCoverService(entityId, coverIndex);
        } catch (err) {
          console.error("Failed to set cover image:", err);
        }
      }

      // 4. Construct final order
      let uploadIdx = 0;
      const idField = entityType === "product" ? "productId" : entityType === "brand" ? "brandId" : "categoryId";
      const finalImages: T[] = unifiedImages
        .filter(img => !img.toDelete)
        .map((img, index) => {
          if (img.type === "pending") {
            const uploadedItem = uploaded[uploadIdx++];

            // Backend may return a full model object or just a URL string
            if (typeof uploadedItem === 'string') {
              return {
                id: crypto.randomUUID(),
                [idField]: entityId,
                imagePath: uploadedItem as string,
                isCover: img.isCover ?? false,
                displayOrder: index,
              } as unknown as T;
            }

            // Already a proper model object — update displayOrder and isCover
            return {
              ...uploadedItem,
              isCover: img.isCover ?? false,
              displayOrder: index,
            } as T;
          }

          // Return the original server image model with updated displayOrder and isCover
          const original = normalizedExisting.find(e => e.id === img.id);

          return {
            ...original,
            id: img.id,
            [idField]: entityId,
            imagePath: img.url,
            isCover: img.isCover ?? false,
            displayOrder: index,
          } as T;
        })
        .filter(img => !!img);

      await onChanged?.(finalImages);

      // Cleanup locally
      unifiedImages.forEach(img => {
        if (img.type === "pending") URL.revokeObjectURL(img.url);
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => onClose();

  return (
    <>
      {trigger ? (
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
          onClick={onOpen}
        >
          {trigger}
        </Button>
      ) : (
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-xl transition-all duration-300"
          size="sm"
          title={t?.triggerTitle || "Manage images"}
          onClick={onOpen}
        >
          {t?.triggerButton || "Images"}
        </Button>
      )}

      <Modal
        classNames={{
          backdrop: "bg-slate-900/80 backdrop-blur-xl",
          base:
            "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
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
        size={isMobile ? "full" : "3xl"}
        onClose={handleCloseModal}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              {/* ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ gradient overlay ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â AddFaqModal-ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-2xl" />

              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 pb-4 z-50 relative">
                  <GoBackButton onClick={handleCloseModal} />
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    {unifiedImages.filter((s) => !s.toDelete).length} / {maxFiles}
                  </Badge>
                </ModalHeader>
              ) : (
                <ModalHeader className="flex items-center justify-between gap-2 pb-4 pt-8 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <h2 className="font-heading text-2xl font-black text-slate-900 dark:text-slate-100">
                        {t?.title || `Manage ${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Images`}
                      </h2>
                      <p className="font-primary text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {t?.subtitle?.replace("{maxFiles}", String(maxFiles)).replace("{maxSize}", String(maxSizeMB)) || `Upload up to ${maxFiles} images • Max ${maxSizeMB}MB each`}
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    {unifiedImages.filter((s) => !s.toDelete).length} / {maxFiles}
                  </Badge>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="grid gap-4">
                  {/* Drop zone */}
                  <div
                    ref={dropRef}
                    aria-label="Upload images by clicking, dragging and dropping, or pasting"
                    className={cn(
                      "flex items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer outline-none",
                      isDragging
                        ? "bg-blue-50/60 dark:bg-blue-900/10 border-blue-400"
                        : "bg-white/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white/90 dark:hover:bg-slate-800/80",
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => inputRef.current?.click()}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                    }}
                    onPaste={onPaste}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                        <Upload className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-primary text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {t?.dropzoneTitle || "Drag & drop images here"}
                        </p>
                        <p className="font-primary text-xs text-slate-600 dark:text-slate-400">
                          {t?.dropzoneSubtitle || "or click to browse - you can also paste images"}
                        </p>
                        <p className="font-primary text-xs text-slate-500">
                          {t?.slotsLeft?.replace("{count}", String(remainingSlots)).replace("{maxSize}", String(maxSizeMB)) || `${remainingSlots} slots left - Max ${maxSizeMB}MB each`}
                        </p>
                      </div>
                      <Input
                        ref={inputRef}
                        multiple
                        accept="image/*"
                        aria-hidden="true"
                        className="hidden"
                        type="file"
                        onChange={onInputChange}
                      />
                    </div>
                  </div>

                  {unifiedImages.length > 0 ? (
                    <DndContext
                      collisionDetection={closestCenter}
                      sensors={sensors}
                      onDragEnd={handleDragEnd}
                    >
                      <ScrollArea className="max-h-[460px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                        <SortableContext
                          items={unifiedImages.map((i) => i.id)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {unifiedImages.map((img, index) => (
                              <SortableItem key={img.id} id={img.id}>
                                <figure
                                  className={cn(
                                    "relative rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square group",
                                    img.toDelete && "opacity-50"
                                  )}
                                >
                                  <Image
                                    fill
                                    alt="Product image"
                                    className="object-cover"
                                    src={img.url}
                                  />

                                  {/* Status Badges */}
                                  <div className="absolute left-2 bottom-2 flex flex-col gap-1 z-10">
                                    {img.isCover && !img.toDelete && (
                                      <Badge className="bg-amber-500/90 text-white border-amber-600 shadow-sm text-[10px] px-1.5 py-0 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" />
                                        {t?.cover || "Cover"}
                                      </Badge>
                                    )}
                                    {img.type === "server" ? (
                                      <Badge
                                        className={cn(
                                          "text-[10px] px-1.5 py-0",
                                          img.toDelete
                                            ? "bg-rose-500/80 text-white"
                                            : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                                        )}
                                      >
                                        {img.toDelete ? (t?.willDelete || "Delete") : (t?.existing || "Saved")}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-emerald-500/80 text-white text-[10px] px-1.5 py-0">
                                        {t?.new || "New"}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    {!img.isCover && !img.toDelete && (
                                      <button
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-amber-500/90 hover:bg-amber-600 text-white border border-amber-400"
                                        title={t?.setAsCover || "Set as cover"}
                                        type="button"
                                        onClick={() => setAsCover(img.id)}
                                      >
                                        <Star className="h-4 w-4" />
                                      </button>
                                    )}
                                    <button
                                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700"
                                      title={img.toDelete ? (t?.undoDelete || "Undo") : (t?.delete || "Remove")}
                                      type="button"
                                      onClick={() => removeImage(img.id)}
                                    >
                                      {img.toDelete ? (
                                        <RefreshCw className="h-4 w-4" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>

                                  {img.toDelete && (
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                                      <Trash2 className="h-8 w-8 text-white/50" />
                                    </div>
                                  )}
                                </figure>
                              </SortableItem>
                            ))}
                          </div>
                        </SortableContext>
                      </ScrollArea>
                    </DndContext>
                  ) : (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center bg-white/70 dark:bg-slate-800/60">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Images className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>
                      <p className="font-primary text-sm text-slate-700 dark:text-slate-300">{t?.noImages || "No images yet."}</p>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 relative">
                {unifiedImages.some(i => i.type === "pending") && (
                  <Button className="mr-auto" type="button" variant="ghost" onClick={clearAllPending}>
                    <X className="h-4 w-4 mr-2" />
                    {t?.clearPending || "Clear new"}
                  </Button>
                )}
                <Button
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  {t?.cancel || "Cancel"}
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? (
                    <span className="font-primary flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t?.saving || "Saving..."}
                    </span>
                  ) : (
                    t?.savePhotos || "Save photos"
                  )}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
