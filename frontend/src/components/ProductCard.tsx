// frontend/src/components/ProductCard.tsx
import React from "react";

type Item = {
  uniq_id: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number | null;
  image?: string | null;
  color?: string | null;
  score?: number;
  blurb?: string;
  price_text?: string;
};

function proxiedImage(url?: string | null) {
  if (!url) return undefined;
  // handle "//..." and "http://..." consistently and remove protocol for the proxy
  const clean = String(url).trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^\/\//, ""); // e.g. //m.media-amazon.com/...

  // Use a free HTTPS proxy that adds proper CORS headers and avoids mixed content
  // Docs: https://wsrv.nl/  (alias for images.weserv.nl)
  // Add small transforms so slow/originals don’t block the UI
  return `https://wsrv.nl/?url=${encodeURIComponent(clean)}&w=320&h=240&fit=cover&output=webp`;
}

export default function ProductCard({ item }: { item: Item }) {
  const img = proxiedImage(item.image);
  const price =
    typeof item.price === "number" && !Number.isNaN(item.price)
      ? `₹${Math.round(item.price)}`
      : item.price_text || "₹NA";

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        background: "#0f172a", // your dark card bg
        borderRadius: 12,
        border: "1px solid #1f2937",
        padding: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }}
    >
      {img ? (
        <img
          src={img}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            objectFit: "cover",
            background: "#0b1220",
            flex: "0 0 120px",
          }}
          onError={(e) => {
            // graceful fallback if proxy still fails
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/320x240?text=No+Image";
          }}
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
            flex: "0 0 120px",
            fontSize: 12,
          }}
        >
          No Image
        </div>
      )}

      <div style={{ flex: 1, color: "#e5e7eb" }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: 16, color: "#c7d2fe" }}>
          {item.title}
        </h3>
        <p style={{ margin: "0 0 6px 0", color: "#a5b4fc" }}>
          <b>{item.brand || "—"}</b> · {item.category || "Uncategorized"}
        </p>
        <p style={{ margin: 0, color: "#eab308" }}>
          Price: <b>{price}</b>
        </p>
        {item.blurb && (
          <p style={{ margin: "6px 0 0 0", color: "#9ca3af", fontSize: 13 }}>
            {item.blurb}
          </p>
        )}
      </div>
    </div>
  );
}
