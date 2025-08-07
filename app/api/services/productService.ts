import { apiFetch } from "../client/fetcher";
import { ProductResponseModel, ProductRequestModel } from "@/types/product";
import { FilterModel } from "@/types/filter";
import { PagedList } from "@/types/pagination";

const API_BASE = "https://localhost:7204/Product";

export async function getAllProducts(): Promise<ProductResponseModel[]> {
    return apiFetch<ProductResponseModel[]>(`${API_BASE}/get-all-products`);
}

export async function getProductById(id: string): Promise<ProductResponseModel> {
    return apiFetch<ProductResponseModel>(`${API_BASE}/get-products-by-${id}`);
}

export async function getProductsByCategory(id: string): Promise<ProductResponseModel[]> {
    return apiFetch<ProductResponseModel[]>(`${API_BASE}/get-products-by-category?id=${id}`);
}

export async function searchProducts(
    searchTerm: string = "",
    sortColumn: string = "name",
    sortOrder: string = "asc",
    page: number = 1,
    pageSize: number = 10
): Promise<PagedList<ProductResponseModel>> {
    const params = new URLSearchParams({
        searchTerm,
        sortColumn,
        sortOrder,
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    return apiFetch<PagedList<ProductResponseModel>>(`${API_BASE}/get-product-by-searching?${params.toString()}`);
}

export async function filterProducts(
    filter: FilterModel,
    page: number = 1,
    pageSize: number = 10
): Promise<PagedList<ProductResponseModel>> {
    return apiFetch<PagedList<ProductResponseModel>>(`${API_BASE}/get-products-by-filtering?page=${page}&pageSize=${pageSize}`, {
        method: "POST",
        body: JSON.stringify(filter),
    });
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
