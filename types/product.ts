import { BrandModel } from "./brand";
import { CategoryModel } from "./category";
import { StockStatus, Condition } from "./enums";
import { ProductFacetValueModel, ProductFacetValueResponseModel } from "./facet";

import { getCategoryById } from "@/app/api/services/categoryService";
import { getBrandById } from "@/app/api/services/brandService";

// Localized text for multi-language support
export type LocalizedText = Record<string, string> & {
  en: string;
  ka?: string;
};

// Product Rail Section configuration for product detail page
export interface ProductRailSectionFilterBy {
  categoryIds?: string[];
  brandIds?: string[];
  isNewArrival?: boolean;
  isLiquidated?: boolean;
  isComingSoon?: boolean;
  hasDiscount?: boolean;
  minPrice?: number;
  maxPrice?: number;
  isRandom?: boolean;
  productCount?: number;
  condition?: number[];
  stockStatus?: number;
  // Special filters that use current product's data
  useCurrentProductCategory?: boolean;
  useCurrentProductBrand?: boolean;
  productIds?: string[];
}

export interface ProductRailSectionData {
  id: string;
  customName?: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  layout: "carousel" | "grid";
  columns?: 2 | 3 | 4 | 5 | 6;
  viewAllHref?: string;
  enabled: boolean;
  order: number;
  filterBy?: ProductRailSectionFilterBy;
  sortBy?: "featured" | "newest" | "price-low" | "price-high" | "rating" | "name";
}

export interface ProductResponseModel {
  id: string;
  name?: string;
  price: number;
  discountPrice?: number;
  status: StockStatus;
  condition: Condition;
  description?: string;
  images?: ProductImageModel[];
  brand: BrandModel;
  category: CategoryModel;
  isActive?: boolean;
  isLiquidated?: boolean;
  isComingSoon?: boolean;
  isNewArrival?: boolean;
  productFacetValues: ProductFacetValueResponseModel[];
  productGroupId?: string;
  productAdditionalJson?: string; // JSON string containing ProductRailSectionData[]
  stockQuantity?: number; // Current stock quantity (if available from server)
}

export interface ProductRequestModel {
  id: string;
  name?: string;
  price: number;
  discountPrice?: number;
  status: StockStatus;
  condition: Condition;
  description?: string;
  images?: string[];
  brandId: string;
  categoryId: string;
  isActive?: boolean;
  isLiquidated?: boolean;
  isComingSoon?: boolean;
  isNewArrival?: boolean;
  productFacetValues: ProductFacetValueModel[];
  productGroupId?: string;
  productAdditionalJson?: string; // JSON string containing ProductRailSectionData[]
  // Stock integration fields
  initialStock?: number; // Used when creating a product
  stockQuantity?: number; // Used when updating a product
}

// Helper functions to work with productAdditionalJson
export function parseProductRailSections(json?: string): ProductRailSectionData[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);

    // Ensure we only accept valid array data; treat anything else (e.g. "{}", "null") as empty
    if (Array.isArray(parsed)) {
      return parsed as ProductRailSectionData[];
    }

    return [];
  } catch {
    return [];
  }
}

export function stringifyProductRailSections(sections: ProductRailSectionData[]): string {
  return JSON.stringify(sections);
}

// Product Image model with cover support
export interface ProductImageModel {
  id: string;
  productId: string;
  imagePath: string;
  isCover: boolean;
  displayOrder: number;
}

// Helper functions to work with product images
// These functions handle both the new ProductImageModel[] format and legacy string[] format

type ImageInput = ProductImageModel[] | string[] | undefined;

/**
 * Check if the input is the new ProductImageModel[] format
 */
function isProductImageModelArray(images: ImageInput): images is ProductImageModel[] {
  if (!images || images.length === 0) return false;
  const first = images[0];

  return typeof first === 'object' && first !== null && 'imagePath' in first;
}

/**
 * Get sorted image URLs from ProductImageModel array or string array
 * @param images - Array of ProductImageModel, string array, or undefined
 * @returns Array of image URLs sorted by displayOrder (cover image first if no displayOrder)
 */
export function getProductImageUrls(images: ImageInput): string[] {
  if (!images || images.length === 0) return [];

  // Handle legacy string[] format
  if (!isProductImageModelArray(images)) {
    return images.filter(img => typeof img === 'string' && img.trim());
  }

  // Handle new ProductImageModel[] format
  const sorted = [...images].sort((a, b) => {
    // If displayOrder is set, use it
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    // Otherwise, cover image comes first
    if (a.isCover && !b.isCover) return -1;
    if (!a.isCover && b.isCover) return 1;

    return 0;
  });

  return sorted.map(img => img.imagePath);
}

/**
 * Get the cover image URL from ProductImageModel array or string array
 * @param images - Array of ProductImageModel, string array, or undefined
 * @returns Cover image URL or first image URL, or undefined if no images
 */
export function getCoverImageUrl(images: ImageInput): string | undefined {
  if (!images || images.length === 0) return undefined;

  // Handle legacy string[] format
  if (!isProductImageModelArray(images)) {
    const first = images.find(img => typeof img === 'string' && img.trim());

    return first as string | undefined;
  }

  // Handle new ProductImageModel[] format
  const cover = images.find(img => img.isCover);

  if (cover) return cover.imagePath;

  // Fallback to first image by displayOrder
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  return sorted[0]?.imagePath;
}

export async function mapProducts(
  products: ProductRequestModel[],
): Promise<ProductResponseModel[]> {
  // You can optimize this by caching brand/category lookups
  const mapped = await Promise.all(
    products.map(async (p) => {
      const brand = await getBrandById(p.brandId);
      const category = await getCategoryById(p.categoryId);

      return {
        ...p,
        brand: brand!,
        category: category!,
        productFacetValues: p.productFacetValues.map((f) => ({
          ...f,
        })),
      } as ProductResponseModel;
    }),
  );

  return mapped;
}
