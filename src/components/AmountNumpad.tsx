"use client";

import { Palette, Theme, useIsMobile } from "@/lib/khaata";

type Props = {
  value: number;
  onChange: (v: number) => void;
  theme: Theme;
  p: Palette;
};

export default function AmountNumpad({ value, onChange, theme, p }: Props) {
  const display = value === 0 ? "0" : value.toLocaleString("en-IN");
  const isMobile = useIsMobile();
  const press = (key: string) => {
    if (key === "back") return onChange(Math.floor(value / 10));
    if (key === "00") {
      const n = parseInt((value === 0 ? "0" : String(value)) + "00", 10);
      return onChange(isNaN(n) ? 0 : n);
    }
    const n = parseInt((value === 0 ? "0" : String(value)) + key, 10);
    if (!isNaN(n) && n < 10_000_000) onChange(n);
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          padding: isMobile ? "12px 0 10px" : "20px 0 14px",
          borderBottom: `1px solid ${p.border}`,
        }}
      >
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: isMobile ? 22 : 18,
            color: p.muted,
          }}
        >
          ₹
        </span>
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: isMobile ? 40 : 56,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: value === 0 ? p.muted : p.fg,
            fontVariantNumeric: "tabular-nums",
            flex: 1,
          }}
        >
          {display}
        </span>
        <button
          onClick={() => onChange(0)}
          disabled={value === 0}
          style={{
            fontSize: 11,
            color: p.muted,
            background: "transparent",
            border: "none",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: "pointer",
            opacity: value === 0 ? 0.3 : 1,
          }}
        >
          Clear
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          marginTop: 10,
        }}
      >
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            style={{
              padding: isMobile ? "9px 0" : "14px 0",
              background: p.surface2,
              border: `1px solid ${p.border}`,
              borderRadius: 6,
              fontSize: isMobile ? 15 : 18,
              fontFamily: '"JetBrains Mono", monospace',
              color: p.fg,
              cursor: "pointer",
              transition: "background .12s",
              fontWeight: 500,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                theme === "dark" ? "#26262c" : "#f3f1ea")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = p.surface2)}
          >
            {k === "back" ? "⌫" : k}
          </button>
        ))}
      </div>
    </div>
  );
}
