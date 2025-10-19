import React, { useEffect, useState } from "react";
import { recommend } from "../lib/api";

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

function imageProxy(url?: string | null) {
  if (!url) return undefined;
  const clean = url.replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}`;
}

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
      setError(`Server ${e.message?.includes("404") ? "404" : ""}: ${e.message || "Error"}`);
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
          const img = imageProxy(r.image);
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
              {img ? (
                <img
                  src={img}
                  alt={r.title}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    objectFit: "cover",
                    background: "#1e293b",
                  }}
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.display = "none")
                  }
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    background: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                  }}
                >
                  No Image
                </div>
              )}
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
