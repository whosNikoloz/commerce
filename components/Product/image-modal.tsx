"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Heart,
  Share2,
} from "lucide-react";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { cn } from "@heroui/theme";
import { AnimatePresence, motion } from "framer-motion";

interface ImageModalProps {
  images: string[];
  productName: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  description?: string;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function ImageModal({
  images,
  productName,
  initialIndex = 0,
  isOpen,
  onClose,
  description,
  onFavorite,
  onShare,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Detect mobile device on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Reset zoom state when changing images
  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  // Initialize loaded state for all images
  useEffect(() => {
    if (isOpen) {
      setLoadedImages(new Array(images.length).fill(false));
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, images.length, initialIndex]);

  const handleImageLoaded = (index: number) => {
    setLoadedImages((prev) => {
      const newState = [...prev];

      newState[index] = true;

      return newState;
    });
  };

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const toggleZoom = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsZoomed((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") {
        if (isZoomed) setIsZoomed(false);
        else onClose();
      } else if (e.key === "z") toggleZoom();
    },
    [handleNext, handlePrevious, onClose, isZoomed, toggleZoom],
  );

  // Advanced touch handling for mobile
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isZooming: false,
    initialDistance: 0,
    initialZoom: 1,
    lastTapTime: 0,
  });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      // Single touch - track for swipe
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
      touchRef.current.startTime = Date.now();

      // Detect double tap (300ms window)
      const now = new Date().getTime();
      const timeSince = now - touchRef.current.lastTapTime;

      if (timeSince < 300 && timeSince > 0) {
        toggleZoom();
      }

      touchRef.current.lastTapTime = now;
    } else if (e.touches.length === 2 && isMobile) {
      // Pinch to zoom gesture detected
      touchRef.current.isZooming = true;

      // Calculate initial distance between two fingers
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      touchRef.current.initialDistance = distance;
      touchRef.current.initialZoom = isZoomed ? 1.5 : 1;

      setIsZoomed(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      e.touches.length === 2 &&
      touchRef.current.isZooming &&
      isMobile &&
      imageContainerRef.current
    ) {
      // Handle pinch zoom
      e.preventDefault(); // Prevent page scroll

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      // Calculate new scale based on how fingers have moved
      const newScale =
        (distance / touchRef.current.initialDistance) *
        touchRef.current.initialZoom;

      // Limit scale between 1 and 3
      const limitedScale = Math.max(1, Math.min(3, newScale));

      // Apply scale
      const image = imageContainerRef.current.querySelector("img");

      if (image) {
        image.style.transform = `scale(${limitedScale})`;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // If was zooming (two fingers), reset state
    if (touchRef.current.isZooming) {
      touchRef.current.isZooming = false;

      return;
    }

    // Handle swipe navigation
    if (isZoomed) return; // Don't navigate when zoomed

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const deltaX = touchRef.current.startX - endX;
    const deltaY = Math.abs(touchRef.current.startY - endY);

    // Check if horizontal swipe (deltaY small enough)
    if (deltaY < 50) {
      const timeElapsed = Date.now() - touchRef.current.startTime;

      // Speed-sensitive swipe detection
      const threshold = timeElapsed < 250 ? 30 : 50;

      if (deltaX > threshold) {
        handleNext(); // Swipe left = next
      } else if (deltaX < -threshold) {
        handlePrevious(); // Swipe right = previous
      }
    }
  };

  return (
    <Modal
      hideCloseButton
      classNames={{
        backdrop: "bg-black/90 backdrop-blur-md",
        base: isMobile
          ? "max-w-full w-full h-full m-0 rounded-none"
          : "max-w-7xl rounded-2xl shadow-2xl",
      }}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent
        aria-label={`Image gallery for ${productName}`}
        aria-modal="true"
        className="overflow-hidden outline-none h-full flex flex-col"
        role="dialog"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Top Control Bar */}
        <div
          className={cn(
            "sticky top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-gradient-to-b from-black/70 to-transparent",
            isMobile ? "py-2" : "px-6 py-4",
          )}
        >
          <h2
            className={cn(
              "text-white font-medium truncate max-w-[70%]",
              isMobile ? "text-base" : "text-xl",
            )}
          >
            {productName}
          </h2>
          <div className="flex space-x-2">
            {onFavorite && !isMobile && (
              <button
                aria-label="Favorite"
                className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={onFavorite}
              >
                <Heart className="h-5 w-5" />
              </button>
            )}
            {onShare && !isMobile && (
              <button
                aria-label="Share"
                className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={onShare}
              >
                <Share2 className="h-5 w-5" />
              </button>
            )}
            <button
              aria-label="Close modal"
              className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={onClose}
            >
              <X className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <ModalBody className="p-0 bg-neutral-900 relative flex-grow flex items-center justify-center">
          <div
            ref={imageContainerRef}
            aria-label={isZoomed ? "Zoom out of image" : "Zoom in to image"}
            className={cn(
              "relative w-full h-full overflow-hidden",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
            role="button"
            tabIndex={0}
            onClick={() => toggleZoom()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleZoom();
              }
            }}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                animate={{ opacity: 1 }}
                className="h-full w-full relative flex items-center justify-center"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  fill
                  priority
                  alt={`${productName} - Image ${currentIndex + 1}`}
                  className={cn(
                    "object-contain p-4 transition-all duration-300",
                    !touchRef.current.isZooming &&
                      (isZoomed ? "scale-150" : "scale-100"),
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
                  )}
                  sizes={isMobile ? "100vw" : "80vw"}
                  src={images[currentIndex] || "/placeholder.svg"}
                  onLoad={() => handleImageLoaded(currentIndex)}
                />

                {/* Loading state */}
                {!loadedImages[currentIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Zoom button - only on desktop */}
            {!isMobile && (
              <button
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                className="absolute right-6 bottom-6 z-20 rounded-full bg-black/40 p-3 text-white shadow-lg backdrop-blur-sm hover:bg-black/60 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom();
                }}
              >
                {isZoomed ? (
                  <ZoomOut className="h-5 w-5" />
                ) : (
                  <ZoomIn className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Navigation Buttons - only show when not zoomed and not on small mobile */}
            {!isZoomed && (
              <>
                <button
                  aria-label="Previous image"
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm hover:bg-black/60 hover:scale-110 transition transform",
                    isMobile ? "p-2" : "p-3",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <ChevronLeft
                    className={cn(isMobile ? "h-5 w-5" : "h-6 w-6")}
                  />
                </button>

                <button
                  aria-label="Next image"
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 text-white shadow-lg backdrop-blur-sm hover:bg-black/60 hover:scale-110 transition transform",
                    isMobile ? "p-2" : "p-3",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight
                    className={cn(isMobile ? "h-5 w-5" : "h-6 w-6")}
                  />
                </button>
              </>
            )}
          </div>
        </ModalBody>

        {/* Description Panel (conditional) - desktop only */}
        {description && !isMobile && (
          <div className="bg-white px-6 py-3 border-b border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Mobile Footer Bar with Image Counter */}
        {isMobile && (
          <div className="bg-white py-2 px-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-xs font-medium text-gray-700">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="flex gap-3">
              {onFavorite && (
                <button
                  aria-label="Favorite"
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                  onClick={onFavorite}
                >
                  <Heart className="h-5 w-5" />
                </button>
              )}
              {onShare && (
                <button
                  aria-label="Share"
                  className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                  onClick={onShare}
                >
                  <Share2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Thumbnails - only show on larger screens */}
        {!isMobile && (
          <div className="bg-white px-6 py-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-medium text-gray-700">
                Image {currentIndex + 1} of {images.length}
              </div>
              <div className="flex space-x-2 text-xs text-gray-500">
                <span>Z to zoom</span>
                <span>ESC to close</span>
              </div>
            </div>

            <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 shadow",
                    currentIndex === index
                      ? "ring-2 ring-primary scale-105 shadow-md"
                      : "ring-1 ring-gray-200 opacity-80 hover:opacity-100 hover:scale-105",
                  )}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    fill
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="object-cover"
                    src={image}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
