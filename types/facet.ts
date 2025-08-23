import { FacetTypeEnum } from "./enums";

export interface ProductFacetValueResponseModel {
  facetName?: string;
  facetValue?: string;
}

export interface FacetFilterModel {
  facetValueId: string;
}

export interface FacetValueModel {
  id?: string;
  value?: string;
  parentId?: string;
}

export interface FacetModel {
  id: string;
  name?: string;
  displayType: FacetTypeEnum;
  isCustom: boolean;
  categoryIds?: string[];
  facetValues?: FacetValueModel[];
}

export interface ProductFacetValueModel {
  id: string;
  facetValueId: string;
}
