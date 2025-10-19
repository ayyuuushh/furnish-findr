import React from "react";
import { API_BASE } from "../lib/api";

type Item = {
  uniq_id: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number | null;
  image?: string | null;
  price_text?: string | null;
};

function normalizeUrl(raw?: string | null): string | undefined {
  if (!raw) return;
  let s = String(raw).trim();
  if (!s) return;
  if (s.startsWith("//")) return "https:" + s;
  if (/^https?:\/\//i.test(s)) return s;
  const m = s.match(/https?:\/\/[^\s"']+/i);
  if (m) return m[0];
  return;
}

export default function ProductCard({ item }: { item: Item }) {
  const direct = normalizeUrl(item.image);

  const imgSrc = direct
    ? `${API_BASE}/api/img?u=${encodeURIComponent(direct)}`
    : "https://placehold.co/240x240?text=No+Image";

  return (
    <div
      style={{
        display: "flex",
        background: "#0f172a",
        border: "1px solid #1f2937",
        borderRadius: 10,
        padding: 10,
        gap: 12,
        color: "#e2e8f0",
      }}
    >
      <img
        src={imgSrc}
        alt={item.title}
        loading="lazy"
        style={{
          width: 120,
          height: 120,
          objectFit: "cover",
          borderRadius: 8,
          background: "#1e293b",
        }}
      />
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: "0 0 6px 0", color: "#93c5fd" }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: 14 }}>
          <b>{item.brand || "—"}</b> · {item.category || "Uncategorized"}
        </p>
        <p style={{ color: "#facc15", margin: "6px 0 0 0" }}>
          {item.price_text || "₹N/A"}
        </p>
      </div>
    </div>
  );
}
