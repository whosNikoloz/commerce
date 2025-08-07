export async function apiFetch<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            next: { revalidate: 60 },
        });
        if (!res.ok) {
            const message = await res.text();
            throw new Error(`Error ${res.status}: ${message}`);
        }

        return await res.json();
    } catch (err: any) {
        throw new Error(err.message || "Something went wrong");
    }
}
