import React, { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8100";

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

function proxyUrl(u?: string | null) {
  if (!u) return undefined;
  const clean = u.replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}`;
}

function Card({ item }: { item: Item }) {
  const [src, setSrc] = useState<string | undefined>(proxyUrl(item.image));
  const triedDirect = useRef(false);
  const price = typeof item.price === "number" && !Number.isNaN(item.price) ? `₹${Math.round(item.price)}` : "N/A";

  return (
    <div style={{
      background: "white", borderRadius: 12, overflow: "hidden",
      border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "140px 1fr"
    }}>
      <div style={{ background: "#f1f5f9" }}>
        {src ? (
          <img
            src={src}
            alt={item.title}
            style={{ width: 140, height: 140, objectFit: "cover", display: "block" }}
            onError={() => {
              if (!triedDirect.current && item.image) {
                setSrc(item.image);
                triedDirect.current = true;
              } else {
                setSrc(undefined);
              }
            }}
          />
        ) : (
          <div style={{
            width: 140, height: 140, display: "flex", alignItems: "center",
            justifyContent: "center", color: "#64748b", fontSize: 12
          }}>No Image</div>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: 16, color: "#0f172a" }}>{item.title}</h3>
        <p style={{ margin: "0 0 6px 0", color: "#334155" }}>
          <b>{item.brand || "—"}</b> · {item.category || "Uncategorized"}
        </p>
        <p style={{ margin: 0, color: "#059669" }}>Price: <b>{price}</b></p>
      </div>
    </div>
  );
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function doSearch() {
    if (!query.trim()) return;
    setLoading(true); setErr(null); setResults([]);
    try {
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 8 }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setErr(`Server ${res.status}: ${txt}`);
        return;
      }
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      if (items.length === 0) {
        setErr("No matching furniture found. Try adding price or material (e.g., “oak table under ₹10000”).");
        return;
      }
      setResults(items);
    } catch (e: any) {
      setErr(e?.message || "Network error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { document.getElementById("search-box")?.focus(); }, []);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto", gap: 8,
        background: "#0b1220", padding: 12, borderRadius: 12, border: "1px solid #1f2937"
      }}>
        <input
          id="search-box"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "modern oak coffee table under ₹10000"'
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          style={{
            padding: "10px 12px", borderRadius: 8, border: "1px solid #1f2937",
            background: "#111827", color: "#e5e7eb"
          }}
        />
        <button
          onClick={doSearch}
          disabled={loading}
          style={{
            padding: "10px 16px", borderRadius: 8, border: "1px solid #0ea5e9",
            background: "#0369a1", color: "white", fontWeight: 600, cursor: "pointer"
          }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {err && (
        <div style={{
          marginTop: 12, padding: 12, background: "#fee2e2",
          color: "#991b1b", borderRadius: 8
        }}>{err}</div>
      )}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {results.map((it) => <Card key={it.uniq_id} item={it} />)}
      </div>

      {!loading && !err && results.length === 0 && (
        <p style={{ marginTop: 28, textAlign: "center", color: "#94a3b8" }}>
          Try: <i>“ergonomic office chair under ₹8000”</i> or <i>“round glass side table”</i>
        </p>
      )}
    </div>
  );
}
