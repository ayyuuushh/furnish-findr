// frontend/src/lib/api.ts
// Single source of truth for your backend URL.
// You can override via env: VITE_API_BASE=...
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://ikarus-backend-v1sc.onrender.com";

function withTimeout<T>(p: Promise<T>, ms = 60000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  // @ts-expect-error - signal will be attached by caller fetch; here we just expose it
  (p as any).signal = ctrl.signal;
  return p.finally(() => clearTimeout(t));
}

export async function recommend(body: { query: string; k?: number; filters?: any }) {
  const res = await withTimeout(
    fetch(`${API_BASE}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    })
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Recommend failed (HTTP ${res.status}) ${text}`);
  }
  const json = await res.json();
  return json?.items ?? [];
}

export async function analytics() {
  const res = await withTimeout(fetch(`${API_BASE}/api/analytics`));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Analytics failed (HTTP ${res.status}) ${text}`);
  }
  return await res.json();
}
