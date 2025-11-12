import { apiFetch } from "../client/fetcher";

import { BrandModel } from "@/types/brand";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "Brand";

export async function getAllBrands(): Promise<BrandModel[]> {
  return apiFetch<BrandModel[]>(`${API_BASE}/get-all-brands`);
}

export async function getBrandById(id: string): Promise<BrandModel> {
  return apiFetch<BrandModel>(`${API_BASE}/get-brand-by-${id}`);
}

export async function updateBrand(brand: BrandModel): Promise<string> {
  return apiFetch<string>(`${API_BASE}/update-brand`, {
    method: "PUT",
    body: JSON.stringify(brand), requireAuth: true , failIfUnauthenticated : true 
  });
}

export async function createBrand(
  name: string,
  origin: string,
  description: string,
  images: string[]
): Promise<string> {
  const data = { name, origin, description, images };

  return apiFetch<string>(`${API_BASE}/add-brand`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    requireAuth: true,
    failIfUnauthenticated: true,
  });
}


export async function deleteBrand(id: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-brand-by-${id}`, {
    method: "PUT", requireAuth: true , failIfUnauthenticated : true 
  });
}


export async function deleteImage(id: string, key: string): Promise<string> {
  return apiFetch<string>(`${API_BASE}/delete-image-${key}-by-product-${id}`, {
    method: "DELETE", requireAuth: true , failIfUnauthenticated : true 
  });
}
export async function uploadBrandImages(brandId: string, files: File[]): Promise<string[]> {
  if (!brandId) throw new Error("brand is required");
  if (!files || files.length === 0) throw new Error("at least one file is required");

  const formData = new FormData();

  formData.append("id", brandId);

  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return apiFetch<string[]>(`${API_BASE}/images`, {
    method: "POST",
    body: formData, requireAuth: true , failIfUnauthenticated : true 
  });
}