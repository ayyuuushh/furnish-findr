import React from "react";

type Item = {
  uniq_id: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number | null;
  image?: string | null;  // what the API returns
  color?: string | null;
  score?: number;
  blurb?: string;
  price_text?: string;
};

// 1) Find the first real URL inside any string (handles commas, arrays-as-strings, quotes)
const URL_RE = /(https?:\/\/[^\s,"'\]]+)/i;

function firstUrl(raw?: string | null): string | undefined {
  if (!raw) return;
  const s = String(raw).trim();

  // case: //m.media-amazon.com/...
  if (s.startsWith("//")) return `https:${s}`;

  // case: looks like JSON-y array or comma-joined list — pick first http(s) URL
  const m = s.match(URL_RE);
  if (m) return m[1];

  // case: a single URL but no http (rare)
  if (/^[a-z0-9.-]+\/.+/i.test(s)) return `https://${s}`;

  // finally, if it's just one thing without commas, assume it is the URL
  if (/^https?:\/\//i.test(s)) return s;

  return;
}

// 2) Always serve images via HTTPS proxy to avoid mixed content & hotlink blocks
function viaProxy(source?: string): string | undefined {
  if (!source) return;
  const u = firstUrl(source);
  if (!u) return;

  // Remove protocol for weserv
  const clean = u.replace(/^https?:\/\//i, "");
  // Use wsrv.nl (aka images.weserv.nl). Add transforms for speed and a “404 = empty” default.
  return `https://wsrv.nl/?url=${encodeURIComponent(clean)}&w=320&h=240&fit=cover&output=webp&default=404`;
}

let __logCount = 0;

export default function ProductCard({ item }: { item: Item }) {
  const raw = item.image || null;
  const proxied = viaProxy(raw);

  // Log the first few items so you can see exactly what’s happening
  if (__logCount < 5) {
    // eslint-disable-next-line no-console
    console.log("[Image debug]", {
      title: item.title,
      raw,
      extracted: firstUrl(raw || undefined),
      proxied,
    });
    __logCount++;
  }

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
        background: "#0f172a",
        borderRadius: 12,
        border: "1px solid #1f2937",
        padding: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }}
    >
      {proxied ? (
        <img
          src={proxied}
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
            textAlign: "center",
            padding: 8,
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
        {raw && (
          <div style={{ marginTop: 6 }}>
            <a
              href={firstUrl(raw)}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#60a5fa", fontSize: 12 }}
              title="Open original image URL in new tab"
            >
              open image
            </a>
          </div>
        )}
        {item.blurb && (
          <p style={{ margin: "6px 0 0 0", color: "#9ca3af", fontSize: 13 }}>
            {item.blurb}
          </p>
        )}
      </div>
    </div>
  );
}
