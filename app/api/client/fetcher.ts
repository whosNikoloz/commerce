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

  let token: string | null | undefined;

  if (needsAuth) {
    if (isServer) {
      const { cookies } = await import("next/headers");

      token = (await cookies()).get("admin_token")?.value ?? null;
    } else {
      try {
        const res = await fetch("/api/auth/token", {
          credentials: "same-origin",
          cache: "no-store",
        });

        token = res.ok ? ((await res.json())?.token ?? null) : null;
      } catch {
        token = null;
      }
    }
    if (token)
      headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  }

  // Optional: limit which hosts get proxied
  const ALLOW_PROXY = ["https://ecomtest.resorter360.ge"]; // add more if needed

  let finalUrl = url;

  if (!isServer) {
    try {
      const abs = new URL(url, window.location.origin);
      const isAbsolute = /^https?:/i.test(abs.href);
      const isCrossOrigin = isAbsolute && abs.origin !== window.location.origin;
      const allowed = isCrossOrigin && ALLOW_PROXY.some((h) => abs.href.startsWith(h));

      if (allowed) {
        finalUrl = `/api/proxy?${new URLSearchParams({ u: abs.href }).toString()}`;
      }
      // If cross-origin but NOT allowed, you can either throw or let it attempt (and fail) with CORS
    } catch {
      /* keep as-is if parsing fails */
    }
  }

  const res = await fetch(finalUrl, {
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
