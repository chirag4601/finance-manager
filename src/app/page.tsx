"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ExpenseChart from "@/components/ExpenseChart";
import DateFilter from "@/components/DateFilter";
import { Expense, ExpenseFormInput } from "@/types";

export default function Home() {
  // const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch expenses

  // Initial fetch
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        let url = "/api/expenses";
        const params = new URLSearchParams();

        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        // setExpenses(data)
        setFilteredExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [startDate, endDate]);

  // Add expense
  const handleAddExpense = async (data: ExpenseFormInput) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newExpense = await response.json();
        // setExpenses((prev) => [newExpense, ...prev])
        setFilteredExpenses((prev) => [newExpense, ...prev]);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  // Edit expense
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  // Update expense
  const handleUpdateExpense = async (data: ExpenseFormInput) => {
    if (!editingExpense) return;

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
        // setExpenses((prev) =>
        //     prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
        // )
        setFilteredExpenses((prev) =>
          prev.map((exp) =>
            exp.id === updatedExpense.id ? updatedExpense : exp,
          ),
        );
        setEditingExpense(null);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: number) => {
    try {
      const response = await fetch(`/api/expenses/id/?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // setExpenses((prev) => prev.filter((exp) => exp.id !== id))
        setFilteredExpenses((prev) => prev.filter((exp) => exp.id !== id));
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Handle filter change
  const handleFilterChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Personal Finance Manager
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Track, manage, and visualize your expenses
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h2>
                <ExpenseForm
                  onSubmit={
                    editingExpense ? handleUpdateExpense : handleAddExpense
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

                {editingExpense && (
                  <button
                    onClick={() => setEditingExpense(null)}
                    className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel Editing
                  </button>
                )}
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

                <ExpenseChart expenses={filteredExpenses} />

                {isLoading ? (
                  <div className="text-center py-12">
                    <svg
                      className="animate-spin h-8 w-8 mx-auto text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-2 text-gray-500">Loading expenses...</p>
                  </div>
                ) : (
                  <ExpenseList
                    expenses={filteredExpenses}
                    onEdit={handleEditExpense}
                    onDelete={handleDeleteExpense}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
