import { FacetModel } from "./facet";

export interface CategoryModel {
    id: string;
    name?: string;
    description?: string;
    parentId?: string;
    facets: FacetModel[];
}
