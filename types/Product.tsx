export interface Product {
  id: number;
  brand: string;
  name: string;
  name_ka: string;
  headline: string;
  headline_ka: string;
  headlineAlt: string;
  shortDescription: string;
  shortDescription_ka: string;
  metaDescription: string;
  metaDescription_ka: string;
  startPrice: number;
  price: number;
  inStock: number;
  images: ProductImage[];
  descriptions: ProductDescription[];
  specificationGroups: ProductSpecificationGroup[];
  badges: ProductBadge[];
}

export interface ProductImage {
  fullSize: string;
  medium: string;
  thumbnail: string;
}

export interface ProductDescription {
  title: string;
  title_ka: string;
  descriptionHtml: string;
  descriptionHtml_ka: string;
}

export interface ProductSpecificationGroup {
  headline: string;
  headline_ka: string;
  specifications: ProductSpecification[];
}

export interface ProductSpecification {
  key: string;
  key_ka: string;
  value: string;
  value_ka: string;
}

export interface ProductBadge {
  headline: string;
  icon: string;
  type: {
    id: number;
    headline: string;
  };
}

export interface Category {
  id: number;
  name: string;
  name_ka: string;
  slug: string;
  parentCategoryId?: number;
}
