import React, { useEffect, useState } from "react";
import { analytics } from "../lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await analytics();
        setData(d);
      } catch (e: any) {
        setError(e.message || "Failed to load analytics");
      }
    })();
  }, []);

  if (error) return <div style={{ color: "#991b1b" }}>Error: {error}</div>;
  if (!data) return <div>Loading analytics…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2>Dataset Analytics</h2>
      <pre style={{ background: "#f8fafc", padding: 16, borderRadius: 8 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
