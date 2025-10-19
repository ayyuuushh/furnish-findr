import React, { useEffect, useState } from "react";
import { recommend, API_BASE } from "../lib/api";

type Item = {
  uniq_id: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number | null;
  image?: string | null;
  color?: string | null;
  score?: number;
};

/* ---------- image helpers: no weserv, use direct URL then backend proxy ---------- */
function normalizeUrl(raw?: string | null): string | undefined {
  if (!raw) return;
  let s = String(raw).trim();
  if (!s) return;

  // handle protocol-relative URLs like //m.media-amazon.com/...
  if (s.startsWith("//")) return "https:" + s;

  // already http(s)
  if (/^https?:\/\//i.test(s)) return s;

  // if the field had extra text but contains a real URL, extract it
  const m = s.match(/https?:\/\/[^\s"']+/i);
  if (m) return m[0];

  return; // give up
}

function ImgWithFallback({ srcDirect, alt }: { srcDirect?: string | null; alt: string }) {
  const direct = normalizeUrl(srcDirect);
  const proxy = direct ? `${API_BASE}/api/img?u=${encodeURIComponent(direct)}` : undefined;

  const [src, setSrc] = React.useState<string | undefined>(direct);
  const usedFallback = React.useRef(false);

  React.useEffect(() => {
    usedFallback.current = false;
    setSrc(direct);
  }, [direct]);

  const onError = () => {
    if (!usedFallback.current && proxy) {
      usedFallback.current = true;
      setSrc(proxy);
    }
  };

  return (
    <img
      src={src || "https://placehold.co/240x240?text=No+Image"}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={onError}
      style={{
        width: 120,
        height: 120,
        borderRadius: 8,
        objectFit: "cover",
        background: "#1e293b",
      }}
    />
  );
}

/* ------------------------------- main page ------------------------------- */
export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const items = await recommend({ query, k: 8 });
      if (!items || items.length === 0) {
        setError("No matching furniture found. Try refining your query.");
        setResults([]);
        return;
      }
      setResults(items);
    } catch (e: any) {
      setError(`Server ${e?.message?.includes("404") ? "404" : ""}: ${e?.message || "Error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const el = document.getElementById("query") as HTMLInputElement | null;
    el?.focus();
  }, []);

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Poppins, sans-serif",
        color: "#1f2937",
      }}
    >
      <header
        style={{
          textAlign: "center",
          padding: "18px 0",
          marginBottom: 30,
          background: "linear-gradient(90deg,#06b6d4,#22d3ee)",
          color: "white",
          borderRadius: 12,
        }}
      >
        <h1 style={{ fontSize: 26, margin: 0, fontWeight: 700 }}>FurnishFindr</h1>
      </header>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. round glass side table under ₹6000"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: 8,
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
            padding: 10,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {results.map((r) => {
          const price =
            typeof r.price === "number" && !Number.isNaN(r.price)
              ? `₹${Math.round(r.price)}`
              : "N/A";
          return (
            <div
              key={r.uniq_id}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                background: "#0f172a",
                color: "white",
                borderRadius: 12,
                border: "1px solid #334155",
                padding: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <ImgWithFallback srcDirect={r.image} alt={r.title} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 17 }}>{r.title}</h3>
                <p style={{ margin: "0 0 4px 0", color: "#cbd5e1" }}>
                  <b>{r.brand || "—"}</b> · {r.category || "Uncategorized"}
                </p>
                <p style={{ margin: 0 }}>
                  Price: <b>{price}</b>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && results.length === 0 && !error && (
        <p style={{ color: "#9ca3af", textAlign: "center", marginTop: 40 }}>
          Try searching for “oak coffee table under ₹7000”
        </p>
      )}
    </div>
  );
}
