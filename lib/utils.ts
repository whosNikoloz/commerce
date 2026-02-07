import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "₾"): string {
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
  if (currency === "GEL" || currency === "₾") {
    return `${formatted} ₾`;
  }

  return `${symbol}${formatted}`;
}

export function currencyFmt(amount: number, currency: string = "GEL") {
  try {
    return new Intl.NumberFormat("ka-GE", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ₾`;
  }
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

/**
 * Strips inline color styles from HTML content for proper dark/light mode support.
 * This removes color and background-color from inline styles so CSS can handle theming.
 */
export function stripInlineColors(html: string): string {
  if (!html) return "";

  // Remove color: and background-color: from style attributes
  // This regex matches style attributes and removes color-related properties
  return html
    // Remove color property (handles color:#xxx, color: #xxx, color:rgb(...), etc.)
    .replace(/\bcolor\s*:\s*[^;}"']+;?/gi, "")
    // Remove background-color property
    .replace(/\bbackground-color\s*:\s*[^;}"']+;?/gi, "")
    // Clean up empty style attributes
    .replace(/style\s*=\s*["']\s*["']/gi, "")
    // Clean up style attributes with only whitespace/semicolons
    .replace(/style\s*=\s*["']\s*;?\s*["']/gi, "");
}
