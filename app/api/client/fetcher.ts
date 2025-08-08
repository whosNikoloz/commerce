export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            next: { revalidate: 60 },
        });

        const contentType = res.headers.get("content-type") || "";

        if (!res.ok) {
            const message = contentType.includes("application/json")
                ? JSON.stringify(await res.json())
                : await res.text();
            throw new Error(`Error ${res.status}: ${message}`);
        }

        if (contentType.includes("application/json")) {
            return (await res.json()) as T;
        } else {
            return (await res.text()) as T;
        }
    } catch (err: any) {
        throw new Error(err.message || "Something went wrong");
    }
}
