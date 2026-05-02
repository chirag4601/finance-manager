"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIES,
  catColor,
  fmtINR,
  Palette,
  Theme,
  useIsMobile,
} from "@/lib/khaata";
import { ExpenseFormInput, Expense } from "@/types";
import AmountNumpad from "./AmountNumpad";

type Props = {
  theme: Theme;
  p: Palette;
  initialData?: Expense | null;
  onSubmit: (data: ExpenseFormInput) => Promise<Expense | null | void>;
  isSubmitting: boolean;
  onCancelEdit?: () => void;
};

function Label({ children, p }: { children: React.ReactNode; p: Palette }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: p.muted,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 6,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

export default function AddExpensePanel({
  theme,
  p,
  initialData,
  onSubmit,
  isSubmitting,
  onCancelEdit,
}: Props) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [justAdded, setJustAdded] = useState<{
    amount: number;
    category: string;
  } | null>(null);
  const isMobile = useIsMobile();

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setAmount(Math.round(initialData.amount));
      setCategory(initialData.category);
      setDescription(initialData.description || "");
      setDate(new Date(initialData.date).toISOString().split("T")[0]);
    }
  }, [initialData]);

  const canSubmit = amount > 0 && !!category && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    const payload: ExpenseFormInput = {
      amount: String(amount),
      category: category!,
      description,
      date: date || undefined,
    };
    const result = await onSubmit(payload);
    if (result !== null && !isEditing) {
      setJustAdded({ amount, category: category! });
      setAmount(0);
      setCategory(null);
      setDescription("");
      setDate("");
      setTimeout(() => setJustAdded(null), 2200);
    }
  };

  return (
    <div
      style={{
        background: p.surface,
        border: `1px solid ${p.border}`,
        borderRadius: 8,
        padding: isMobile ? 16 : 24,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: '"Instrument Serif", serif',
            fontSize: isMobile ? 22 : 26,
            fontWeight: 400,
            color: p.fg,
            letterSpacing: "-0.01em",
          }}
        >
          {isEditing ? "Edit expense" : "New expense"}
        </h3>
        {isEditing && onCancelEdit && (
          <button
            onClick={onCancelEdit}
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
            Cancel
          </button>
        )}
      </div>
      {!isMobile && (
        <p
          style={{
            margin: 0,
            color: p.muted,
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Type an amount, pick a category, done.
        </p>
      )}

      <AmountNumpad value={amount} onChange={setAmount} theme={theme} p={p} />

      <div style={{ marginTop: 18 }}>
        <Label p={p}>Category</Label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
          }}
        >
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 10px",
                  background: active ? p.surface2 : "transparent",
                  border: `1px solid ${active ? p.fg : p.border}`,
                  borderRadius: 6,
                  fontSize: 12,
                  color: p.fg,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "left",
                  transition: "all .12s",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: catColor(c.hue, theme),
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 140px",
          gap: 8,
          marginTop: 14,
        }}
      >
        <div>
          <Label p={p}>Description (optional)</Label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Lunch with team"
            style={{
              width: "100%",
              padding: "9px 10px",
              background: p.surface2,
              border: `1px solid ${p.border}`,
              borderRadius: 6,
              fontSize: 13,
              color: p.fg,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <Label p={p}>Date</Label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 10px",
              background: p.surface2,
              border: `1px solid ${p.border}`,
              borderRadius: 6,
              fontSize: 13,
              color: p.fg,
              fontFamily: "Inter, sans-serif",
              outline: "none",
              boxSizing: "border-box",
              colorScheme: theme,
            }}
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "12px",
          background: canSubmit ? p.fg : p.border,
          color: canSubmit ? p.bg : p.muted,
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.02em",
          cursor: canSubmit ? "pointer" : "not-allowed",
          transition: "all .12s",
        }}
      >
        {isSubmitting
          ? isEditing
            ? "Updating…"
            : "Saving…"
          : justAdded
            ? "✓ Added"
            : isEditing
              ? "Update expense"
              : "Record expense"}
      </button>

      {justAdded && (
        <div
          style={{
            position: "absolute",
            bottom: -34,
            left: 0,
            right: 0,
            padding: "8px 12px",
            background: p.fg,
            color: p.bg,
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            borderRadius: 6,
          }}
        >
          {fmtINR(justAdded.amount)} · {justAdded.category}
        </div>
      )}
    </div>
  );
}
