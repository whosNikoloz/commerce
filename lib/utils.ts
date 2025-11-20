import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "GEL"): string {
  return new Intl.NumberFormat("ka-GE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Resolves image URLs to absolute paths
 * Converts relative /assets/ paths to full backend URLs
 */
export function resolveImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/placeholder.png";

  // If already an absolute URL (http/https), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a local path (starts with /), check if it's an asset from backend
  if (imagePath.startsWith("/assets/")) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

    return `${baseUrl}${imagePath}`;
  }

  // Otherwise return as is (likely a local Next.js public asset)
  return imagePath;
}
