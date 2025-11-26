import { apiFetch } from "../client/fetcher";

import { CategoryModel } from "@/types/category";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "Category";

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
    body: JSON.stringify(data), requireAuth: true , failIfUnauthenticated : true 
  });
}

export async function createCategory(data: CategoryModel): Promise<string> {
  return apiFetch<string>(`${API_BASE}/add-category`, {
    method: "POST",
    body: JSON.stringify(data), requireAuth: true , failIfUnauthenticated : true 
  });
}

export async function deleteCategory(id: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-category-by-${id}`, {
    method: "DELETE", requireAuth: true , failIfUnauthenticated : true 
  });
}

export async function deleteImage(id: string, key: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-image-${key}-by-category-${id}`, {
    method: "DELETE", requireAuth: true , failIfUnauthenticated : true 
  });
}
export async function uploadCategoryImages(categoryid: string, files: File[]): Promise<string[]> {
  if (!categoryid) throw new Error("category is required");
  if (!files || files.length === 0) throw new Error("at least one file is required");

  const formData = new FormData();

  formData.append("id", categoryid);

  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return apiFetch<string[]>(`${API_BASE}/images`, {
    method: "POST",
    body: formData, requireAuth: true , failIfUnauthenticated : true 
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
