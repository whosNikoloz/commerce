import { BrandModel } from "./brand";
import { CategoryModel } from "./category";
import { StockStatus, Condition } from "./enums";
import { ProductFacetValueModel, ProductFacetValueResponseModel } from "./facet";

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