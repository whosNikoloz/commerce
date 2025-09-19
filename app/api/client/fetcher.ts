export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === "undefined";
  const method = (options.method ?? "GET").toUpperCase();
  const needsAuth = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers = new Headers(options.headers as Record<string, string> | undefined);

  const hasBody = options.body != null && method !== "GET" && method !== "HEAD";
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (hasBody && !isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (needsAuth) {
    let token: string | null | undefined;

    if (isServer) {
      const { cookies } = await import("next/headers");

      token = (await cookies()).get("admin_token")?.value ?? null;
    } else {
      try {
        const r = await fetch("/api/auth/token", { credentials: "same-origin", cache: "no-store" });

        token = r.ok ? ((await r.json())?.token ?? null) : null;
      } catch {
        token = null;
      }
    }
    if (token)
      headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  }

  if (!headers.has("X-Client-Domain")) {
    if (isServer) {
      try {
        const { headers: nextHeaders } = await import("next/headers");
        const h = await nextHeaders();
        const host = h.get("x-forwarded-host") ?? h.get("host");

        headers.set("X-Client-Domain", "commerce-topaz-sigma-62.vercel.app");
      } catch {
        headers.set("X-Client-Domain", "unknown");
      }
    } else {
      headers.set("X-Client-Domain", "commerce-topaz-sigma-62.vercel.app");
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: isServer ? "include" : "same-origin",
    next: { revalidate: 60, ...(options as any).next },
  });

  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    const msg = ct.includes("application/json")
      ? JSON.stringify(await res.json())
      : await res.text();

    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return (ct.includes("application/json") ? await res.json() : await res.text()) as T;
}
