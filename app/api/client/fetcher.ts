export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === "undefined";
  const method = (options.method ?? "GET").toUpperCase();
  const needsAuth = ["POST", "PUT", "DELETE"].includes(method);

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  });

  async function resolveOrigin() {
    try {
      if (isServer) {
        const { headers: nextHeaders } = await import("next/headers");
        const h = nextHeaders();
        const host = (await h).get("x-forwarded-host") ?? (await h).get("host") ?? undefined;
        const proto = (await h).get("x-forwarded-proto") ?? (process.env.VERCEL ? "https" : "http");
        if (host) return { origin: `${proto}://${host}`, domain: host };
      } else {
        return { origin: window.location.origin, domain: window.location.host };
      }
    } catch {/* ignore */ }
    const fallback = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (fallback) {
      try {
        const u = new URL(fallback);
        return { origin: u.origin, domain: u.host };
      } catch {/* ignore */ }
    }
    return { origin: undefined, domain: undefined };
  }

  const { origin, domain } = await resolveOrigin();
  if (domain && !headers.has("X-Domain")) headers.set("X-Domain", domain);
  if (origin && !headers.has("X-Origin")) headers.set("X-Origin", origin);
  let token: string | null | undefined;

  if (isServer) {
    if (needsAuth && token == null) {
      const { cookies } = await import("next/headers");
      token = (await cookies()).get("admin_token")?.value ?? null;
    }
  } else {
    if (needsAuth && token == null) {
      try {
        const res = await fetch("/api/auth/token", { credentials: "same-origin", cache: "no-store" });
        token = res.ok ? (await res.json())?.token ?? null : null;
      } catch { token = null; }
    }
  }

  if (token) {
    headers.set("Authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: isServer ? "include" : "same-origin",
    next: { revalidate: 60, ...(options as any).next },
  });

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const msg = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return (ct.includes("application/json") ? await res.json() : await res.text()) as T;
}
