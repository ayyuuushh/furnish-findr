import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8100";

type Analytics = {
  total_products: number;
  brand_counts: [string, number][];
  category_counts?: [string, number][];
  material_counts?: [string, number][];
};

export default function Analytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e: any) {
        setErr(e?.message || "Failed to load analytics.");
      }
    })();
  }, []);

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0" }}>
      <h2 style={{ marginTop: 0, color: "#0f172a" }}>Dataset Analytics</h2>
      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}
      {!err && !data && <div>Loading…</div>}
      {data && (
        <>
          <p><b>Total products:</b> {data.total_products}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <section>
              <h3 style={{ marginBottom: 6 }}>Top Brands</h3>
              <ol>
                {data.brand_counts.slice(0, 10).map(([n, c]) => <li key={n}>{n} — {c}</li>)}
              </ol>
            </section>
            {data.category_counts && (
              <section>
                <h3 style={{ marginBottom: 6 }}>Top Categories</h3>
                <ol>
                  {data.category_counts.slice(0, 10).map(([n, c]) => <li key={n}>{n} — {c}</li>)}
                </ol>
              </section>
            )}
            {data.material_counts && (
              <section>
                <h3 style={{ marginBottom: 6 }}>Top Materials</h3>
                <ol>
                  {data.material_counts.slice(0, 10).map(([n, c]) => <li key={n}>{n} — {c}</li>)}
                </ol>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
