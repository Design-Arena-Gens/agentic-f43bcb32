"use client";

import React from "react";

type Item = { from: "user" | "assistant"; text: string };

export function CommandLog({ items }: { items: Item[] }) {
  return (
    <div className="card log" role="log" aria-live="polite">
      {items.length === 0 ? <div className="log-item" style={{ color: "#6b7280" }}>No conversations yet.</div> : null}
      {items.map((it, idx) => (
        <div key={idx} className="log-item">
          <span className="badge" style={{ marginRight: 8 }}>{it.from === "user" ? "You" : "Assistant"}</span>
          <span>{it.text}</span>
        </div>
      ))}
    </div>
  );
}
