"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images, Trash2, Upload, X } from "lucide-react";
// only if you also need the icon
// eslint-disable-next-line import/order
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
// only if you also need the icon

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteImage, uploadProductImages } from "@/app/api/services/productService";
//import { useToast } from "@/hooks/use-toast"

type ExistingImage = { key: string; url: string };

type UploadReplyItem = { key: string; url: string }; // სასურველია სერვერმა ეს დააბრუნოს
type UploadReply = string[] | UploadReplyItem[];

type ReviewImagesModalProps = {
  productId: string;
  existing?: ExistingImage[];
  maxFiles?: number;
  maxSizeMB?: number;
  onChanged?: (urls: string[]) => void | Promise<void>;
  trigger?: React.ReactNode;
};

type SelectedImage = { id: string; file: File; url: string };
const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

export default function ReviewImagesModal({
  productId,
  existing,
  maxFiles = 8,
  maxSizeMB = 5,
  onChanged,
  trigger,
}: ReviewImagesModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  // უკვე ატვირთულები + წასაშლელად მონიშვნის ტოგლი
  const [serverImages, setServerImages] = useState<(ExistingImage & { toDelete?: boolean })[]>(() =>
    (existing ?? []).map((i) => ({ ...i, toDelete: false })),
  );

  // ახალი, ჯერ არ ატვირთული (პრივიუებით)
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  // გახსნისას დავადეფოლტოთ existing
  useEffect(() => {
    if (!isOpen) return;
    setServerImages((existing ?? []).map((i) => ({ ...i, toDelete: false })));
    // ახალი პოზიტივები (pending) გავასუფთავოთ
    setImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));

      return [];
    });
  }, [isOpen, existing]);

  // unmount cleanup
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingSlots = useMemo(
    () => Math.max(0, maxFiles - (serverImages.filter((s) => !s.toDelete).length + images.length)),
    [serverImages, images.length, maxFiles],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (!files?.length) return;

      const imgsOnly = files.filter((f) => f.type.startsWith("image/"));
      const sizeLimit = maxSizeMB * 1024 * 1024;
      const withinSize = imgsOnly.filter((f) => f.size <= sizeLimit);

      const existingKeys = new Set(images.map((i) => fileKey(i.file)));
      const dedup = withinSize.filter((f) => !existingKeys.has(fileKey(f)));

      const toAdd = dedup.slice(0, remainingSlots);

      const newItems = toAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));

      if (newItems.length > 0) setImages((prev) => [...prev, ...newItems]);
    },
    [images, maxSizeMB, remainingSlots],
  );

  // input:file
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files?.length) addFiles(Array.from(files));
    e.currentTarget.value = ""; // reselect same file(s)
  };

  // DnD
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

  // Paste
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

  // Remove pending single
  const removePending = (id: string) => {
    setImages((prev) => {
      const img = prev.find((p) => p.id === id);

      if (img) URL.revokeObjectURL(img.url);

      return prev.filter((p) => p.id !== id);
    });
  };

  // Clear all pending
  const clearAllPending = () => {
    setImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));

      return [];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const toDelete = serverImages
        .filter((s) => s.toDelete)
        .map((s) => {
          const pos = Number.parseInt(s.key as unknown as string, 10);

          if (!Number.isFinite(pos)) {
            throw new Error(`Invalid image index: ${s.key}`);
          }

          return pos;
        })
        .sort((a, b) => b - a);

      for (const pos of toDelete) {
        await deleteImage(productId, String(pos));
      }

      const newFiles = images.map((i) => i.file);
      let uploaded: UploadReply = [];

      if (newFiles.length) {
        uploaded = await uploadProductImages(productId, newFiles);
      }

      const uploadedItems: UploadReplyItem[] = Array.isArray(uploaded)
        ? typeof uploaded[0] === "string"
          ? (uploaded as string[]).map((url, idx) => ({
              key: `temp-${Date.now()}-${idx}`,
              url,
            }))
          : (uploaded as UploadReplyItem[])
        : [];

      const kept = serverImages.filter((s) => !s.toDelete).map((k) => ({ ...k, toDelete: false }));
      const next = [...kept, ...uploadedItems];

      setServerImages(next);

      images.forEach((p) => URL.revokeObjectURL(p.url));
      setImages([]);

      await onChanged?.(next.map((x) => x.url));

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => onClose();

  return (
    <>
      <Button size="sm" title="Manage images" variant="outline" onClick={onOpen}>
        <Image alt="" className="hidden" height={0} src="/icons/image.svg" width={0} />
        Images
      </Button>

      <Modal
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
      >
        <ModalContent className="bg-brand-muted dark:bg-brand-muteddark rounded-t-xl">
          {() => (
            <>
              <ModalHeader className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <p className="text-sm text-text-subtle dark:text-text-subtledark">
                    Upload up to {maxFiles} images. Max size {maxSizeMB} MB each.
                  </p>
                </div>
                <Badge variant="secondary">
                  {serverImages.filter((s) => !s.toDelete).length + images.length} / {maxFiles}
                </Badge>
              </ModalHeader>

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="grid gap-4">
                  {/* Drop zone */}
                  <div
                    ref={dropRef}
                    aria-label="Upload images by clicking, dragging and dropping, or pasting"
                    className={cn(
                      "flex items-center justify-center rounded-lg border border-dashed p-6 transition-colors cursor-pointer outline-none",
                      isDragging
                        ? "bg-muted/50 border-foreground"
                        : "bg-muted/30 hover:bg-muted/50",
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
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-background border">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Drag and drop images here</p>
                        <p className="text-xs text-muted-foreground">
                          or click to browse • you can also paste images
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

                  {serverImages.length > 0 || images.length > 0 ? (
                    <ScrollArea className="max-h-[360px] rounded-lg border">
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* Existing images */}
                        {serverImages.map((img) => (
                          <figure
                            key={img.key}
                            className="relative group rounded-md overflow-hidden border bg-background"
                          >
                            <Image
                              alt="Existing"
                              className="h-36 w-full object-cover"
                              height={200}
                              src={img.url}
                              width={200}
                            />
                            <div className="absolute left-2 top-2">
                              <Badge variant={img.toDelete ? "destructive" : "secondary"}>
                                {img.toDelete ? "Will delete" : "Existing"}
                              </Badge>
                            </div>
                            <button
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-background/90 border opacity-0 group-hover:opacity-100 transition-opacity"
                              title={img.toDelete ? "Undo delete" : "Delete"}
                              type="button"
                              onClick={() =>
                                setServerImages((prev) =>
                                  prev.map((s) =>
                                    s.key === img.key ? { ...s, toDelete: !s.toDelete } : s,
                                  ),
                                )
                              }
                            >
                              {img.toDelete ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                            {img.toDelete && (
                              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
                            )}
                          </figure>
                        ))}

                        {/* Pending (new) images */}
                        {images.map((img) => (
                          <figure
                            key={img.id}
                            className="relative group rounded-md overflow-hidden border bg-background"
                          >
                            <Image
                              alt="Pending upload"
                              className="h-36 w-full object-cover"
                              height={200}
                              src={img.url || "/placeholder.png"}
                              width={200}
                            />
                            <div className="absolute left-2 top-2">
                              <Badge variant="default">New</Badge>
                            </div>
                            <button
                              aria-label="Remove image"
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-background/90 border opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
                              onClick={() => removePending(img.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </figure>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="rounded-lg border p-6 text-center text-muted-foreground">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border flex items-center justify-center">
                        <Images className="h-6 w-6" />
                      </div>
                      <p className="text-sm">No images yet.</p>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="mt-4">
                {images.length > 0 && (
                  <Button
                    className="mr-auto"
                    type="button"
                    variant="ghost"
                    onClick={clearAllPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear pending
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  disabled={
                    saving || (serverImages.every((s) => !s.toDelete) && images.length === 0)
                  }
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save photos"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
