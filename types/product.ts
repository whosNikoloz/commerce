import { BrandModel } from "./brand";
import { CategoryModel } from "./category";
import { StockStatus, Condition } from "./enums";
import { ProductFacetValueModel, ProductFacetValueResponseModel } from "./facet";

import { getCategoryById } from "@/app/api/services/categoryService";
import { getBrandById } from "@/app/api/services/brandService";

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
