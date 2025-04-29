"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import UsernameModal from "@/components/UsernameModal";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ExpenseChart from "@/components/ExpenseChart";
import DateFilter from "@/components/DateFilter";
import VoiceInputExpense from "@/components/VoiceInputExpense";
import Loader from "@/components/Loader";

import { Expense, ExpenseFormInput } from "@/types";

const LOCAL_STORAGE_USER_NAME_KEY = "expenseTrackerUsername";

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showVoiceInput, setShowVoiceInput] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState<number | null>(
    null,
  );

  const handleSetUsername = (name: string) => {
    localStorage.setItem(LOCAL_STORAGE_USER_NAME_KEY, name);
    setUsername(name);
    setShowUsernameModal(false);
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem(LOCAL_STORAGE_USER_NAME_KEY);
    if (savedUsername) setUsername(savedUsername);
    else setShowUsernameModal(true);
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!username) return;

      setIsLoading(true);
      try {
        let url = "/api/expenses";
        const params = new URLSearchParams({ username });

        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setFilteredExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [username, startDate, endDate]);

  const handleAddExpense = async (data: ExpenseFormInput) => {
    if (!username) return;

    setIsAddingExpense(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, username }),
      });

      if (response.ok) {
        const newExpense = await response.json();
        setFilteredExpenses((prev) => [newExpense, ...prev]);
        setShowVoiceInput(false);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowVoiceInput(false);
  };

  const handleUpdateExpense = async (data: ExpenseFormInput) => {
    if (!editingExpense) return;

    setIsUpdatingExpense(true);
    try {
      const response = await fetch(
        `/api/expenses/id/?id=${editingExpense.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        const updatedExpense = await response.json();
        setFilteredExpenses((prev) =>
          prev.map((exp) =>
            exp.id === updatedExpense.id ? updatedExpense : exp,
          ),
        );
        setEditingExpense(null);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    setIsDeletingExpense(id);
    try {
      const response = await fetch(`/api/expenses/id/?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok)
        setFilteredExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setIsDeletingExpense(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const toggleVoiceInput = () => {
    setShowVoiceInput(!showVoiceInput);
    if (editingExpense) setEditingExpense(null);
  };

  if (!username || showUsernameModal) {
    return <UsernameModal onSetUsername={handleSetUsername} />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Welcome back, {username}!
              </h1>
              <button
                onClick={() => setShowUsernameModal(true)}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Change Name
              </button>
            </div>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Your personal expense dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingExpense
                      ? "Edit Expense"
                      : showVoiceInput
                        ? "Voice Input"
                        : "Add New Expense"}
                  </h2>
                  <button
                    onClick={toggleVoiceInput}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      showVoiceInput
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                    disabled={!!editingExpense}
                  >
                    {showVoiceInput ? "Use Form" : "Use Voice"}
                  </button>
                </div>

                <>
                  {showVoiceInput ? (
                    <VoiceInputExpense
                      onSubmit={handleAddExpense}
                      onCancel={() => setShowVoiceInput(false)}
                    />
                  ) : (
                    <>
                      <div className="relative">
                        {(isAddingExpense || isUpdatingExpense) && (
                          <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                            <Loader
                              size="medium"
                              text={
                                isUpdatingExpense
                                  ? "Updating expense..."
                                  : "Adding expense..."
                              }
                            />
                          </div>
                        )}
                        <ExpenseForm
                          onSubmit={
                            editingExpense
                              ? handleUpdateExpense
                              : handleAddExpense
                          }
                          initialData={
                            editingExpense
                              ? {
                                  amount: editingExpense.amount.toString(),
                                  category: editingExpense.category,
                                  description: editingExpense.description || "",
                                  date: new Date(editingExpense.date)
                                    .toISOString()
                                    .split("T")[0],
                                }
                              : undefined
                          }
                          isEditing={!!editingExpense}
                        />
                      </div>
                      {editingExpense && (
                        <button
                          onClick={() => setEditingExpense(null)}
                          className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </>
                  )}
                </>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <DateFilter onFilterChange={handleFilterChange} />

                <ExpenseChart
                  isLoading={isLoading}
                  expenses={filteredExpenses}
                />

                <>
                  {isLoading ? (
                    <Loader
                      size="large"
                      text="Loading expenses..."
                      className="py-12"
                    />
                  ) : (
                    <ExpenseList
                      expenses={filteredExpenses}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                      deletingId={isDeletingExpense}
                    />
                  )}
                </>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
