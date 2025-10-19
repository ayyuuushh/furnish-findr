import React, { useRef } from "react";

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

// --- helpers ---------------------------------------------------------------

const URL_RE = /(https?:\/\/[^\s,"'\]]+)/i;

function firstUrl(raw?: string | null): string | undefined {
  if (!raw) return;
  const s = String(raw).trim();

  // case: //m.media-amazon.com/...
  if (s.startsWith("//")) return `https:${s}`;

  // pick first http(s) URL if the field is a messy list
  const m = s.match(URL_RE);
  if (m) return m[1];

  // already a clean http(s) url
  if (/^https?:\/\//i.test(s)) return s;

  // something like m.media-amazon.com/… (no scheme)
  if (/^[a-z0-9.-]+\/.+/i.test(s)) return `https://${s}`;

  return;
}

/** Proxy through images.weserv.nl to avoid mixed content/hotlink issues. */
function viaProxy(src?: string): string | undefined {
  if (!src) return;
  const u = firstUrl(src);
  if (!u) return;

  const clean = u.replace(/^https?:\/\//i, "");
  // keep it simple; some transforms can trigger 404s on edge cases
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}`;
}

let __logCount = 0;

// --- component -------------------------------------------------------------

export default function ProductCard({ item }: { item: Item }) {
  const raw = item.image || null;
  const direct = firstUrl(raw);
  const proxied = viaProxy(raw);

  // log a few cards to verify what we got
  if (__logCount < 5) {
    console.log("[img-debug]", {
      title: item.title,
      raw,
      direct,
      proxied,
    });
    __logCount++;
  }

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleImgError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const el = e.currentTarget;
    const current = el.getAttribute("src") || "";

    // 1) If proxy failed, try the direct URL
    if (proxied && current.includes("images.weserv.nl") && direct) {
      el.src = direct;
      return;
    }

    // 2) If direct failed (or we never had one), show a visible placeholder
    el.src = "https://placehold.co/320x240?text=No+Image";
  };

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
      {(proxied || direct) ? (
        <img
          ref={imgRef}
          src={proxied || direct}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            objectFit: "cover",
            background: "#0b1220",
            border: "1px solid #334155",
            flex: "0 0 120px",
          }}
          onError={handleImgError}
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
        <h3 style={{ margin: "0 0 6px 0", fontSize: 16, color: "#c7d2fe" }}>
          {item.title}
        </h3>
        <p style={{ margin: "0 0 6px 0", color: "#a5b4fc" }}>
          <b>{item.brand || "—"}</b> · {item.category || "Uncategorized"}
        </p>
        <p style={{ margin: 0, color: "#eab308" }}>
          Price: <b>{price}</b>
        </p>
        {direct && (
          <div style={{ marginTop: 6 }}>
            <a
              href={direct}
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
