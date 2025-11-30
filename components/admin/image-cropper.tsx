"use client";

import { useState, useRef, useCallback, useEffect, useId } from "react";
import { Upload, Crop, X, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { compressImage } from "@/lib/image-compression";

interface ImageCropperProps {
  aspectRatio?: number; // e.g., 1 for square, 16/9 for landscape, 3/4 for portrait
  onImageCropped: (croppedImageUrl: string | null) => void;
  maxWidth?: number;
  maxHeight?: number;
  label?: string;
  currentImage?: string;
  file?: File | null; // External file to crop
}

export function ImageCropper({
  aspectRatio = 1, // Default to square
  onImageCropped,
  maxWidth = 1200,
  maxHeight = 1200,
  label = "Upload Image",
  currentImage,
  file: externalFile,
}: ImageCropperProps) {
  const labelId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle external file prop
  useEffect(() => {
    if (externalFile) {
      setSelectedFile(externalFile);
      const reader = new FileReader();

      reader.onload = (event) => {
        setPreview(event.target?.result as string);
        setIsCropping(true);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(externalFile);
    }
  }, [externalFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");

      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");

      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(event.target?.result as string);
      setIsCropping(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };

    reader.readAsDataURL(file);
  }, []);

  const startDrag = (x: number, y: number) => {
    setIsDragging(true);
    setDragStart({
      x: x - position.x,
      y: y - position.y,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];

    if (!touch) return;
    startDrag(touch.clientX, touch.clientY);
  };

  const handlePointerMove = useCallback(
    (x: number, y: number) => {
      if (!isDragging) return;

      setPosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY),
    [handlePointerMove],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];

      if (!touch) return;
      handlePointerMove(touch.clientX, touch.clientY);
    },
    [handlePointerMove],
  );

  const endDrag = () => {
    setIsDragging(false);
  };

  const getCroppedImage = useCallback(async () => {
    if (!preview || !canvasRef.current || !imageRef.current || !containerRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetWidth / aspectRatio;

    // Set canvas size to desired output
    canvas.width = Math.min(maxWidth, containerWidth);
    canvas.height = Math.min(maxHeight, containerHeight);

    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Calculate scaling
    const scale = canvas.width / containerWidth;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image position and size
    const imgWidth = image.naturalWidth * zoom * scale;
    const imgHeight = image.naturalHeight * zoom * scale;
    const imgX = position.x * scale;
    const imgY = position.y * scale;

    // Draw image
    ctx.drawImage(
      image,
      imgX,
      imgY,
      imgWidth,
      imgHeight
    );

    // Convert to data URL for easier handling
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    return dataUrl;
  }, [preview, zoom, position, aspectRatio, maxWidth, maxHeight]);

  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File([blob], filename, { type: blob.type });
  };

  const handleCropComplete = async () => {
    const croppedUrl = await getCroppedImage();

    if (croppedUrl) {
      try {
        // Convert dataURL to File
        const croppedFile = await dataUrlToFile(croppedUrl, selectedFile?.name || "cropped-image.jpg");

        // Compress the cropped image
        const compressedFile = await compressImage(croppedFile, {
          maxWidthOrHeight: 1920,
          maxSizeMB: 4,
          quality: 0.85,
        });

        // Convert back to dataURL for onImageCropped callback
        const reader = new FileReader();

        reader.onload = () => {
          onImageCropped(reader.result as string);
          setIsCropping(false);
          toast.success("Image cropped and compressed successfully");
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error("Failed to compress cropped image:", err);
        // Fallback to uncompressed if compression fails
        onImageCropped(croppedUrl);
        setIsCropping(false);
        toast.success("Image cropped successfully");
      }
    }
  };

  const handleCancel = () => {
    setIsCropping(false);
    setPreview(currentImage || null);
    setSelectedFile(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    onImageCropped(null); // Notify parent that cropping was cancelled
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    setIsCropping(false);
    onImageCropped("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 5;

    switch (e.key) {
      case "ArrowUp":
        setPosition((prev) => ({ ...prev, y: prev.y - step }));
        e.preventDefault();
        break;
      case "ArrowDown":
        setPosition((prev) => ({ ...prev, y: prev.y + step }));
        e.preventDefault();
        break;
      case "ArrowLeft":
        setPosition((prev) => ({ ...prev, x: prev.x - step }));
        e.preventDefault();
        break;
      case "ArrowRight":
        setPosition((prev) => ({ ...prev, x: prev.x + step }));
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-primary text-sm font-medium text-slate-700 dark:text-slate-300" id={labelId}>
        {label}
      </p>

      {!isCropping && !preview && (
        <div className="relative">
          <input
            accept="image/*"
            className="hidden"
            id="image-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label aria-label="Upload image" htmlFor="image-upload">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <div
                className="flex flex-col items-center justify-center p-8"
                style={{ aspectRatio }}
              >
                <Upload className="h-12 w-12 text-slate-400 mb-4" />
                <p className="font-primary text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Click to upload image
                </p>
                <p className="font-primary text-xs text-slate-500">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </Card>
          </label>
        </div>
      )}

      {!isCropping && preview && (
        <div className="space-y-2">
          <Card className="border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            <div
              className="relative bg-slate-100 dark:bg-slate-800"
              style={{ aspectRatio }}
            >
              <Image
                fill
                alt="Preview"
                className="object-contain"
                src={preview}
              />
            </div>
          </Card>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="button"
              variant="outline"
              onClick={() => setIsCropping(true)}
            >
              <Crop className="h-4 w-4 mr-2" />
              Adjust
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {isCropping && preview && (
        <div className="space-y-4">
          <Card className="border-2 border-blue-500 dark:border-blue-500 overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
            <div
              ref={containerRef}
              aria-label="Drag to reposition, arrow keys to nudge, pinch/scroll to zoom"
              aria-labelledby={labelId}
              className="relative overflow-hidden cursor-move select-none"
              style={{ aspectRatio, touchAction: "none" }}
              onKeyDown={handleKeyDown}
              onMouseDown={handleMouseDown}
              onMouseLeave={endDrag}
              onMouseMove={handleMouseMove}
              onMouseUp={endDrag}
              onTouchEnd={endDrag}
              onTouchMove={handleTouchMove}
              // eslint-disable-next-line react/jsx-sort-props
              onTouchStart={handleTouchStart}
              role="application"
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  cursor: isDragging ? "grabbing" : "grab",
                }}
              >
                <Image
                  ref={imageRef}
                  fill
                  priority
                  alt="Crop preview"
                  className="max-w-none"
                  draggable={false}
                  sizes="100vw"
                  src={preview}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full w-full grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Zoom</Label>
              <span className="font-primary text-sm text-slate-500">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <Slider
              max={3}
              min={0.5}
              step={0.1}
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
            />
          </div>

          <p className="font-primary text-xs text-slate-500 text-center">
            Drag to reposition • Use slider to zoom
          </p>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              type="button"
              onClick={handleCropComplete}
            >
              <Check className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
