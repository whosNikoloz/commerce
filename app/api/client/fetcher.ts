export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const isServer = typeof window === "undefined";

    const headers = new Headers({
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
    });

    let token: string | null = null;

    if (isServer) {
        const { cookies } = await import("next/headers");
        token = (await cookies()).get("admin_token")?.value ?? null;
    } else {
        try {
            const res = await fetch("/api/auth/token", {
                credentials: "same-origin",
                cache: "no-store",
            });
            if (res.ok) {
                const json = await res.json();
                token = json?.token ?? null;
            }
        } catch {
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
