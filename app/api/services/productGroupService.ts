import { apiFetch } from "../client/fetcher";

import { ProductResponseModel } from "@/types/product";

const PRODUCT_GROUP_API_BASE = process.env.NEXT_PUBLIC_API_URL + "ProductGroup";

export interface ProductGroupModel {
  id: string;
  name: string;
  brandId?: string | null;
  categoryId?: string | null;
  productIds?: string[];
  productCount?: number;
}

export interface ProductGroupWithProducts extends ProductGroupModel {
  products?: ProductResponseModel[];
}

export async function getAllProductGroups(
  categoryId?: string,
  brandId?: string
): Promise<ProductGroupModel[]> {
  const params = new URLSearchParams();

  if (categoryId) params.append("categoryId", categoryId);
  if (brandId) params.append("brandId", brandId);

  const queryString = params.toString();
  const url = queryString
    ? `${PRODUCT_GROUP_API_BASE}/get-all-product-groups?${queryString}`
    : `${PRODUCT_GROUP_API_BASE}/get-all-product-groups`;

  return apiFetch<ProductGroupModel[]>(url);
}

export async function getProductGroupById(id: string): Promise<ProductGroupModel> {
  return apiFetch<ProductGroupModel>(`${PRODUCT_GROUP_API_BASE}/get-product-group-by-${id}`);
}

export async function getProductGroupWithProducts(productGroupId: string): Promise<ProductGroupWithProducts> {
  return apiFetch<ProductGroupWithProducts>(
    `${PRODUCT_GROUP_API_BASE}/get-product-group-with-products-${productGroupId}`,
  );
}

export interface CreateProductGroupModel {
  name: string;
  categoryId?: string;
  brandId?: string;
}

export interface UpdateProductGroupModel extends CreateProductGroupModel {
  id: string;
}

export async function createProductGroup(group: CreateProductGroupModel): Promise<string> {
  return apiFetch<string>(`${PRODUCT_GROUP_API_BASE}/create-product-group`, {
    method: "POST",
    body: JSON.stringify(group),
    headers: { "Content-Type": "application/json" },
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function updateProductGroup(group: UpdateProductGroupModel): Promise<string> {
  return apiFetch<string>(`${PRODUCT_GROUP_API_BASE}/update-product-group`, {
    method: "PUT",
    body: JSON.stringify(group),
    headers: { "Content-Type": "application/json" },
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function deleteProductGroup(id: string): Promise<string> {
  return apiFetch<string>(`${PRODUCT_GROUP_API_BASE}/delete-product-group-${id}`, {
    method: "DELETE",
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function addProductsToGroup(productGroupId: string, productIds: string[]): Promise<string> {
  if (productIds.length === 0) return "No products to add";

  return apiFetch<string>(`${PRODUCT_GROUP_API_BASE}/add-products-to-group`, {
    method: "POST",
    body: JSON.stringify({ productGroupId, productIds }),
    headers: { "Content-Type": "application/json" },
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function removeProductsFromGroup(productIds: string[], productGroupId?: string): Promise<string> {
  if (productIds.length === 0) return "No products to remove";

  return apiFetch<string>(`${PRODUCT_GROUP_API_BASE}/remove-products-from-group`, {
    method: "POST",
    body: JSON.stringify({ productGroupId, productIds }),
    headers: { "Content-Type": "application/json" },
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function getProductVariants(productGroupId: string): Promise<ProductResponseModel[]> {
  return apiFetch<ProductResponseModel[]>(`${PRODUCT_GROUP_API_BASE}/${productGroupId}/variants`);
}
