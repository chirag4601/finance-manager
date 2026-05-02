"use client";

import { useCallback, useEffect, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";

import { Moon, Sun, UserCircle } from "phosphor-react";

import UsernameModal from "@/components/UsernameModal";
import DateFilter from "@/components/DateFilter";
import AddExpensePanel from "@/components/AddExpensePanel";
import ChartPanel from "@/components/ChartPanel";
import ActivityList from "@/components/ActivityList";

import { palette, Theme, useIsMobile } from "@/lib/khaata";
import { Expense, ExpenseFormInput } from "@/types";

const LOCAL_STORAGE_USER_NAME_KEY = "expenseTrackerUsername";
const LOCAL_STORAGE_THEME_KEY = "khaataTheme";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [startDate, setStartDate] = useState(() =>
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(() =>
    format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const p = palette(theme);
  const isMobile = useIsMobile();

  const handleSetUsername = (name: string) => {
    localStorage.setItem(LOCAL_STORAGE_USER_NAME_KEY, name);
    setUsername(name);
    setShowUsernameModal(false);
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY);
    if (savedUsername) setUsername(savedUsername);
    else setShowUsernameModal(true);

    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as
      | Theme
      | null;
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.body.style.background = p.bg;
    document.body.style.color = p.fg;
  }, [p.bg, p.fg]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!username) return;
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ username });
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const response = await fetch(`/api/expenses?${params.toString()}`);
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [username, startDate, endDate]);

  const handleFilterChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleAddOrUpdate = async (
    data: ExpenseFormInput,
  ): Promise<Expense | null> => {
    if (!username) return null;
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        const res = await fetch(`/api/expenses/id/?id=${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) return null;
        const updated: Expense = await res.json();
        setExpenses((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e)),
        );
        setEditingExpense(null);
        return updated;
      } else {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, username }),
        });
        if (!res.ok) return null;
        const created: Expense = await res.json();
        setExpenses((prev) => [created, ...prev]);
        return created;
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/id/?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, next);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (!username || showUsernameModal) {
    return <UsernameModal onSetUsername={handleSetUsername} theme={theme} />;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: p.bg,
        color: p.fg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "20px 16px 40px" : "32px 40px 48px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "flex-end",
            justifyContent: "space-between",
            marginBottom: isMobile ? 16 : 28,
            paddingBottom: isMobile ? 12 : 20,
            borderBottom: `1px solid ${p.border}`,
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {!isMobile && (
              <div
                style={{
                  fontSize: 11,
                  color: p.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontFamily: '"JetBrains Mono", monospace',
                  marginBottom: 8,
                }}
              >
                Ledger · {today}
              </div>
            )}
            <h1
              style={{
                margin: 0,
                fontFamily: '"Instrument Serif", serif',
                fontSize: isMobile ? 28 : 56,
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: p.fg,
                lineHeight: 1.05,
                wordBreak: "break-word",
              }}
            >
              {isMobile ? "Hi, " : "Welcome, "}
              <em style={{ fontStyle: "italic", color: p.accent }}>
                {username}.
              </em>
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {isMobile ? (
              <>
                <button
                  onClick={toggleTheme}
                  aria-label={theme === "light" ? "Switch to dark" : "Switch to light"}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: "transparent",
                    color: p.muted,
                    border: `1px solid ${p.border}`,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {theme === "light" ? (
                    <Moon size={16} weight="regular" />
                  ) : (
                    <Sun size={16} weight="regular" />
                  )}
                </button>
                <button
                  onClick={() => setShowUsernameModal(true)}
                  aria-label="Change name"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: "transparent",
                    color: p.muted,
                    border: `1px solid ${p.border}`,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCircle size={18} weight="regular" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: "transparent",
                    color: p.muted,
                    border: `1px solid ${p.border}`,
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {theme === "light" ? "Dark" : "Light"}
                </button>
                <button
                  onClick={() => setShowUsernameModal(true)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: "transparent",
                    color: p.muted,
                    border: `1px solid ${p.border}`,
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  Change name
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile: Add comes first, then filter, then analytics */}
        {isMobile && (
          <div style={{ marginBottom: 16 }}>
            <AddExpensePanel
              theme={theme}
              p={p}
              initialData={editingExpense}
              onSubmit={handleAddOrUpdate}
              isSubmitting={isSubmitting}
              onCancelEdit={() => setEditingExpense(null)}
            />
          </div>
        )}

        {/* Date filter row */}
        <div style={{ marginBottom: 20 }}>
          <DateFilter onFilterChange={handleFilterChange} p={p} />
        </div>

        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "380px 1fr",
            gap: 16,
          }}
        >
          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AddExpensePanel
                theme={theme}
                p={p}
                initialData={editingExpense}
                onSubmit={handleAddOrUpdate}
                isSubmitting={isSubmitting}
                onCancelEdit={() => setEditingExpense(null)}
              />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ChartPanel
              expenses={expenses}
              theme={theme}
              p={p}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <ActivityList
              expenses={expenses}
              theme={theme}
              p={p}
              onEdit={(e) => {
                setEditingExpense(e);
                if (isMobile)
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onDelete={handleDelete}
              deletingId={deletingId}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            paddingTop: 16,
            borderTop: `1px solid ${p.border}`,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: p.muted,
            fontFamily: '"JetBrains Mono", monospace',
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          <span>Khaata · expense ledger</span>
          <span>{expenses.length} entries on file</span>
        </div>
      </div>
    </main>
  );
}
