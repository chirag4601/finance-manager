import { useSyncExternalStore } from "react";
import { Expense } from "@/types";

export function useMediaQuery(query: string): boolean {
  const subscribe = (cb: () => void) => {
    if (typeof window === "undefined") return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
  const getSnapshot = () =>
    typeof window !== "undefined" && window.matchMedia(query).matches;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 900px)");
}

export type Theme = "light" | "dark";

export type Palette = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderSoft: string;
  fg: string;
  muted: string;
  mutedSoft: string;
  accent: string;
};

export function palette(theme: Theme): Palette {
  if (theme === "dark") {
    return {
      bg: "#0a0a0c",
      surface: "#16161a",
      surface2: "#1d1d22",
      border: "#2c2c33",
      borderSoft: "#222229",
      fg: "#f4f1ea",
      muted: "#a8a59c",
      mutedSoft: "#7a7770",
      accent: "oklch(0.82 0.16 180)",
    };
  }
  return {
    bg: "#f7f5ee",
    surface: "#fafaf7",
    surface2: "#f0eee6",
    border: "#e6e4dd",
    borderSoft: "#efeee7",
    fg: "#1a1a1a",
    muted: "#76746e",
    mutedSoft: "#9a9a9d",
    accent: "oklch(0.55 0.13 180)",
  };
}

export type CategoryMeta = { id: string; name: string; hue: number };

export const CATEGORIES: CategoryMeta[] = [
  { id: "Grocery", name: "Grocery", hue: 152 },
  { id: "Dining", name: "Dining", hue: 28 },
  { id: "Housing/Rent", name: "Housing/Rent", hue: 250 },
  { id: "Transportation (Intracity)", name: "Transport", hue: 180 },
  { id: "Entertainment", name: "Entertainment", hue: 320 },
  { id: "Utilities", name: "Utilities", hue: 220 },
  { id: "Medicines", name: "Medicines", hue: 358 },
  { id: "Shopping", name: "Shopping", hue: 290 },
  { id: "Office Spends", name: "Office", hue: 45 },
  { id: "Personal", name: "Personal", hue: 280 },
  { id: "Travel", name: "Travel", hue: 195 },
  { id: "Other", name: "Other", hue: 0 },
];

export const CAT_BY_ID: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export function catColor(hue: number, theme: Theme): string {
  const c = theme === "dark" ? 0.17 : 0.12;
  const l = theme === "dark" ? 0.74 : 0.6;
  return `oklch(${l} ${c} ${hue})`;
}

export function fmtINR(
  n: number,
  opts: { decimals?: number; compact?: boolean } = {},
): string {
  const { decimals = 0, compact = false } = opts;
  if (compact && Math.abs(n) >= 100000)
    return "₹" + (n / 100000).toFixed(1) + "L";
  if (compact && Math.abs(n) >= 1000) return "₹" + (n / 1000).toFixed(1) + "k";
  return (
    "₹" +
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

export function fmtDate(
  iso: string | Date,
  fmt: "short" | "rel" | "time" = "short",
): string {
  const d = new Date(iso);
  const now = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  if (fmt === "rel") {
    if (same(d, now)) return "Today";
    if (same(d, yest)) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  if (fmt === "time")
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dayKey(d: string | Date): string {
  const x = new Date(d);
  return (
    x.getFullYear() +
    "-" +
    String(x.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(x.getDate()).padStart(2, "0")
  );
}

export type CategorySummary = CategoryMeta & { total: number };

export function groupByCategory(list: Expense[]): CategorySummary[] {
  const map = new Map<string, number>();
  list.forEach((e) =>
    map.set(e.category, (map.get(e.category) || 0) + e.amount),
  );
  return CATEGORIES.map((c) => ({ ...c, total: map.get(c.id) || 0 }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

export type DayBucket = { date: Date; key: string; total: number };

export function groupByDay(
  list: Expense[],
  days = 14,
  endRef: Date = new Date(),
): DayBucket[] {
  const buckets: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endRef);
    d.setDate(endRef.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.push({ date: d, key: dayKey(d), total: 0 });
  }
  const idx = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
  list.forEach((e) => {
    const k = dayKey(e.date);
    if (k in idx) buckets[idx[k]].total += e.amount;
  });
  return buckets;
}

export function exportCSV(list: Expense[]): void {
  const rows: (string | number)[][] = [
    ["Date", "Amount (INR)", "Category", "Description"],
  ];
  list.forEach((e) => {
    rows.push([
      new Date(e.date).toISOString(),
      e.amount,
      e.category,
      (e.description || "").replace(/"/g, '""'),
    ]);
  });
  const csv = rows
    .map((r) =>
      r
        .map((v) => (/[",\n]/.test(String(v)) ? `"${v}"` : String(v)))
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses-" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
}
