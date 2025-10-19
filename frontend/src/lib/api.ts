// Single source of truth for the backend origin.
// IMPORTANT: Do NOT include a trailing slash and do NOT include '/api' here.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://furnish-findr-backend.onrender.com";

async function withTimeout<T>(p: Promise<T>, ms = 60000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
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
    throw new Error(`Server ${res.status}: ${text || "Request failed"}`);
  }
  const json = await res.json();
  return json?.items ?? [];
}

export async function analytics() {
  const res = await withTimeout(fetch(`${API_BASE}/api/analytics`));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server ${res.status}: ${text || "Request failed"}`);
  }
  return await res.json();
}
