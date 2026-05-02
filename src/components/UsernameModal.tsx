"use client";

import { useState } from "react";
import { palette, Theme } from "@/lib/khaata";

export default function UsernameModal({
  onSetUsername,
  theme = "light",
}: {
  onSetUsername: (username: string) => void;
  theme?: Theme;
}) {
  const [input, setInput] = useState("");
  const p = palette(theme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSetUsername(input.trim());
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: p.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 10,
          padding: 32,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: p.muted,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontFamily: '"JetBrains Mono", monospace',
            marginBottom: 12,
          }}
        >
          Khaata · expense ledger
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: '"Instrument Serif", serif',
            fontSize: 40,
            fontWeight: 400,
            color: p.fg,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Welcome.
        </h2>
        <p
          style={{
            marginTop: 10,
            marginBottom: 24,
            color: p.muted,
            fontSize: 14,
          }}
        >
          Your name keeps your ledger separate. No accounts, no passwords.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "12px 14px",
              background: p.surface2,
              border: `1px solid ${p.border}`,
              borderRadius: 6,
              fontSize: 14,
              color: p.fg,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: 16,
              width: "100%",
              padding: "12px",
              background: p.fg,
              color: p.bg,
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
          >
            Begin
          </button>
        </form>
      </div>
    </div>
  );
}
