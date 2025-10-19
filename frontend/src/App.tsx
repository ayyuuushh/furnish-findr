import React, { useState } from "react";
import Search from "./pages/Search";
import Analytics from "./pages/Analytics";

export default function App() {
  const [tab, setTab] = useState<"search" | "analytics">("search");

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#0f172a" }}>
      <header style={{
        background: "linear-gradient(90deg,#06b6d4,#22d3ee)",
        color: "white", padding: "16px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <h1 style={{ margin: 0, fontSize: 20, letterSpacing: 0.2 }}>FurnishFindr</h1>
        <nav style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setTab("search")}
            style={{
              padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.5)",
              background: tab === "search" ? "rgba(255,255,255,0.2)" : "transparent",
              color: "white", cursor: "pointer"
            }}
          >
            Search
          </button>
          <button
            onClick={() => setTab("analytics")}
            style={{
              padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.5)",
              background: tab === "analytics" ? "rgba(255,255,255,0.2)" : "transparent",
              color: "white", cursor: "pointer"
            }}
          >
            Analytics
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        {tab === "search" ? <Search /> : <Analytics />}
      </main>
      <footer style={{ color: "#94a3b8", textAlign: "center", padding: 16 }}>© {new Date().getFullYear()} FurnishFindr</footer>
    </div>
  );
}
