import { apiFetch } from "../client/fetcher";


const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const AUTH_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Auth/";
const USER_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "User/";

export type ApiBool = { successful?: boolean; status?: boolean };
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
export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    userName?: string;
    picture?: string;
  };
}

export type LoginAdminResponse = string;


export async function checkEmailLogin(email: string) {
  return apiFetch<ApiEnvelope>(`${AUTH_BASE}Login/check-email`, {
    method: "POST",
    body: JSON.stringify({ email }),
  }).then((d) => (d.successful ? { success: true } : { success: false, result: d.error }));
}

export async function loginAdmin({ email, password }: LoginRequest): Promise<LoginAdminResponse> {
  const params = new URLSearchParams({ email, password });
  return apiFetch<LoginAdminResponse>(`${API_BASE}/user-login?${params.toString()}`, {
    method: "POST",
  });
}

export async function loginWithEmail(email: string, password: string) {
  const data = await apiFetch<ApiEnvelope<LoginResponse>>(`${AUTH_BASE}Email`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.successful && data.response?.token) return data.response;
  throw new Error(data.error || "Login failed");
}

export async function loginWithOAuthEmail(oAuthprovider: string, oAuthproviderId: string) {
  const data = await apiFetch<ApiEnvelope<LoginResponse>>(`${AUTH_BASE}OAuthEmail`, {
    method: "POST",
    body: JSON.stringify({ oAuthprovider, oAuthproviderId }),
  });
  if (data.successful && data.response?.token) return data.response;
  throw new Error(data.error || "OAuth login failed");
}

export async function checkEmailRegister(email: string) {
  const d = await apiFetch<ApiEnvelope>(`${AUTH_BASE}Register/check-email`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return (d.status || d.successful) ? { success: true } : { success: false, result: d.error };
}

export async function checkUserNameRegister(username: string) {
  const d = await apiFetch<ApiEnvelope>(`${AUTH_BASE}Register/check-username/${encodeURIComponent(username)}`, {
    method: "GET",
  });
  return (d.status || d.successful) ? { success: true } : { success: false, result: d.error };
}

export async function registerUser(userName: string, email: string, password: string, confirmPassword: string) {
  const d = await apiFetch<ApiEnvelope>(`${AUTH_BASE}Register`, {
    method: "POST",
    body: JSON.stringify({ email, userName, password, confirmPassword }),
  });
  if (d.successful || d.status) return true;
  throw new Error(d.error || "Registration failed");
}

export async function oauthExists(oAuthProvider: string, oAuthProviderId: string) {
  const res = await apiFetch<Response>(`${AUTH_BASE}OAuth2Exist`, {
    method: "POST",
    body: JSON.stringify({ oAuthProvider, oAuthProviderId }),
  });
  return !!res;
}

export async function registerOAuth2(email: string, username: string, picture: string, oAuthProvider: string, oAuthProviderId: string) {
  const d = await apiFetch<ApiEnvelope>(`${AUTH_BASE}RegisterOAuth2`, {
    method: "POST",
    body: JSON.stringify({ email, username, picture, oAuthProvider, oAuthProviderId }),
  });
  if (d.successful || d.status) return true;
  throw new Error(d.error || "OAuth registration failed");
}

export async function forgotPassword(email: string) {
  const url = `${USER_BASE}ForgotPassword?email=${encodeURIComponent(email)}`;
  await apiFetch<unknown>(url, { method: "POST" });
  return true;
}

export async function resetPassword(Token: string, Password: string, ConfirmPassword: string) {
  await apiFetch<unknown>(`${USER_BASE}ResetPassword`, {
    method: "PUT",
    body: JSON.stringify({ Token, Password, ConfirmPassword }),
  });
  return true;
}

export async function changePassword(userid: number, OldPassword: string, Password: string, ConfirmPassword: string) {
  await apiFetch<unknown>(`${USER_BASE}ChangePassword`, {
    method: "PUT",
    body: JSON.stringify({ userid, OldPassword, Password, ConfirmPassword }),
  });
  return true;
}

export async function changeGeneral(
  userid: number,
  UserName: string,
  FirstName: string,
  LastName: string,
  PhoneNumber: string
) {
  await apiFetch<unknown>(`${USER_BASE}ChangeGeneral`, {
    method: "PUT",
    body: JSON.stringify({ userid, UserName, FirstName, LastName, PhoneNumber }),
  });
  return true;
}

export async function getUpdatedUser(userid: number) {
  const data = await apiFetch<ApiEnvelope<LoginResponse>>(`${USER_BASE}${userid}`, {
    method: "GET",
  });
  if (data.successful && data.response?.token) return data.response;
  throw new Error(data.error || "Failed to refresh user");
}

export async function reLogin(password: string) {
  const encoded = encodeURIComponent(password);
  await apiFetch<unknown>(`${USER_BASE}ReLogin/${encoded}`, {
    method: "GET",
  });
  return true;
}

export async function changeEmailRequest(email: string) {
  const encoded = encodeURIComponent(email);
  const verificationCode = await apiFetch<string>(`${USER_BASE}ChangeEmailRequest/${encoded}`, {
    method: "POST",
  });
  return { ok: true as const, data: verificationCode };
}

export async function changeEmail(email: string) {
  const encoded = encodeURIComponent(email);
  await apiFetch<unknown>(`${USER_BASE}ChangeEmail/${encoded}`, {
    method: "POST",
  });
  return true;
}
