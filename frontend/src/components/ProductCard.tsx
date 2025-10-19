import React, { useMemo, useRef, useState } from "react";
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
  if (!s) return;
  if (s.startsWith("//")) return "https:" + s;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z0-9.-]+\/.+/i.test(s)) return "https://" + s;
  const m = s.match(/https?:\/\/[^\s,"'\]]+/i);
  return m ? m[0] : undefined;
}

function fmtPrice(price?: number | null, price_text?: string | null) {
  if (typeof price === "number" && !Number.isNaN(price)) {
    return `₹${Math.round(price)}`;
  }
  return price_text || "₹NA";
}

export default function ProductCard({ item }: { item: Item }) {
  const [stage, setStage] = useState<"proxy" | "direct" | "placeholder">("proxy");
  const direct = useMemo(() => normalizeUrl(item.image), [item.image]);
  const cacheBust = useMemo(() => `cb=${Date.now()}`, []);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const proxy = direct
    ? `${API_BASE}/api/img?u=${encodeURIComponent(direct)}&${cacheBust}`
    : undefined;

  const src =
    stage === "proxy" ? proxy :
    stage === "direct" ? direct :
    "https://placehold.co/320x240?text=No+Image";

  const price = fmtPrice(item.price, item.price_text);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    // Step through: proxy → direct → placeholder
    if (stage === "proxy" && direct) {
      setStage("direct");
    } else if (stage === "direct") {
      setStage("placeholder");
    } else {
      // already placeholder: do nothing
    }
  };

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = () => {
    // image loaded successfully
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
      <div style={{ flex: "0 0 120px" }}>
        <img
          ref={imgRef}
          src={src}
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
            display: "block",
          }}
          onError={handleError}
          onLoad={handleLoad}
        />
        <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
          {/* Quick indicator of which source succeeded */}
          {stage === "proxy" && "loading via proxy…"}
          {stage === "direct" && "loaded direct"}
          {stage === "placeholder" && "no image available"}
        </div>
      </div>

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
