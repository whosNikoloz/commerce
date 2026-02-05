import { FacetModel } from "./facet";

export interface CategoryImageModel {
  id: string;
  categoryId: string;
  imagePath: string;
  isCover: boolean;
  displayOrder: number;
}

export interface CategoryModel {
  id: string;
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  images?: string[];
  facets: FacetModel[];
}

export function getCategoryCoverImageUrl(images: string[] | undefined): string | undefined {
  if (!images || images.length === 0) return undefined;
  return images[0];
}
