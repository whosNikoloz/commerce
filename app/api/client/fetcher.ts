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

        headers.set("X-Client-Domain", "ecom.resorter360.ge");
      } catch {
        headers.set("X-Client-Domain", "unknown");
      }
    } else {
      headers.set("X-Client-Domain", "ecom.resorter360.ge");
    }
  }



  // if (!headers.has("X-Client-Domain")) {
  //   if (isServer) {
  //     try {
  //       const { headers: nextHeaders } = await import("next/headers");
  //       const h = await nextHeaders();
  //       const host = h.get("x-forwarded-host") ?? h.get("host");

  //       headers.set("X-Client-Domain", host ?? "unknown");
  //     } catch {
  //       headers.set("X-Client-Domain", "unknown");
  //     }
  //   } else {
  //     headers.set("X-Client-Domain", window.location.hostname);
  //   }
  // }


  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: isServer ? "include" : "same-origin",
  };

  // Only add revalidate if cache is not explicitly set to no-store
  if (options.cache !== "no-store") {
    (fetchOptions as any).next = { revalidate: 60, ...(options as any).next };
  }

  const res = await fetch(url, fetchOptions);

  //console.log("Fetch", method, url, res.status, options.body ? options.body : "");

  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    const msg = ct.includes("application/json")
      ? JSON.stringify(await res.json())
      : await res.text();

    console.error(`❌ API Error [${method} ${url}]:`, res.status, msg);
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  const result = (ct.includes("application/json") ? await res.json() : await res.text()) as T;

  // Log tenant configuration responses for debugging
  if (url.includes("/Tenant/tenant-configuration")) {
    //console.log("📦 Tenant config response:", JSON.stringify(result, null, 2));
  }

  return result;
}
