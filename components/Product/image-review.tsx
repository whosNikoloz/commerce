"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@heroui/theme";
import { Card } from "@heroui/card";
import useEmblaCarousel from "embla-carousel-react";

import ImageModal from "./image-modal";

import { useIsMobile } from "@/hooks/use-mobile";

interface ImageReviewProps {
  images: string[];
  productName: string;
}

export function ImageReview({ images, productName }: ImageReviewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState({ width: 100, height: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const zoomResultRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const zoomLevel = 3;
  const placeholder = "/placeholder.svg"; // make sure it exists in /public

  const isMobile = useIsMobile();

  useEffect(() => {
    if (imageContainerRef.current && zoomResultRef.current) {
      const zoomRect = zoomResultRef.current.getBoundingClientRect();

      const lensWidth = zoomRect.width / zoomLevel;
      const lensHeight = zoomRect.height / zoomLevel;

      setLensSize({
        width: lensWidth,
        height: lensHeight,
      });
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(selectedImage);
    }
  }, [selectedImage, emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedImage(emblaApi.selectedScrollSnap());
    scrollSelectedThumbnailIntoView();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const nextImage = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
    scrollSelectedThumbnailIntoView();
  };

  const prevImage = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
    scrollSelectedThumbnailIntoView();
  };

  useEffect(() => {
    scrollSelectedThumbnailIntoView();
  }, [selectedImage]);

  const scrollSelectedThumbnailIntoView = () => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const selectedThumbnail = container.children[selectedImage] as HTMLElement;

      if (selectedThumbnail) {
        selectedThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  };

  const handleProductClick = () => {
    setIsModalOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();

    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    let lensLeft = mouseX - lensSize.width / 2;
    let lensTop = mouseY - lensSize.height / 2;

    if (lensLeft < 0) lensLeft = 0;
    if (lensTop < 0) lensTop = 0;
    if (lensLeft > width - lensSize.width) lensLeft = width - lensSize.width;
    if (lensTop > height - lensSize.height) lensTop = height - lensSize.height;

    // Set lens position
    setLensPosition({
      x: lensLeft,
      y: lensTop,
    });

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

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="relative rounded-lg overflow-hidden bg-white dark:bg-neutral-900 aspect-square max-h-72">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No images available</p>
          </div>
        </Card>
      </div>
    );
  }

  const ImageIndicator = () => (
    <div className="absolute bottom-3 md:mb-20 mb-0 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full z-20">
      {selectedImage + 1} / {images.length}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div ref={emblaRef} className="w-full overflow-hidden">
            <div className="flex gap-4">
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%]">
                  <Card
                    ref={index === selectedImage ? imageContainerRef : null}
                    className="relative rounded-lg overflow-hidden aspect-square cursor-crosshair"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <Image
                      fill
                      alt={`${productName} view ${index + 1}`}
                      className="object-contain"
                      src={image || placeholder}
                      onClick={handleProductClick}
                    />
                    {isHovering && index === selectedImage && (
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
                  </Card>
                </div>
              ))}
            </div>
          </div>
          <ImageIndicator />
          {/* Navigation buttons */}
          <button
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full p-2 shadow-md hover:bg-white z-20"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full p-2 shadow-md hover:bg-white z-20"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-24 h-[480px] flex-shrink-0">
          <div
            ref={thumbnailsContainerRef}
            className="h-full flex flex-col space-y-3 overflow-y-auto scrollbar-thin pr-2
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-track]:bg-neutral-700
            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {images.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "flex-shrink-0 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ease-in-out",
                  selectedImage === index
                    ? "border-primary ring-2 ring-primary/30 shadow-md"
                    : "border-transparent hover:border-gray-200 dark:hover:border-gray-600",
                )}
                onClick={() => setSelectedImage(index)}
              >
                <div className="relative aspect-square">
                  <Image
                    fill
                    alt={`Product view ${index + 1}`}
                    className="object-cover"
                    src={image || placeholder}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4">
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%]">
                  <Card
                    ref={index === selectedImage ? imageContainerRef : null}
                    className="relative rounded-lg overflow-hidden aspect-square cursor-crosshair"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <Image
                      fill
                      alt={`${productName} view ${index + 1}`}
                      className="object-contain"
                      src={image || placeholder}
                      onClick={handleProductClick}
                    />
                    {isHovering && index === selectedImage && (
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
                  </Card>
                </div>
              ))}
            </div>
            <ImageIndicator />
          </div>

          <button
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full p-2 shadow-md hover:bg-white z-20"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full p-2 shadow-md hover:bg-white text-white hover:text-black  z-20"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="h-5 w-5 " />
          </button>

          {isHovering && (
            <div
              ref={zoomResultRef}
              className="absolute top-0 left-full ml-4 w-96 h-96 border rounded-lg overflow-hidden bg-white dark:bg-neutral-900 shadow-lg z-30 transition-opacity duration-200"
            >
              <div
                className="absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url(${images[selectedImage] || placeholder})`,
                  backgroundSize: `${zoomLevel * 100}%`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

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
