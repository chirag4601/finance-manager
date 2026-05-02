"use client";

import { fmtINR, groupByDay, Palette, Theme } from "@/lib/khaata";
import { Expense } from "@/types";
import { Sparkline } from "./Charts";

type Props = {
  expenses: Expense[];
  theme: Theme;
  p: Palette;
  rangeEnd?: Date;
  days?: number;
  caption?: string;
};

export default function TrendPanel({
  expenses,
  theme,
  p,
  rangeEnd,
  days = 14,
  caption,
}: Props) {
  const buckets = groupByDay(expenses, days, rangeEnd);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const activeDays = buckets.filter((d) => d.total > 0).length;
  const avg = total / Math.max(1, activeDays);
  const peak = buckets.reduce((a, b) => (b.total > a.total ? b : a), buckets[0]);

  return (
    <div
      style={{
        background: p.surface,
        border: `1px solid ${p.border}`,
        borderRadius: 8,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
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
          Daily trend
        </h3>
        <span
          style={{
            fontSize: 11,
            color: p.muted,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {caption ?? `last ${days} days`}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: p.muted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Total
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 18,
              color: p.fg,
              fontVariantNumeric: "tabular-nums",
              marginTop: 2,
            }}
          >
            {fmtINR(total)}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: p.muted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Daily avg
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 18,
              color: p.fg,
              fontVariantNumeric: "tabular-nums",
              marginTop: 2,
            }}
          >
            {fmtINR(Math.round(avg))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              color: p.muted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Peak day
          </div>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 18,
              color: p.fg,
              fontVariantNumeric: "tabular-nums",
              marginTop: 2,
            }}
          >
            {fmtINR(peak?.total ?? 0, { compact: true })}
          </div>
        </div>
      </div>

      <Sparkline data={buckets} theme={theme} height={70} accent={p.accent} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: p.muted,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {buckets[0]?.date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
        <span
          style={{
            fontSize: 10,
            color: p.muted,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {buckets[buckets.length - 1]?.date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
