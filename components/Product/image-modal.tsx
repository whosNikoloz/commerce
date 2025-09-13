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
        backdrop: "bg-brand-surfacedark/90 backdrop-blur-md",
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
        className="overflow-hidden outline-none h-full flex flex-col bg-brand-surface dark:bg-brand-surfacedark text-text-light dark:text-text-lightdark"
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
            "bg-gradient-to-b from-brand-surface/90 dark:from-brand-surfacedark/90 to-transparent",
          )}
        >
          <div className="flex space-x-2">
            <button
              aria-label="Close modal"
              className="rounded-full bg-brand-surface/60 dark:bg-brand-surfacedark/60 p-2 text-text-light dark:text-text-lightdark backdrop-blur-sm transition hover:bg-brand-surface/80 dark:hover:bg-brand-surfacedark/80 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              onClick={onClose}
            >
              <X className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <ModalBody className="p-0 relative flex-grow flex items-center justify-center bg-brand-surface dark:bg-brand-surfacedark">
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Main viewer */}
            <div className="flex-1 flex items-center justify-center relative bg-brand-surfacedark/5 dark:bg-brand-surfacedark">
              {/* Nav buttons */}
              <button
                className="absolute left-4 z-10 rounded-full p-2 text-text-light dark:text-text-lightdark bg-brand-surface/60 dark:bg-brand-surfacedark/60 hover:bg-brand-surface/80 dark:hover:bg-brand-surfacedark/80 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 z-10 rounded-full p-2 text-text-light dark:text-text-lightdark bg-brand-surface/60 dark:bg-brand-surfacedark/60 hover:bg-brand-surface/80 dark:hover:bg-brand-surfacedark/80 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
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
            <aside className="w-full md:w-[350px] p-4 flex flex-col gap-4 bg-brand-muted dark:bg-brand-muteddark text-text-light dark:text-text-lightdark overflow-y-auto">
              {!isMobile && (
                <>
                  <div className="text-lg font-semibold">{productName}</div>
                  <div className="text-sm text-text-subtle dark:text-text-subtledark">
                    {description}
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[60vh] w-full mt-4">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "border rounded-md transition focus:outline-none",
                      "border-brand-muted dark:border-brand-muteddark",
                      "hover:ring-2 hover:ring-brand-primary/80",
                      currentIndex === idx ? "ring-2 ring-brand-primary" : "opacity-80",
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
            </aside>
          </div>
        </ModalBody>

        {description && isMobile && (
          <div className="px-6 py-3 border-b bg-brand-surface dark:bg-brand-surfacedark border-brand-muted dark:border-brand-muteddark">
            <p className="text-text-subtle dark:text-text-subtledark text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {isMobile && (
          <div className="py-2 px-4 border-t bg-brand-surface dark:bg-brand-surfacedark border-brand-muted dark:border-brand-muteddark flex justify-between items-center">
            <div className="text-xs font-medium text-text-light dark:text-text-lightdark">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
