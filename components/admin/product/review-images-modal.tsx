"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images, Trash2, Upload, X } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteImage, uploadProductImages } from "@/app/api/services/productService";

type ExistingImage = { key: string; url: string };
type UploadReplyItem = { key: string; url: string };
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

  const [serverImages, setServerImages] = useState<(ExistingImage & { toDelete?: boolean })[]>(() =>
    (existing ?? []).map((i) => ({ ...i, toDelete: false })),
  );
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setServerImages((existing ?? []).map((i) => ({ ...i, toDelete: false })));
    setImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));

      return [];
    });
  }, [isOpen, existing]);

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

  const removePending = (id: string) => {
    setImages((prev) => {
      const img = prev.find((p) => p.id === id);

      if (img) URL.revokeObjectURL(img.url);

      return prev.filter((p) => p.id !== id);
    });
  };
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
        .map((s) => Number.parseInt(s.key as unknown as string, 10))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => b - a);

      for (const pos of toDelete) {
        await deleteImage(productId, String(pos));
      }

      const newFiles = images.map((i) => i.file);
      let uploaded: UploadReply = [];

      if (newFiles.length) uploaded = await uploadProductImages(productId, newFiles);

      const uploadedItems: UploadReplyItem[] = Array.isArray(uploaded)
        ? typeof uploaded[0] === "string"
          ? (uploaded as string[]).map((url, idx) => ({ key: `temp-${Date.now()}-${idx}`, url }))
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
      <Button
        className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
        size="sm"
        title="Manage images"
        variant="outline"
        onClick={onOpen}
      >
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
        <ModalContent className="bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark rounded-t-xl">
          {() => (
            <>
              <ModalHeader className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <p className="text-sm text-text-subtle">
                    Upload up to {maxFiles} images. Max size {maxSizeMB} MB each.
                  </p>
                </div>
                <Badge
                  className="bg-brand-muted dark:bg-brand-muteddark text-text-light"
                  variant="secondary"
                >
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
                        ? "bg-brand-muted/50 border-brand-primary"
                        : "bg-brand-muted/30 hover:bg-brand-muted/50 dark:bg-brand-muteddark/30 dark:hover:bg-brand-muteddark/50 border-brand-muted dark:border-brand-muteddark",
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
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-surface dark:bg-brand-surfacedark border border-brand-muted dark:border-brand-muteddark">
                        <Upload className="h-5 w-5 text-text-light dark:text-text-lightdark" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-light dark:text-text-lightdark">
                          Drag and drop images here
                        </p>
                        <p className="text-xs text-text-subtle">
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
                    <ScrollArea className="max-h-[360px] rounded-lg border border-brand-muted dark:border-brand-muteddark">
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* Existing images */}
                        {serverImages.map((img) => (
                          <figure
                            key={img.key}
                            className="relative group rounded-md overflow-hidden border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark"
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
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-brand-surface/90 dark:bg-brand-surfacedark/90 border border-brand-muted dark:border-brand-muteddark opacity-0 group-hover:opacity-100 transition-opacity"
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
                              <div className="absolute inset-0 bg-brand-muted/60 dark:bg-brand-muteddark/60 backdrop-blur-[1px]" />
                            )}
                          </figure>
                        ))}

                        {/* Pending images */}
                        {images.map((img) => (
                          <figure
                            key={img.id}
                            className="relative group rounded-md overflow-hidden border border-brand-muted dark:border-brand-muteddark bg-brand-surface dark:bg-brand-surfacedark"
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
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-brand-surface/90 dark:bg-brand-surfacedark/90 border border-brand-muted dark:border-brand-muteddark opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark p-6 text-center text-text-subtle">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border border-brand-muted dark:border-brand-muteddark flex items-center justify-center">
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
                <Button
                  className="bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark border border-brand-muted dark:border-brand-muteddark hover:bg-brand-surface/70 dark:hover:bg-brand-surfacedark/70"
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white"
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
