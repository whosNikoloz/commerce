"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { cn } from "@heroui/theme";
import useEmblaCarousel from "embla-carousel-react";
import { useIsMobile } from "@/hooks/use-mobile";


interface ImageModalProps {
  images: string[];
  productName: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  description?: string;
}

export default function ImageModal({
  images,
  productName,
  initialIndex = 0,
  isOpen,
  onClose,
  description,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Embla Carousel with options
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: initialIndex,
  });

  const isMobile = useIsMobile();


  // Reset zoom state when changing images
  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  // Initialize loaded state for all images
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, images.length, initialIndex]);

  // Initialize Embla Carousel when it's ready
  useEffect(() => {
    if (emblaApi) {
      // Make sure we start at the initial index
      emblaApi.scrollTo(initialIndex);

      // Set up an event listener to update the current index
      const onSelect = () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      };

      emblaApi.on("select", onSelect);

      return () => {
        emblaApi.off("select", onSelect);
      };
    }
  }, [emblaApi, initialIndex]);

  // When current index changes from thumbnail click, scroll carousel
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [currentIndex, emblaApi]);

  const handlePrevious = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

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
    if (isZoomed) {
      // Let Embla handle normal touch events when not zoomed
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

  const handleTouchEnd = () => {
    // If was zooming (two fingers), reset state
    if (touchRef.current.isZooming) {
      touchRef.current.isZooming = false;

      return;
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
      scrollBehavior="inside"
      size={isMobile ? "xs" : "xs"}
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
        <div
          className={cn(
            "sticky top-0 left-0 right-0 z-50 flex justify-end items-center px-4 py-3 to-transparent",
            isMobile ? "py-5" : "px-6 py-4",
          )}
        >
          <div className="flex space-x-2">
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
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Main Image with Embla Carousel */}
            <div className="flex-1 flex items-center justify-center bg-black relative">
              {/* Navigation Buttons */}
              <button
                className="absolute left-4 z-10 bg-black/40 rounded-full p-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                className="absolute right-4 z-10 bg-black/40 rounded-full p-2 text-white hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Embla Carousel */}
              <div ref={emblaRef} className="overflow-hidden w-full h-full">
                <div className="flex h-full">
                  {images.map((image, idx) => (
                    <div
                      key={idx}
                      ref={idx === currentIndex ? imageContainerRef : undefined}
                      className="relative flex-grow-0 flex-shrink-0 w-full h-full"
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                      onTouchStart={handleTouchStart}
                    >
                      <Image
                        fill
                        unoptimized
                        alt={`${productName} image ${idx + 1}`}
                        className={cn(
                          "object-contain transition-transform duration-300 ease-in-out",
                          isZoomed && currentIndex === idx
                            ? "scale-150"
                            : "scale-100",
                        )}
                        src={image || ""}
                        onClick={toggleZoom}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Thumbnails and Description */}
            <div className="w-full md:w-[350px] p-4 flex flex-col gap-4 text-white bg-neutral-800 overflow-y-auto">
              {!isMobile && (
                <>
                  <div className="text-lg font-semibold">{productName}</div>
                  <div className="text-sm text-neutral-300">{description}</div>
                </>
              )}

              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[60vh] w-full mt-4">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "border rounded-md transition hover:ring-2 hover:ring-white focus:outline-none",
                      currentIndex === idx ? "ring-2 ring-white" : "opacity-70",
                    )}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <div className="relative w-16 h-16 md:w-24 md:h-24">
                      <Image
                        fill
                        alt={`Thumbnail ${idx + 1}`}
                        className="object-cover rounded-md"
                        src={image}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>

        {description && isMobile && (
          <div className="bg-white dark:bg-neutral-900 px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {isMobile && (
          <div className="bg-white dark:bg-neutral-900 py-2 px-4 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
