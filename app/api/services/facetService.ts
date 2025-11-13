import { apiFetch } from "../client/fetcher";

import {
  FacetModel,
  FacetValueModel,
} from "@/types/facet"; 

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "Facet";

export interface CreateFacetRequest {
  name?: string;
  displayType: number;
  isCustom: boolean;
  categoryId: string;
  facetValues?: Array<Pick<FacetValueModel, "id" | "value" | "parentId">>;
}

type OkString = string;


export async function getAllFacets(categoryId: string) {
  return apiFetch<FacetModel[]>(
    `${API_BASE}/get-all-facets?categoryId=${encodeURIComponent(categoryId)}`
  );
}

export async function getFacetById(facetId: string) {
  return apiFetch<FacetModel>(
    `${API_BASE}/get-facet-by-id?facetId=${encodeURIComponent(facetId)}`
  );
}

export async function getSubFacetValues(facetValueId: string) {
  return apiFetch<FacetValueModel[]>(
    `${API_BASE}/get-sub-facet-values?facetValueId=${encodeURIComponent(facetValueId)}`
  );
}


export async function createFacet(data: CreateFacetRequest) {
  // eslint-disable-next-line no-console
  console.log("Facet API Request:", {
    url: `${API_BASE}/add-facet`,
    payload: data,
  });

  return apiFetch<string>(`${API_BASE}/add-facet`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    }, requireAuth: true , failIfUnauthenticated : true 
  });
}

export async function updateFacet(model: FacetModel) {
  return apiFetch<OkString>(`${API_BASE}/update-facet`, {
    method: "PUT",
    body: JSON.stringify(model), requireAuth: true , failIfUnauthenticated : true 
  });
}

export async function deleteFacet(facetId: string) {
  return apiFetch<OkString>(
    `${API_BASE}/delete-facet?facetId=${encodeURIComponent(facetId)}`,
    { method: "DELETE", requireAuth: true , failIfUnauthenticated : true  }
  );
}

export async function deleteFacetById(id: string) {
  return apiFetch<OkString>(`${API_BASE}/delete-facet-by-${id}`, {
    method: "DELETE", requireAuth: true , failIfUnauthenticated : true 
  });
}
