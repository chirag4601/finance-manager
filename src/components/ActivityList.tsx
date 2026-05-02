"use client";

import { useState } from "react";
import {
  CAT_BY_ID,
  CATEGORIES,
  catColor,
  dayKey,
  exportCSV,
  fmtDate,
  fmtINR,
  Palette,
  Theme,
  useIsMobile,
} from "@/lib/khaata";
import { Expense } from "@/types";

type Props = {
  expenses: Expense[];
  theme: Theme;
  p: Palette;
  onEdit: (e: Expense) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
};

export default function ActivityList({
  expenses,
  theme,
  p,
  onEdit,
  onDelete,
  deletingId,
  selectedCategory,
  onSelectCategory,
}: Props) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const filtered = expenses.filter((e) => {
    if (selectedCategory && e.category !== selectedCategory) return false;
    if (query) {
      const q = query.toLowerCase();
      const cat = CAT_BY_ID[e.category]?.name.toLowerCase() || "";
      return (
        (e.description || "").toLowerCase().includes(q) ||
        cat.includes(q) ||
        String(e.amount).includes(q)
      );
    }
    return true;
  });

  const groups: Record<
    string,
    { date: string | Date; items: Expense[]; total: number }
  > = {};
  filtered.forEach((e) => {
    const k = dayKey(e.date);
    if (!groups[k]) groups[k] = { date: e.date, items: [], total: 0 };
    groups[k].items.push(e);
    groups[k].total += e.amount;
  });
  const groupList = Object.values(groups).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

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
          marginBottom: 12,
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
          Activity
        </h3>
        <button
          onClick={() => exportCSV(filtered)}
          style={{
            background: "transparent",
            border: `1px solid ${p.border}`,
            borderRadius: 999,
            padding: "5px 10px",
            fontSize: 11,
            color: p.muted,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Export CSV
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 160px",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search descriptions, categories, amounts…"
          style={{
            padding: "8px 10px",
            background: p.surface2,
            border: `1px solid ${p.border}`,
            borderRadius: 6,
            fontSize: 12,
            color: p.fg,
            fontFamily: "Inter, sans-serif",
            outline: "none",
          }}
        />
        <select
          value={selectedCategory || ""}
          onChange={(e) => onSelectCategory(e.target.value || null)}
          style={{
            padding: "8px 10px",
            background: p.surface2,
            border: `1px solid ${p.border}`,
            borderRadius: 6,
            fontSize: 12,
            color: p.fg,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          maxHeight: 460,
          overflowY: "auto",
          margin: "0 -8px",
          padding: "0 8px",
        }}
      >
        {groupList.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: p.muted,
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
            }}
          >
            No matches.
          </div>
        )}
        {groupList.map((g) => (
          <div key={dayKey(g.date)} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: `1px solid ${p.border}`,
                fontSize: 10,
                color: p.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span>{fmtDate(g.date, "rel")}</span>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                {fmtINR(g.total)}
              </span>
            </div>
            {g.items.map((e) => {
              const cat = CAT_BY_ID[e.category] || {
                id: e.category,
                name: e.category,
                hue: 0,
              };
              const expanded = expandedId === e.id;
              return (
                <div
                  key={e.id}
                  style={{
                    borderBottom: `1px solid ${p.borderSoft}`,
                  }}
                >
                  <div
                    onClick={() =>
                      setExpandedId(expanded ? null : e.id)
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns: "12px 1fr auto",
                      gap: 12,
                      padding: "14px 14px",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: catColor(cat.hue, theme),
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: p.fg,
                          fontFamily: "Inter, sans-serif",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.description || cat.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: p.muted,
                          fontFamily: "Inter, sans-serif",
                          marginTop: 1,
                        }}
                      >
                        {cat.name} · {fmtDate(e.date, "time")}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 14,
                        color: p.fg,
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 500,
                      }}
                    >
                      {fmtINR(e.amount)}
                    </div>
                  </div>
                  {expanded && (
                    <div
                      style={{
                        padding: "0 14px 14px",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={() => {
                          onEdit(e);
                          setExpandedId(null);
                        }}
                        disabled={deletingId === e.id}
                        style={{
                          background: "transparent",
                          border: `1px solid ${p.border}`,
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 11,
                          color: p.fg,
                          fontFamily: "Inter, sans-serif",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(e.id)}
                        disabled={deletingId === e.id}
                        style={{
                          background: "transparent",
                          border: `1px solid ${p.border}`,
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 11,
                          color: deletingId === e.id ? p.muted : p.fg,
                          fontFamily: "Inter, sans-serif",
                          cursor:
                            deletingId === e.id ? "not-allowed" : "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {deletingId === e.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
