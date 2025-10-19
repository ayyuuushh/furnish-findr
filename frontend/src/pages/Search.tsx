// frontend/src/pages/Search.tsx
import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../lib/api";

type Item = {
  uniq_id: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number | null;
  price_text?: string | null;
  image?: string | null;
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

function ImgWithFallback({ srcDirect }: { srcDirect?: string }) {
  const direct = normalizeUrl(srcDirect);
  const proxy = direct ? `${API_BASE}/api/img?u=${encodeURIComponent(direct)}` : undefined;
  const [src, setSrc] = useState<string | undefined>(direct);
  const usedFallback = useRef(false);

  useEffect(() => {
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
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={onError}
      style={{
        width: 120,
        height: 120,
        objectFit: "cover",
        borderRadius: 8,
        background: "#1e293b",
      }}
    />
  );
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function hit() {
    if (!query.trim()) return;
    setLoading(true);
    setErr(null);
    setResults([]);
    try {
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 8 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResults(json.items || []);
    } catch (e) {
      setErr("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const el = document.getElementById("q") as HTMLInputElement | null;
    el?.focus();
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, color: "#e2e8f0" }}>
      <header
        style={{
          background: "linear-gradient(90deg,#06b6d4,#22d3ee)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          color: "#0b1220",
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        FurnishFindr
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && hit()}
          placeholder="e.g. oak coffee table under ₹10000"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        />
        <button
          onClick={hit}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#06b6d4",
            color: "#0b1220",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {err && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {err}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.map((r) => (
          <div
            key={r.uniq_id}
            style={{
              display: "flex",
              gap: 12,
              padding: 12,
              borderRadius: 10,
              background: "#0b1220",
              border: "1px solid #1f2937",
            }}
          >
            <ImgWithFallback srcDirect={r.image} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#93c5fd", marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>
                <b>{r.brand || "—"}</b> · {r.category || "Uncategorized"}
              </div>
              <div style={{ color: "#facc15" }}>{r.price_text || "₹N/A"}</div>
            </div>
          </div>
        ))}
      </div>

      {!loading && !err && results.length === 0 && (
        <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 24 }}>
          Try: <i>“round glass side table under ₹9000”</i>
        </p>
      )}
    </div>
  );
}
