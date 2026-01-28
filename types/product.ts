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
  // Special filters that use current product's data
  useCurrentProductCategory?: boolean;
  useCurrentProductBrand?: boolean;
}

export interface ProductRailSectionData {
  id: string;
  customName?: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  layout: "carousel" | "grid";
  columns?: 2 | 3 | 4 | 5 | 6;
  limit: number;
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
  productRailSections?: ProductRailSectionData[];
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
  productRailSections?: ProductRailSectionData[];
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
