"use client";

import { useState } from "react";
import {
  catColor,
  CategorySummary,
  fmtINR,
  groupByCategory,
  Palette,
  Theme,
  useIsMobile,
} from "@/lib/khaata";
import { Expense } from "@/types";
import { PieChart } from "./Charts";

type Props = {
  expenses: Expense[];
  theme: Theme;
  p: Palette;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
};

export default function ChartPanel({
  expenses,
  theme,
  p,
  selectedCategory,
  onSelectCategory,
}: Props) {
  const [hover, setHover] = useState<CategorySummary | null>(null);
  const isMobile = useIsMobile();
  const chartSize = isMobile ? 180 : 220;
  const grouped = groupByCategory(expenses);
  const total = grouped.reduce((s, g) => s + g.total, 0);
  const selected = selectedCategory
    ? grouped.find((g) => g.id === selectedCategory) || null
    : null;
  const center = hover || selected || grouped[0];

  return (
    <div
      style={{
        background: p.surface,
        border: `1px solid ${p.border}`,
        borderRadius: 8,
        padding: isMobile ? 16 : 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: '"Instrument Serif", serif',
            fontSize: 26,
            fontWeight: 400,
            color: p.fg,
            letterSpacing: "-0.01em",
          }}
        >
          By category
        </h3>
        <span
          style={{
            fontSize: 11,
            color: p.muted,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : `${chartSize}px 1fr`,
          gap: isMobile ? 16 : 24,
          alignItems: "center",
          justifyItems: isMobile ? "center" : "start",
        }}
      >
        <div
          style={{
            position: "relative",
            width: chartSize,
            height: chartSize,
          }}
        >
          <PieChart
            data={grouped}
            theme={theme}
            size={chartSize}
            donut
            onHover={setHover}
          />
          {center && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: p.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {hover || selected ? center.name : "Total"}
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 22,
                  color: p.fg,
                  fontWeight: 500,
                  marginTop: 2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmtINR(hover || selected ? center.total : total, {
                  compact: true,
                })}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: p.muted,
                  marginTop: 2,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {hover || selected
                  ? Math.round((center.total / total) * 100) + "%"
                  : "this period"}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            width: "100%",
          }}
        >
          {grouped.length === 0 && (
            <div
              style={{
                color: p.muted,
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
              }}
            >
              No expenses in this range yet.
            </div>
          )}
          {grouped.map((g) => {
            const pct = total ? (g.total / total) * 100 : 0;
            const isHover = hover?.id === g.id;
            const isSelected = selectedCategory === g.id;
            return (
              <div
                key={g.id}
                onMouseEnter={() => setHover(g)}
                onMouseLeave={() => setHover(null)}
                onClick={() =>
                  onSelectCategory(isSelected ? null : g.id)
                }
                style={{
                  display: "grid",
                  gridTemplateColumns: "12px 1fr auto auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "5px 8px",
                  borderRadius: 4,
                  background:
                    isHover || isSelected ? p.surface2 : "transparent",
                  outline: isSelected ? `1px solid ${p.fg}` : "none",
                  cursor: "pointer",
                  transition: "background .12s",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: catColor(g.hue, theme),
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    color: p.fg,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {g.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: p.muted,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {pct.toFixed(0)}%
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: p.fg,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {fmtINR(g.total)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
