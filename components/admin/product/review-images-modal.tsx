"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images, Trash2, Upload, X } from "lucide-react";
import { Image as ImageIcon } from "lucide-react"; // only if you also need the icon
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
import { GoBackButton } from "@/components/go-back-button";
import { useIsMobile } from "@/hooks/use-mobile";
//import { useToast } from "@/hooks/use-toast"

type ReviewImagesModalProps = {
  onSave?: (files: File[]) => void | Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  defaultFiles?: File[];
};

type SelectedImage = {
  id: string;
  file: File;
  url: string;
};

function fileKey(f: File) {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

export default function ReviewImagesModal({
  onSave = async () => {},
  maxFiles = 8,
  maxSizeMB = 5,
  defaultFiles,
}: ReviewImagesModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  //const EMPTY_FILES = useMemo<File[]>(() => [], []);
  //const resolvedDefaultFiles = defaultFiles ?? EMPTY_FILES;

  //const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<SelectedImage[]>(() => {
    return (defaultFiles ?? []).slice(0, maxFiles).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen) return;
    // Reset images from defaultFiles when opening or when defaults change
    setImages((prev) => {
      // Revoke existing object URLs before replacing
      prev.forEach((p) => URL.revokeObjectURL(p.url));

      return (defaultFiles ?? []).slice(0, maxFiles).map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultFiles, maxFiles]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCloseModal(): void {
    onClose();
  }

  const remainingSlots = useMemo(
    () => Math.max(0, maxFiles - images.length),
    [images.length, maxFiles],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (!files?.length) return;

      const allowed = files.filter((f) => f.type.startsWith("image/"));
      const rejectedType = files.length - allowed.length;

      if (rejectedType > 0) {
        // toast({
        //     title: "Some files were skipped",
        //     description: `${rejectedType} file(s) are not images.`,
        //     variant: "destructive",
        // })
      }

      // Size filtering
      const sizeLimitBytes = maxSizeMB * 1024 * 1024;
      const withinSize = allowed.filter((f) => f.size <= sizeLimitBytes);
      const rejectedSize = allowed.length - withinSize.length;

      if (rejectedSize > 0) {
        // toast({
        //     title: "File too large",
        //     description: `${rejectedSize} file(s) exceeded ${maxSizeMB} MB.`,
        //     variant: "destructive",
        // })
      }

      // Deduplicate by name-size-lastModified against current queue
      const existingKeys = new Set(images.map((i) => fileKey(i.file)));
      const deduped = withinSize.filter((f) => !existingKeys.has(fileKey(f)));

      // Enforce maxFiles
      const capacity = remainingSlots;

      if (deduped.length > capacity) {
        // toast({
        //     title: "Limit reached",
        //     description: `You can add up to ${maxFiles} images.`,
        //     variant: "destructive",
        // })
      }
      const toAdd = deduped.slice(0, capacity);

      const newItems = toAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));

      if (newItems.length > 0) {
        setImages((prev) => [...prev, ...newItems]);
      }
    },
    [images, maxFiles, maxSizeMB, remainingSlots], //toast
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length) addFiles(Array.from(files));
    // reset input to allow re-selecting the same file(s)
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
    // ensure leave from the drop area only
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files: File[] = [];

    Array.from(e.clipboardData.items).forEach((item) => {
      if (item.kind === "file") {
        const f = item.getAsFile();

        if (f) files.push(f);
      }
    });
    if (files.length) addFiles(files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((p) => p.id === id);

      if (img) URL.revokeObjectURL(img.url);

      return prev.filter((p) => p.id !== id);
    });
  };

  const clearAll = () => {
    setImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));

      return [];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(images.map((i) => i.file));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={onOpen}>
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Modal
        classNames={{
          backdrop: "backdrop-blur-3xl",
          base: "rounded-t-xl",
        }}
        hideCloseButton={isMobile}
        isOpen={isOpen}
        motionProps={{
          variants: {
            enter: {
              y: 40,
              opacity: 0,
              scale: 0.96,
              transition: { duration: 0 },
            },
            center: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 32,
                mass: 0.8,
              },
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
        <ModalContent className="bg-brand-muted dark:bg-brand-muteddark">
          {() => (
            <>
              {isMobile ? (
                <ModalHeader className="flex items-center gap-2 px-4 pt-6 mx-4 z-50">
                  <GoBackButton onClick={handleCloseModal} />
                </ModalHeader>
              ) : (
                <ModalHeader className="flex flex-col gap-1">
                  <p className="text-sm text-text-subtle dark:text-text-subtledark">
                    Upload up to {maxFiles} images. Max size {maxSizeMB} MB each.
                  </p>
                  <Badge className="ml-auto" variant="secondary">
                    {images.length} / {maxFiles}
                  </Badge>
                </ModalHeader>
              )}

              <ModalBody className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="grid gap-4">
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

                  {images.length === 0 ? (
                    <div className="rounded-lg border p-6 text-center text-muted-foreground">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-full border flex items-center justify-center">
                        <Images className="h-6 w-6" />
                      </div>
                      <p className="text-sm">No images added yet.</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[360px] rounded-lg border">
                      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((img) => (
                          <figure
                            key={img.id}
                            className="relative group rounded-md overflow-hidden border bg-background"
                          >
                            <Image
                              alt="Selected review"
                              className="h-36 w-full object-cover"
                              height={200}
                              src={img.url || "/placeholder.svg"}
                              width={200}
                            />
                            <button
                              aria-label="Remove image"
                              className="absolute top-2 right-2 inline-flex items-center justify-center h-8 w-8 rounded-md bg-background/90 border opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
                              onClick={() => removeImage(img.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </figure>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <ModalFooter className="mt-4">
                  {images.length > 0 && (
                    <Button className="mr-auto" type="button" variant="ghost" onClick={clearAll}>
                      <X className="h-4 w-4 mr-2" />
                      Clear all
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    disabled={images.length === 0 || saving}
                    type="button"
                    onClick={handleSave}
                  >
                    {saving ? "Saving..." : "Save photos"}
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
