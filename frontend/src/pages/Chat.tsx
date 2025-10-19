import React, { useState } from "react";
import ProductCard from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setItems([]);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, k: 8 }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        // ✅ Graceful "No results found" handling
        if (res.status === 404 || res.status === 422 || txt.includes("[]")) {
          setItems([]);
          setError("No matching furniture found. Try refining your query.");
          return;
        }
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }

      const data = await res.json();

      // ✅ Handle empty response properly
      if (!data?.items?.length) {
        setError("No matching furniture found. Try refining your query.");
        setItems([]);
        return;
      }

      setItems(Array.isArray(data.items) ? data.items : data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.name === "AbortError"
          ? "⏱️ Request timed out. Try again."
          : "⚠️ Something went wrong while fetching recommendations."
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>
        🪑 Furniture Recommendation Chat
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Ask e.g. 'modern oak coffee table under ₹10000'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 15,
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          style={{
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          {loading ? "Thinking…" : "Recommend"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: 10,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginTop: 40,
            fontSize: 16,
          }}
        >
          🔍 Fetching recommendations…
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          {items.map((item: any, idx: number) => (
            <ProductCard key={idx} item={item} />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p style={{ color: "#6b7280", marginTop: 40, textAlign: "center" }}>
          Ask for furniture recommendations above 👆
        </p>
      )}
    </div>
  );
}
