import { apiFetch } from "../client/fetcher";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "CustomerAuth/";
const AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Auth/";


export type TokensResponse = { accessToken: string; refreshToken: string };
export type LoginAdminResponse = string;

export type ApiEnvelope<T = unknown> = {
  successful?: boolean;
  status?: boolean;
  response?: T;
  error?: string | null;
};
export interface LoginRequest {
  email: string;
  password: string;
}
export type UserRole = 0;
export const CUSTOMER_ROLE: UserRole = 0;

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verifyCode?: number;
};
export type GoogleLoginRequest = {
  accessToken: string;
  idToken: string;
  role?: UserRole;
};
export type FacebookLoginRequest = {
  accesToken: string; 
  role?: UserRole;
};

function normalizeTokens(json: any): TokensResponse {
  const accessToken = json?.accessToken ?? json?.AccessToken;
  const refreshToken = json?.refreshToken ?? json?.RefreshToken;

  if (!accessToken || !refreshToken) throw new Error("Invalid token payload");

  return { accessToken, refreshToken };
}

export async function loginAdmin({ email, password }: LoginRequest): Promise<LoginAdminResponse> {
  const params = new URLSearchParams({ email, password });

  return apiFetch<LoginAdminResponse>(`${AUTH_BASE}user-login?${params.toString()}`, {
    method: "POST",
  });
}

export async function loginCustomer(email: string, password: string): Promise<TokensResponse> {
  const data = await apiFetch<any>(`${BASE}login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return normalizeTokens(data);
}

export async function registerCustomer(p: RegisterPayload): Promise<void | TokensResponse> {
  const body = {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    password: p.password,
    verifyCode: p.verifyCode ?? 0,
  };

  const data = await apiFetch<any>(`${BASE}register`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // registration may return 204 (no content) or tokens
  if (data && (data.accessToken || data.AccessToken)) return normalizeTokens(data);
}

/* ———————— Validate User (email/password check) ———————— */
export async function validateUser(email: string, password?: string): Promise<void> {
  await apiFetch<void>(`${BASE}validateUser`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* ———————— Refresh Tokens ———————— */
export async function refreshTokens(refreshToken: string): Promise<TokensResponse> {
  const data = await apiFetch<any>(`${BASE}refreshToken`, {
    method: "GET",
    headers: { refreshToken },
  });

  return normalizeTokens(data);
}

export async function googleLogin(req: GoogleLoginRequest): Promise<TokensResponse> {
  const data = await apiFetch<any>(`${BASE}googleLogin`, {
    method: "POST",
    body: JSON.stringify({
      accessToken: req.accessToken,
      idToken: req.idToken,
      role: req.role ?? CUSTOMER_ROLE,
    }),
  });

  return normalizeTokens(data);
}

export async function facebookLogin(req: FacebookLoginRequest): Promise<TokensResponse> {
  const data = await apiFetch<any>(`${BASE}fbLogin`, {
    method: "POST",
    body: JSON.stringify({
      accesToken: req.accesToken,
      role: req.role ?? CUSTOMER_ROLE,
    }),
  });

  return normalizeTokens(data);
}
