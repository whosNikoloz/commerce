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
import { deleteImage, uploadBrandImages } from "@/app/api/services/brandService";

type ExistingImage = { key: string; url: string };
type UploadReplyItem = { key: string; url: string };
type UploadReply = string[] | UploadReplyItem[];

type ReviewImagesModalProps = {
  brandId: string;
  existing?: ExistingImage[];
  maxFiles?: number;
  maxSizeMB?: number;
  onChanged?: (urls: string[]) => void | Promise<void>;
  trigger?: React.ReactNode;
};

type SelectedImage = { id: string; file: File; url: string };
const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

export default function ReviewImagesModal({
  brandId,
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
        await deleteImage(brandId, String(pos));
      }

      const newFiles = images.map((i) => i.file);
      let uploaded: UploadReply = [];

      if (newFiles.length) uploaded = await uploadBrandImages(brandId, newFiles);

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
          title="Manage images"
          onClick={onOpen}
        >
          Images
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
      >
        <ModalContent>
          {() => (
            <>
              {/* დეკორატიული gradient overlay — AddFaqModal-ის სტილში */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5 pointer-events-none rounded-2xl" />

              <ModalHeader className="flex items-center justify-between gap-2 pb-2 pt-8 relative">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      Manage Brand Images
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Upload up to {maxFiles} images • Max {maxSizeMB}MB each
                    </p>
                  </div>
                </div>

                <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
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
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Drag & drop images here
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
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
                    <ScrollArea className="max-h-[360px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60">
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {/* Existing images */}
                        {serverImages.map((img) => (
                          <figure
                            key={img.key}
                            className="relative group rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            <Image
                              alt="Existing brand image"
                              className="h-36 w-full object-cover"
                              height={200}
                              src={img.url}
                              width={200}
                            />
                            <div className="absolute left-2 top-2">
                              <Badge
                                className={cn(
                                  "border",
                                  img.toDelete
                                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30"
                                    : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                                )}
                              >
                                {img.toDelete ? "Will delete" : "Existing"}
                              </Badge>
                            </div>
                            <button
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
                              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" />
                            )}
                          </figure>
                        ))}

                        {/* Pending images */}
                        {images.map((img) => (
                          <figure
                            key={img.id}
                            className="relative group rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          >
                            <Image
                              alt="Brand image pending upload"
                              className="h-36 w-full object-cover"
                              height={200}
                              src={img.url || "/placeholder.png"}
                              width={200}
                            />
                            <div className="absolute left-2 top-2">
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                New
                              </Badge>
                            </div>
                            <button
                              aria-label="Remove image"
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center bg-white/70 dark:bg-slate-800/60">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Images className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">No images yet.</p>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 relative">
                {images.length > 0 && (
                  <Button className="mr-auto" type="button" variant="ghost" onClick={clearAllPending}>
                    <X className="h-4 w-4 mr-2" />
                    Clear pending
                  </Button>
                )}
                <Button
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  disabled={saving || (serverImages.every((s) => !s.toDelete) && images.length === 0)}
                  onClick={handleSave}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save photos"
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
