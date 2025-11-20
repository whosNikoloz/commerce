"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  aspectRatio?: number; // e.g., 1 for square, 4/3 for standard product, 16/9 for wide
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: "contain" | "cover"; // cover fills the box, contain shows full image
  priority?: boolean;
  sizes?: string;
}

/**
 * ProductImage component handles image display with consistent aspect ratios
 * and proper fallback for missing images.
 *
 * Usage:
 * - For product cards: <ProductImage src={image} alt={name} aspectRatio={1} objectFit="cover" />
 * - For product detail: <ProductImage src={image} alt={name} aspectRatio={4/3} objectFit="contain" />
 * - For banners: <ProductImage src={image} alt={name} aspectRatio={16/9} objectFit="cover" />
 */
export function ProductImage({
  src,
  alt,
  aspectRatio = 1,
  fill = true,
  width,
  height,
  className = "",
  objectFit = "cover",
  priority = false,
  sizes,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = src && !imageError;

  // Base container classes with aspect ratio
  const containerClasses = `relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`;

  // Image object-fit classes
  const imageClasses = objectFit === "cover"
    ? "object-cover"
    : "object-contain";

  // Render placeholder if no image
  if (!hasValidImage) {
    return (
      <div className={containerClasses} style={{ aspectRatio }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="h-12 w-12 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} style={{ aspectRatio }}>
      {fill ? (
        <Image
          fill
          alt={alt}
          className={imageClasses}
          priority={priority}
          sizes={sizes}
          src={src}
          onError={() => setImageError(true)}
        />
      ) : (
        <Image
          alt={alt}
          className={imageClasses}
          height={height || 400}
          priority={priority}
          src={src}
          width={width || 400}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

/**
 * Preset components for common use cases
 */

// Square product thumbnail (e.g., in lists, grids)
export function ProductThumbnail({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <ProductImage
      alt={alt}
      aspectRatio={1}
      className={className}
      objectFit="cover"
      src={src}
    />
  );
}

// Standard product card image (4:3 ratio)
export function ProductCardImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <ProductImage
      alt={alt}
      aspectRatio={4 / 3}
      className={className}
      objectFit="cover"
      src={src}
    />
  );
}

// Product detail main image (contains full image)
export function ProductDetailImage({
  src,
  alt,
  className,
  priority = true,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <ProductImage
      alt={alt}
      aspectRatio={1}
      className={className}
      objectFit="contain"
      priority={priority}
      src={src}
    />
  );
}

// Wide banner image (16:9 ratio)
export function BannerImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <ProductImage
      alt={alt}
      aspectRatio={16 / 9}
      className={className}
      objectFit="cover"
      src={src}
    />
  );
}
