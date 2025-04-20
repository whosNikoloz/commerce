"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from "lucide-react";
import { cn } from "@heroui/theme";
import { Card } from "@heroui/card";

import ImageModal from "./image-modal";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState({ width: 100, height: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const zoomResultRef = useRef<HTMLDivElement>(null);

  // Zoom magnification factor
  const zoomLevel = 3;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    // Calculate lens size based on zoom level and container size
    if (imageContainerRef.current && zoomResultRef.current) {
      const containerRect = imageContainerRef.current.getBoundingClientRect();
      const zoomRect = zoomResultRef.current.getBoundingClientRect();

      // Calculate lens size based on the ratio of container to zoom area
      const lensWidth = zoomRect.width / zoomLevel;
      const lensHeight = zoomRect.height / zoomLevel;

      setLensSize({
        width: lensWidth,
        height: lensHeight,
      });
    }
  }, [zoomLevel]);

  const nextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleProductClick = () => {
    console.log("sdad");
    setIsModalOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();

    // Calculate cursor position relative to the image container
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    // Calculate lens position (centered on cursor)
    let lensLeft = mouseX - lensSize.width / 2;
    let lensTop = mouseY - lensSize.height / 2;

    // Prevent lens from going outside the image
    if (lensLeft < 0) lensLeft = 0;
    if (lensTop < 0) lensTop = 0;
    if (lensLeft > width - lensSize.width) lensLeft = width - lensSize.width;
    if (lensTop > height - lensSize.height) lensTop = height - lensSize.height;

    // Set lens position
    setLensPosition({
      x: lensLeft,
      y: lensTop,
    });

    // Calculate zoom position as percentage for the background position
    const zoomX = (lensLeft / (width - lensSize.width)) * 100;
    const zoomY = (lensTop / (height - lensSize.height)) * 100;

    setZoomPosition({ x: zoomX, y: zoomY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-full">
          <Card
            ref={imageContainerRef}
            className="relative rounded-lg overflow-hidden bg-white dark:bg-neutral-900 aspect-square cursor-crosshair"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {/* Main product image */}
            <Image
              fill
              alt={productName}
              className="object-contain p-4"
              src={images[selectedImage] || "/placeholder.svg"}
              onClick={handleProductClick}
            />

            {/* Zoom lens/box that appears when hovering */}
            {isHovering && !isMobile && (
              <div
                className="absolute border-2 rounded-md border-primary pointer-events-none z-50 bg-primary/10 dark:bg-primary/20"
                style={{
                  left: `${lensPosition.x}px`,
                  top: `${lensPosition.y}px`,
                  width: `${lensSize.width}px`,
                  height: `${lensSize.height}px`,
                }}
              />
            )}

            {/* Navigation buttons */}
            <button
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full p-2 shadow-md hover:bg-white z-20"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full p-2 shadow-md hover:bg-white z-20"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Zoom indicator */}
            <div className="absolute top-3 right-3 bg-white/80 dark:bg-neutral-800/80 text-black dark:text-white rounded-full p-1.5 shadow-sm z-10">
              <ZoomIn className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Fullscreen button */}
            <button
              aria-label="View fullscreen"
              className="absolute top-3 right-12 bg-white/80 dark:bg-neutral-800/80 rounded-full p-1.5 text-black shadow-sm hover:bg-white z-10"
              onClick={() => setIsModalOpen(true)}
            >
              <Maximize2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* Zoom result panel (visible when hovering) - Positioned as overlay */}
        {isHovering && !isMobile && (
          <div
            ref={zoomResultRef}
            className="absolute top-36 left-full mx-5 w-1/2 border rounded-lg overflow-hidden bg-white dark:bg-neutral-900 aspect-square shadow-lg z-30 transition-opacity duration-200"
          >
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${images[selectedImage] || "/placeholder.svg"})`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "flex-shrink-0 border rounded-md overflow-hidden cursor-pointer transition-all",
              selectedImage === index
                ? "border-primary ring-2 ring-primary/20"
                : "hover:border-gray-300",
            )}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              alt={`Product view ${index + 1}`}
              className="w-20 h-20 object-cover"
              height={80}
              src={image || "/placeholder.svg"}
              width={80}
            />
          </button>
        ))}
      </div>

      {/* Image Modal */}
      <ImageModal
        images={images}
        initialIndex={selectedImage}
        isOpen={isModalOpen}
        productName={productName}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
