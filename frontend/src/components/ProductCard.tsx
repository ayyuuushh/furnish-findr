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
  blurb?: string | null;
};

function normalizeUrl(raw?: string | null): string | undefined {
  if (!raw) return;
  let s = String(raw).trim();
  if (s.startsWith("//")) return "https:" + s;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z0-9.-]+\/.+/i.test(s)) return "https://" + s;
  const m = s.match(/https?:\/\/[^\s,"'\]]+/i);
  return m ? m[0] : undefined;
}

export default function ProductCard({ item }: { item: Item }) {
  const direct = normalizeUrl(item.image);
  const proxied = direct ? `${API_BASE}/api/img?u=${encodeURIComponent(direct)}` : undefined;

  const price =
    typeof item.price === "number" && !Number.isNaN(item.price)
      ? `₹${Math.round(item.price)}`
      : item.price_text || "₹NA";

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const el = e.currentTarget;
    const current = el.getAttribute("src") || "";
    // if proxy failed, try direct URL; otherwise show placeholder
    if (proxied && current.startsWith(`${API_BASE}/api/img`) && direct) {
      el.src = direct;
    } else {
      el.src = "https://placehold.co/320x240?text=No+Image";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        background: "#0f172a",
        borderRadius: 12,
        border: "1px solid #1f2937",
        padding: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }}
    >
      {(proxied || direct) ? (
        <img
          src={proxied || direct}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            objectFit: "cover",
            background: "#0b1220",
            border: "1px solid #334155",
            flex: "0 0 120px",
          }}
          onError={handleError}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            background: "#0b1220",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            border: "1px solid #334155",
            flex: "0 0 120px",
            fontSize: 12,
            textAlign: "center",
            padding: 8,
          }}
        >
          No Image
        </div>
      )}

      <div style={{ flex: 1, color: "#e5e7eb" }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: 16, color: "#c7d2fe" }}>{item.title}</h3>
        <p style={{ margin: "0 0 6px 0", color: "#a5b4fc" }}>
          <b>{item.brand || "—"}</b> · {item.category || "Uncategorized"}
        </p>
        <p style={{ margin: 0, color: "#eab308" }}>
          Price: <b>{price}</b>
        </p>
      </div>
    </div>
  );
}
