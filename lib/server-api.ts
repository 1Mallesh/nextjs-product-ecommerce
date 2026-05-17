const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Server-side fetch for public (no-auth) endpoints.
 * Uses native fetch so it runs in Node.js / Edge without any browser deps.
 * Revalidates every 30 seconds — when admin approves a product,
 * revalidatePath() in the server action busts this cache immediately.
 */
export async function serverFetch<T = unknown>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 30 },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Server fetch ${url.pathname} → ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** Extract the items array from whichever key the backend uses */
export function extractItems<T>(payload: unknown): T[] {
  const p = payload as Record<string, unknown>;
  return (
    (p?.products as T[] | undefined) ??
    (p?.data as T[] | undefined) ??
    (p?.items as T[] | undefined) ??
    (Array.isArray(payload) ? (payload as T[]) : [])
  );
}
