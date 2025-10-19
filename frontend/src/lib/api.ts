// frontend/src/lib/api.ts
// Single source of truth for backend URL (copied version).
export const API_BASE = "https://furnish-findr-backend.onrender.com";

async function withTimeout<T>(p: Promise<T>, ms = 30000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  // @ts-ignore attach signal
  p.signal = ctrl.signal;
  try {
    return await p;
  } finally {
    clearTimeout(timer);
  }
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

// Helpful at runtime to confirm what your build is using
console.log("✅ API_BASE =", API_BASE);
