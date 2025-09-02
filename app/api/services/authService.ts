import { apiFetch } from "../client/fetcher";

import { LoginRequest, LoginResponse } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "Auth";

export async function loginUser({ email, password }: LoginRequest): Promise<LoginResponse> {
  const params = new URLSearchParams({ email, password });

  return apiFetch<LoginResponse>(`${API_BASE}/user-login?${params.toString()}`, {
    method: "POST",
  });
}
