"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
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

export interface ImageReviewHandle {
  getCurrentImageElement: () => HTMLImageElement | null;
  scrollToTop: () => void;
}

export const ImageReview = forwardRef<ImageReviewHandle, ImageReviewProps>(({ images, productName }, ref) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState({ width: 100, height: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const currentImageRef = useRef<HTMLImageElement>(null);
  const zoomResultRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useImperativeHandle(ref, () => ({
    getCurrentImageElement: () => currentImageRef.current,
    scrollToTop: () => {
      imageContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

  const zoomLevel = 3;
  const placeholder = "/placeholder.png"; // make sure it exists in /public

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

  // Reset to first image when images change (e.g., when switching product variants)
  useEffect(() => {
    setSelectedImage(0);
  }, [images]);

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
            <p className="font-primary text-gray-500">No images available</p>
          </div>
        </Card>
      </div>
    );
  }

  const ImageIndicator = () => (
    <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full z-20 backdrop-blur-sm">
      {selectedImage + 1} / {images.length}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center px-2">
          <div className="relative w-full max-w-[400px]">
            <div ref={emblaRef} className="w-full overflow-hidden rounded-lg">
              <div className="flex">
                {images.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%]">
                    <Card
                      ref={index === selectedImage ? imageContainerRef : null}
                      className="relative rounded-lg overflow-hidden aspect-square cursor-pointer bg-white dark:bg-neutral-900"
                    >
                      <Image
                        ref={index === selectedImage ? currentImageRef as any : null}
                        fill
                        alt={`${productName} view ${index + 1}`}
                        className="object-contain p-4"
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        src={image || placeholder}
                        onClick={handleProductClick}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Image indicator - on the image */}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full z-20 backdrop-blur-sm">
              {selectedImage + 1} / {images.length}
            </div>

            {/* Navigation buttons - on the image */}
            <button
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full shadow-lg z-20 transition-all h-10 w-10 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full shadow-lg z-20 transition-all h-10 w-10 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Thumbnail list */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 px-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                aria-label={`View image ${index + 1}`}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  selectedImage === index
                    ? "border-primary ring-2 ring-primary/30 shadow-md"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => {
                  setSelectedImage(index);
                  if (emblaApi) emblaApi.scrollTo(index);
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    fill
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover"
                    sizes="64px"
                    src={image || placeholder}
                  />
                </div>
              </button>
            ))}
          </div>
        )}

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
        <div className="w-24 h-[350px] md:h-[380px] lg:h-[380px] xl:h-[450px] 2xl:h-[480px] flex-shrink-0">
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
                aria-label={`View image ${index + 1} of ${images.length}`}
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
                    loading="lazy"
                    sizes="96px"
                    src={image || placeholder}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1">
          <div ref={emblaRef} className="overflow-hidden h-[350px] md:h-[380px] lg:h-[380px] xl:h-[450px] 2xl:h-[480px]">
            <div className="flex gap-4 h-full">
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] h-full">
                  <Card
                    ref={index === selectedImage ? imageContainerRef : null}
                    className="relative rounded-lg overflow-hidden h-full cursor-crosshair"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    <Image
                      ref={index === selectedImage ? currentImageRef as any : null}
                      fill
                      alt={`${productName} view ${index + 1}`}
                      className="object-contain"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                      sizes="(min-width: 1024px) 600px, 100vw"
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

          <button
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full shadow-md hover:bg-white z-20 h-12 w-12 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 rounded-full shadow-md hover:bg-white text-white hover:text-black  z-20 h-12 w-12 flex items-center justify-center"
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
});

ImageReview.displayName = "ImageReview";
