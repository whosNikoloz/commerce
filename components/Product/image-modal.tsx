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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    startIndex: initialIndex,
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, images.length, initialIndex]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [currentIndex, emblaApi]);

  const handlePrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const handleNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const toggleZoom = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
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

  // touch helpers
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
    if (!isZoomed) return;

    if (e.touches.length === 1) {
      touchRef.current.startX = e.touches[0].clientX;
      touchRef.current.startY = e.touches[0].clientY;
      touchRef.current.startTime = Date.now();

      const now = Date.now();
      const dt = now - touchRef.current.lastTapTime;

      if (dt > 0 && dt < 300) toggleZoom();
      touchRef.current.lastTapTime = now;
    } else if (e.touches.length === 2 && isMobile) {
      touchRef.current.isZooming = true;
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

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
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const newScale = (distance / touchRef.current.initialDistance) * touchRef.current.initialZoom;
      const limited = Math.max(1, Math.min(3, newScale));
      const img = imageContainerRef.current.querySelector("img");

      if (img) img.style.transform = `scale(${limited})`;
    }
  };

  const handleTouchEnd = () => {
    if (touchRef.current.isZooming) touchRef.current.isZooming = false;
  };

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.scrollTo(initialIndex);

    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, initialIndex]);

  return (
    <Modal
      hideCloseButton
      classNames={{
        backdrop: "bg-background/90 backdrop-blur-md",
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
        className="overflow-hidden outline-none h-full flex flex-col bg-background text-foreground"
        role="dialog"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Top bar */}
        <div
          className={cn(
            "sticky top-0 left-0 right-0 z-50 flex justify-end items-center",
            "px-4 py-3",
            isMobile ? "py-5" : "px-6 py-4",
            "bg-gradient-to-b from-background/90 to-transparent",
          )}
        >
          <div className="flex space-x-2">
            <button
              aria-label="Close modal"
              className="rounded-full bg-muted/60 p-2 text-foreground backdrop-blur-sm transition hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={onClose}
            >
              <X className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <ModalBody className="p-0 relative flex-grow flex items-center justify-center bg-background">
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Main viewer */}
            <div className="flex-1 flex items-center justify-center relative bg-muted/5">
              {/* Nav buttons */}
              <button
                aria-label="Previous image"
                className="absolute left-4 z-10 rounded-full p-2 text-foreground bg-muted/60 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-4 z-10 rounded-full p-2 text-foreground bg-muted/60 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Embla */}
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
                          isZoomed && currentIndex === idx ? "scale-150" : "scale-100",
                        )}
                        src={image || ""}
                        onClick={toggleZoom}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right rail */}
            <aside className="w-full md:w-[350px] p-4 md:p-6 flex flex-col gap-4 bg-background/50 dark:bg-neutral-900/50 border-l border-gray-200 dark:border-gray-800 overflow-y-auto backdrop-blur-sm">
              {!isMobile && (
                <>
                  <div className="text-lg font-semibold text-foreground">{productName}</div>
                  {description && (
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-col gap-3 max-h-[60vh] w-full mt-2">
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "relative rounded-lg overflow-hidden transition-all duration-200 focus:outline-none group",
                        "bg-white dark:bg-neutral-800",
                        currentIndex === idx
                          ? "ring-2 ring-primary shadow-lg scale-105"
                          : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-primary/50 hover:shadow-md opacity-70 hover:opacity-100",
                      )}
                      onClick={() => setCurrentIndex(idx)}
                    >
                      <div className="relative aspect-square w-full">
                        <Image
                          fill
                          alt={`Thumbnail ${idx + 1}`}
                          className="object-contain p-1"
                          sizes="(max-width: 768px) 100px, 120px"
                          src={image}
                        />
                      </div>
                      {currentIndex === idx && (
                        <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </ModalBody>

        {description && isMobile && (
          <div className="px-6 py-3 border-b bg-background border-border">
            <p className="font-primary text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {isMobile && (
          <div className="py-2 px-4 border-t bg-background border-border flex justify-between items-center">
            <div className="text-xs font-medium text-foreground">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
