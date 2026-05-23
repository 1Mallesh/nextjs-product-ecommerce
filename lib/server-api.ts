const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Server-side fetch for public (no-auth) endpoints.
 * Never throws — returns null on any network/HTTP error so pages
 * degrade gracefully instead of crashing with 500.
 */
export async function serverFetch<T = unknown>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T | null> {
  try {
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

    if (!res.ok) return null;

    return res.json() as Promise<T>;
  } catch {
    // Backend offline or network error — return null, page renders with empty state
    return null;
  }
}

/** Extract the items array from whichever key the backend uses */
export function extractItems<T>(payload: unknown): T[] {
  if (!payload) return [];
  const p = payload as Record<string, unknown>;
  return (
    (p?.products as T[] | undefined) ??
    (p?.data as T[] | undefined) ??
    (p?.items as T[] | undefined) ??
    (Array.isArray(payload) ? (payload as T[]) : [])
  );
}
