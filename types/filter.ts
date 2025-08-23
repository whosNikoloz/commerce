import { Condition, StockStatus } from "./enums";
import { FacetFilterModel } from "./facet";

export interface FilterModel {
  brandIds?: string[];
  categoryIds?: string[];
  condition?: Condition[];
  stockStatus?: StockStatus;
  minPrice?: number;
  maxPrice?: number;
  facetFilters?: FacetFilterModel[];
}
