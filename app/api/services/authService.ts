import { LoginRequest, LoginResponse } from "@/types/auth";
import { apiFetch } from "../client/fetcher";


const API_BASE = "https://localhost:7204/Auth";

export async function loginUser({ email, password }: LoginRequest): Promise<LoginResponse> {
    const params = new URLSearchParams({ email, password });

    return apiFetch<LoginResponse>(`${API_BASE}/user-login?${params.toString()}`, {
        method: "POST",
    });
}
