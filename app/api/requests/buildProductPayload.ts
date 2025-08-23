import { ProductRequestModel } from "@/types/product";

export function buildProductPayload(formData: any): ProductRequestModel {
  return {
    name: formData.name.trim(),
    price: Number(formData.price),
    discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
    description: formData.description?.trim() || undefined,
    brandId: formData.brand?.id || formData.brandId,
    categoryId: formData.category?.id || formData.categoryId,
    isActive: !!formData.isActive,
    isComingSoon: !!formData.isComingSoon,
    isLiquidated: !!formData.isLiquidated,
    isNewArrival: !!formData.isNewArrival,
    images: formData.images?.filter((img: string) => !!img),
    productFacetValues: (formData.facets || []).map((f: any) => ({
      facetId: f.facetId,
      value: f.value,
    })),
    id: "",
    status: 0,
    condition: 0,
  };
}
