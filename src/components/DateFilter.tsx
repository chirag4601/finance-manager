"use client";

import { useEffect, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CaretLeft, CaretRight } from "phosphor-react";
import { Palette } from "@/lib/khaata";

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  onRangeChange?: (end: Date) => void;
  p: Palette;
}

type Mode = "month" | "custom";

export default function DateFilter({
  onFilterChange,
  onRangeChange,
  p,
}: DateFilterProps) {
  const today = new Date();
  const [mode, setMode] = useState<Mode>("month");
  const [anchor, setAnchor] = useState<Date>(startOfMonth(today));
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const isCurrentMonth = isSameMonth(anchor, today);

  useEffect(() => {
    if (mode !== "month") return;
    onFilterChange(
      format(startOfMonth(anchor), "yyyy-MM-dd"),
      format(endOfMonth(anchor), "yyyy-MM-dd"),
    );
    onRangeChange?.(endOfMonth(anchor));
  }, [anchor, mode, onFilterChange, onRangeChange]);

  const goPrev = () => setAnchor((d) => subMonths(d, 1));
  const goNext = () => {
    if (isCurrentMonth) return;
    setAnchor((d) => addMonths(d, 1));
  };

  const resetToThisMonth = () => {
    setMode("month");
    setAnchor(startOfMonth(today));
  };

  const applyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      onFilterChange(customStartDate, customEndDate);
      onRangeChange?.(new Date(customEndDate));
    }
  };

  const label = isCurrentMonth
    ? `This month · ${format(anchor, "MMM yyyy")}`
    : isSameMonth(anchor, subMonths(today, 1))
      ? `Last month · ${format(anchor, "MMM yyyy")}`
      : format(anchor, "MMMM yyyy");

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px",
    borderRadius: 999,
    background: active ? p.fg : "transparent",
    color: active ? p.bg : p.muted,
    border: `1px solid ${active ? p.fg : p.border}`,
    fontSize: 11,
    fontFamily: "Inter, sans-serif",
    cursor: "pointer",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: 500,
    transition: "all .15s",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          border: `1px solid ${mode === "month" ? p.fg : p.border}`,
          borderRadius: 999,
          overflow: "hidden",
          background: mode === "month" ? p.fg : "transparent",
          color: mode === "month" ? p.bg : p.muted,
          transition: "all .15s",
        }}
      >
        <button
          onClick={goPrev}
          aria-label="Previous month"
          style={{
            padding: "0 10px",
            background: "transparent",
            color: "inherit",
            border: "none",
            cursor: "pointer",
          }}
        >
          <CaretLeft size={14} weight="bold" />
        </button>
        <button
          onClick={() => setMode("month")}
          style={{
            padding: "7px 4px",
            minWidth: "8.5rem",
            textAlign: "center",
            background: "transparent",
            color: "inherit",
            border: "none",
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
        <button
          onClick={goNext}
          disabled={isCurrentMonth}
          aria-label="Next month"
          style={{
            padding: "0 10px",
            background: "transparent",
            color: "inherit",
            border: "none",
            cursor: isCurrentMonth ? "not-allowed" : "pointer",
            opacity: isCurrentMonth ? 0.3 : 1,
          }}
        >
          <CaretRight size={14} weight="bold" />
        </button>
      </div>

      {!isCurrentMonth && mode === "month" && (
        <button onClick={resetToThisMonth} style={pillStyle(false)}>
          Jump to this month
        </button>
      )}

      <button onClick={() => setMode("custom")} style={pillStyle(mode === "custom")}>
        Custom
      </button>

      {mode === "custom" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            style={{
              padding: "6px 10px",
              background: p.surface2,
              border: `1px solid ${p.border}`,
              borderRadius: 999,
              fontSize: 11,
              color: p.fg,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              colorScheme: p.bg === "#0a0a0c" ? "dark" : "light",
            }}
          />
          <span style={{ color: p.muted, fontSize: 11 }}>to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            style={{
              padding: "6px 10px",
              background: p.surface2,
              border: `1px solid ${p.border}`,
              borderRadius: 999,
              fontSize: 11,
              color: p.fg,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              colorScheme: p.bg === "#0a0a0c" ? "dark" : "light",
            }}
          />
          <button onClick={applyCustomFilter} style={pillStyle(true)}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
