export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let err = await res.text().catch(() => "");

    throw new Error(err || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}
