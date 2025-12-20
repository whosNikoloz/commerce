import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "GEL"): string {
  // Use a deterministic formatter to avoid hydration mismatches
  // Format: "GEL 2,799.00" or "2,799.00 ₾"
  const formatted = price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Use currency symbol based on currency code
  const currencySymbols: Record<string, string> = {
    "GEL": "₾",
    "USD": "$",
    "EUR": "€",
  };

  const symbol = currencySymbols[currency] || currency;

  // Georgian currency (₾) goes after, others before
  if (currency === "GEL") {
    return `${formatted} ${symbol}`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Checks if a URL is from S3 storage
 * Returns true for amazonaws.com URLs to prevent server-side optimization
 */
export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false;

  // Check for S3 patterns:
  // - bucket.s3.region.amazonaws.com
  // - s3.region.amazonaws.com/bucket
  // - *.amazonaws.com (catch-all)
  return url.includes('.amazonaws.com') || url.includes('.s3.');
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
