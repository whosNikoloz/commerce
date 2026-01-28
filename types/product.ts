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
  images?: string[];
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
    return JSON.parse(json) as ProductRailSectionData[];
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
