// frontend/src/lib/api.ts
// Hard-code the deployed backend for reliability (avoids env drift).
export const API_BASE = "https://furnish-findr-backend.onrender.com";

// Helper with timeout
function withTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  // @ts-ignore
  const p = promise.finally(() => clearTimeout(t));
  return p;
}

// POST /api/recommend
export async function recommend(body: { query: string; k?: number; filters?: any }) {
  const res = await withTimeout(
    fetch(`${API_BASE}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    })
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.items ?? [];
}

// GET /api/analytics
export async function analytics() {
  const res = await withTimeout(fetch(`${API_BASE}/api/analytics`));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
