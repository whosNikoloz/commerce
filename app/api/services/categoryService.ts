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
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function createCategory(data: CategoryModel): Promise<string> {
  return apiFetch<string>(`${API_BASE}/add-category`, {
    method: "POST",
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function deleteCategory(id: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-category-by-${id}`, {
    method: "PUT",
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function deleteImage(id: string, key: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-image-${key}-by-category-${id}`, {
    method: "DELETE",
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function uploadCategoryImages(
  categoryId: string,
  files: File[],
  coverIndex?: number
): Promise<string[]> {
  if (!categoryId) throw new Error("category is required");
  if (!files || files.length === 0) throw new Error("at least one file is required");

  const formData = new FormData();
  formData.append("id", categoryId);
  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  if (coverIndex !== undefined && coverIndex >= 0) {
    formData.append("coverIndex", coverIndex.toString());
  }

  return apiFetch<string[]>(`${API_BASE}/images`, {
    method: "POST",
    body: formData,
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}

export async function setCoverImage(
  categoryId: string,
  position: number
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `${API_BASE}/${categoryId}/set-cover-image/${position}`,
    {
      method: "PUT",
      requireAuth: true,
      failIfUnauthenticated: true,
    }
  );
}

export async function getAllImagesForCategory(categoryId: string): Promise<string[]> {
  return apiFetch(`${API_BASE}/get-all-images-by-category-${categoryId}`);
}
