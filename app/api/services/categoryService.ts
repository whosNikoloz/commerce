import { apiFetch } from "../client/fetcher";
import { ProductResponseModel, ProductRequestModel } from "@/types/product";
import { FilterModel } from "@/types/filter";
import { PagedList } from "@/types/pagination";
import { CategoryModel } from "@/types/category";

const API_BASE = "http://localhost:5007/Category";

export async function getAllCategories(): Promise<CategoryModel[]> {
    return apiFetch<CategoryModel[]>(`${API_BASE}/get-all-categories`);
}

export async function getCategoryById(id: string): Promise<CategoryModel> {
    return apiFetch<CategoryModel>(`${API_BASE}/get-category-by-${id}`);
}

export async function getCategoryWithSubCategoriesById(id: string): Promise<CategoryModel> {
    return apiFetch<CategoryModel>(`${API_BASE}/get-category-with-subcategories?id=${id}`);
}

export async function updateCategory(data: CategoryModel): Promise<string> {
    return apiFetch<string>(`${API_BASE}/update-category`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}


// export async function getProductsByCategory(id: string): Promise<ProductResponseModel[]> {
//     return apiFetch<ProductResponseModel[]>(`${API_BASE}/get-products-by-category?id=${id}`);
// }

// export async function searchProducts(
//     searchTerm: string = "",
//     sortColumn: string = "name",
//     sortOrder: string = "asc",
//     page: number = 1,
//     pageSize: number = 10
// ): Promise<PagedList<ProductResponseModel>> {
//     const params = new URLSearchParams({
//         searchTerm,
//         sortColumn,
//         sortOrder,
//         page: page.toString(),
//         pageSize: pageSize.toString(),
//     });

//     return apiFetch<PagedList<ProductResponseModel>>(`${API_BASE}/get-product-by-searching?${params.toString()}`);
// }

// export async function filterProducts(
//     filter: FilterModel,
//     page: number = 1,
//     pageSize: number = 10
// ): Promise<PagedList<ProductResponseModel>> {
//     return apiFetch<PagedList<ProductResponseModel>>(`${API_BASE}/get-products-by-filtering?page=${page}&pageSize=${pageSize}`, {
//         method: "POST",
//         body: JSON.stringify(filter),
//     });
// }

// export async function createProduct(data: ProductRequestModel): Promise<string> {
//     return apiFetch<string>(`${API_BASE}/add-product`, {
//         method: "POST",
//         body: JSON.stringify(data),
//     });
// }

// export async function updateProduct(data: ProductRequestModel): Promise<string> {
//     return apiFetch<string>(`${API_BASE}/update-product`, {
//         method: "PUT",
//         body: JSON.stringify(data),
//     });
// }

// export async function deleteProduct(data: ProductRequestModel): Promise<string> {
//     return apiFetch<string>(`${API_BASE}/delete-product`, {
//         method: "PUT",
//         body: JSON.stringify(data),
//     });
// }

// export async function deleteProductById(id: string): Promise<string> {
//     return apiFetch<string>(`${API_BASE}/delete-product-by-${id}`, {
//         method: "PUT",
//     });
// }

// export async function deleteImage(id: string, key: string): Promise<string> {
//     return apiFetch<string>(`${API_BASE}/delete-image-${key}-by-product-${id}`, {
//         method: "DELETE",
//     });
// }
