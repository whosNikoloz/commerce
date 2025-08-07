import { apiFetch } from "../client/fetcher";
import { BrandModel } from "@/types/brand";

const API_BASE = "https://localhost:7204/Brand";

export async function getAllBrands(): Promise<BrandModel[]> {
    return apiFetch<BrandModel[]>(`${API_BASE}/get-all-brands`);
}

export async function getBrandById(id: string): Promise<BrandModel> {
    return apiFetch<BrandModel>(`${API_BASE}/get-brand-by-${id}`);
}



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
