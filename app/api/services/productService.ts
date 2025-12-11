import { apiFetch } from "../client/fetcher";

import { ProductResponseModel, ProductRequestModel } from "@/types/product";
import { FilterModel } from "@/types/filter";
import { PagedList } from "@/types/pagination";
import { FinaProductRestArrayModel, FinaProductRestResponse } from "@/types/product-rest";

const PRODUCT_API_BASE = process.env.NEXT_PUBLIC_API_URL + "Product";
const API_Fina_BASE = process.env.NEXT_PUBLIC_API_URL + "api/FinaProductRest";

export function mapSort(sortBy: string): {
  sortColumn: string;
  sortOrder: "asc" | "desc";
} {
  switch (sortBy) {
    case "price-low":
      return { sortColumn: "price", sortOrder: "asc" };
    case "price-high":
      return { sortColumn: "price", sortOrder: "desc" };
    case "newest":
      return { sortColumn: "date", sortOrder: "desc" };
    case "rating":
      return { sortColumn: "date", sortOrder: "desc" };
    case "name":
      return { sortColumn: "name", sortOrder: "asc" };
    case "featured":
    default:
      return { sortColumn: "name", sortOrder: "asc" };
  }
}

export async function getAllProducts(): Promise<ProductResponseModel[]> {
  return apiFetch<ProductResponseModel[]>(`${PRODUCT_API_BASE}/get-all-products`);
}

export async function getProductById(
  id: string,
  currentProductId?: string,
  targetFacetValueId?: string
): Promise<ProductResponseModel> {
  const params = new URLSearchParams();

  if (currentProductId) params.append('CurrentProductId', currentProductId);
  if (targetFacetValueId) params.append('TargetFacetValueId', targetFacetValueId);

  const queryString = params.toString();
  const url = queryString
    ? `${PRODUCT_API_BASE}/get-products-by-${id}?${queryString}`
    : `${PRODUCT_API_BASE}/get-products-by-${id}`;

  return apiFetch<ProductResponseModel>(url);
}

export async function getProductsByCategory(id: string): Promise<ProductRequestModel[]> {
  return apiFetch<ProductRequestModel[]>(`${PRODUCT_API_BASE}/get-products-by-category?id=${id}`);
}

export async function getProductRestsByIds(
  data: FinaProductRestArrayModel
): Promise<FinaProductRestResponse> {
  return apiFetch<FinaProductRestResponse>(`${API_Fina_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function searchProducts(
  searchTerm: string = "",
  sortColumn: string = "name",
  sortOrder: string = "asc",
  page: number = 1,
  pageSize: number = 10,
): Promise<PagedList<ProductResponseModel>> {
  const params = new URLSearchParams({
    searchTerm,
    sortColumn,
    sortOrder,
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  return apiFetch<PagedList<ProductResponseModel>>(
    `${PRODUCT_API_BASE}/get-product-by-searching?${params.toString()}`,
  );
}

export function isFilterEmpty(f: FilterModel): boolean {
  return (
    !f ||
    ((f.brandIds?.length ?? 0) === 0 &&
      (f.categoryIds?.length ?? 0) === 0 &&
      (f.condition?.length ?? 0) === 0 &&
      f.stockStatus === undefined &&
      f.minPrice === undefined &&
      f.maxPrice === undefined &&
      (f.facetFilters?.length ?? 0) === 0)
  );
}

export async function searchProductsByFilter(params: {
  filter: FilterModel;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}): Promise<PagedList<ProductResponseModel>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 24;
  const { sortColumn, sortOrder } = mapSort(params.sortBy ?? "featured");

  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortColumn,
    sortOrder,
  });

  return apiFetch<PagedList<ProductResponseModel>>(
    `${PRODUCT_API_BASE}/get-products-by-filtering?${qs.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(params.filter),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function createProduct(data: ProductRequestModel): Promise<string> {
  return apiFetch<string>(`${PRODUCT_API_BASE}/add-product`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(data: ProductRequestModel): Promise<string> {
  return apiFetch<string>(`${PRODUCT_API_BASE}/update-product`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(data: ProductRequestModel): Promise<string> {
  return apiFetch<string>(`${PRODUCT_API_BASE}/delete-product`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProductById(id: string): Promise<string> {
  return apiFetch<string>(`${PRODUCT_API_BASE}/delete-product-by-${id}`, {
    method: "PUT",
  });
}

export async function deleteImage(id: string, key: string): Promise<string> {
  return apiFetch<string>(`${PRODUCT_API_BASE}/delete-image-${key}-by-product-${id}`, {
    method: "DELETE",
  });
}
export async function uploadProductImages(productId: string, files: File[]): Promise<string[]> {
  if (!productId) throw new Error("productId is required");
  if (!files || files.length === 0) throw new Error("at least one file is required");

  const formData = new FormData();

  formData.append("id", productId);

  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return apiFetch<string[]>(`${PRODUCT_API_BASE}/images`, {
    method: "POST",
    body: formData,
    requireAuth: true , failIfUnauthenticated : true 
  });
}
