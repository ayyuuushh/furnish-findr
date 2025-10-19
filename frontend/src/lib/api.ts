// Single source of truth for your backend URL.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://furnish-findr-backend.onrender.com";

export async function recommend(body: { query: string; k?: number; filters?: any }) {
  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json?.items ?? [];
}

export async function analytics() {
  const res = await fetch(`${API_BASE}/api/analytics`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
