import { apiFetch } from "../client/fetcher";

import { ProductResponseModel, ProductRequestModel } from "@/types/product";
import { FilterModel } from "@/types/filter";
import { PagedList } from "@/types/pagination";
import { FinaProductRestArrayModel, FinaProductRestModel } from "@/types/product-rest";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "Product";
const API_Fina_BASE = process.env.NEXT_PUBLIC_API_URL + "FinaProductRest";


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
  return apiFetch<ProductResponseModel[]>(`${API_BASE}/get-all-products`);
}

export async function getProductById(id: string): Promise<ProductResponseModel> {
  return apiFetch<ProductResponseModel>(`${API_BASE}/get-products-by-${id}`);
}

export async function getProductsByCategory(id: string): Promise<ProductRequestModel[]> {
  return apiFetch<ProductRequestModel[]>(`${API_BASE}/get-products-by-category?id=${id}`);
}

export async function getProductRestsByIds(data: FinaProductRestArrayModel): Promise<FinaProductRestModel> {
  return apiFetch<FinaProductRestModel>(`${API_Fina_BASE}`, {
    method: "POST",
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
    `${API_BASE}/get-product-by-searching?${params.toString()}`,
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
    `${API_BASE}/get-products-by-filtering?${qs.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(params.filter),
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function createProduct(data: ProductRequestModel): Promise<string> {
  return apiFetch<string>(`${API_BASE}/add-product`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(data: ProductRequestModel): Promise<string> {
  return apiFetch<string>(`${API_BASE}/update-product`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(data: ProductRequestModel): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-product`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProductById(id: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-product-by-${id}`, {
    method: "PUT",
  });
}

export async function deleteImage(id: string, key: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-image-${key}-by-product-${id}`, {
    method: "DELETE",
  });
}
