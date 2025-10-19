import React, { useEffect, useState } from "react";
import { analytics } from "../lib/api";

type CountTuple = [string, number];

type AnalyticsResponse = {
  total_products: number;
  brand_counts: CountTuple[];
  category_counts: CountTuple[];
  material_counts?: CountTuple[];
  price_summary?: { min?: number | null; avg?: number | null; max?: number | null };
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await analytics();
        setData(a);
      } catch (e) {
        console.error(e);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading analytics…</div>;
  if (error) return <div style={{ padding: 16, color: "#b91c1c" }}>{error}</div>;
  if (!data) return <div style={{ padding: 16 }}>No data</div>;

  const ps = data.price_summary || {};
  const fmt = (v?: number | null) => (typeof v === "number" ? `₹${Math.round(v)}` : "N/A");

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 960, margin: "24px auto", padding: 16 }}>
      <div>Totals: <b>{data.total_products}</b> products</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
        <Card title="Top Brands" items={data.brand_counts} />
        <Card title="Top Categories" items={data.category_counts} />
        {data.material_counts && <Card title="Top Materials" items={data.material_counts} />}
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
        <h4 style={{ marginTop: 0 }}>Price Summary</h4>
        <div>Min: {fmt(ps.min)} | Avg: {fmt(ps.avg)} | Max: {fmt(ps.max)}</div>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: CountTuple[] }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <h4 style={{ marginTop: 0 }}>{title}</h4>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items?.slice(0, 10).map(([name, count]) => (
          <li key={name}>
            {name} — <b>{count}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
