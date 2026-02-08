"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import Loader from "@/components/Loader";
import CategoryIcon from "./CategoryIcon";
import { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  deletingId,
}: ExpenseListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<
    "amount-desc" | "amount-asc" | "date-desc" | "date-asc"
  >("date-desc");

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const sortExpenses = (expenses: Expense[], sortBy: typeof sortOption) => {
    const sorted = [...expenses];

    switch (sortBy) {
      case "amount-desc":
        return sorted.sort((a, b) => b.amount - a.amount);
      case "amount-asc":
        return sorted.sort((a, b) => a.amount - b.amount);
      case "date-desc":
        return sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      case "date-asc":
        return sorted.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      default:
        return sorted;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Recently Added Expenses
        </h2>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
          <option value="date-desc">Date: Recent First</option>
          <option value="date-asc">Date: Oldest First</option>
        </select>
      </div>

      {expenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 bg-gray-50 rounded-lg"
        >
          <p className="text-gray-500">No expenses found</p>
          <p className="text-gray-400 text-sm mt-1">
            Add your first expense to get started
          </p>
        </motion.div>
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <AnimatePresence>
            <>
              {sortExpenses(expenses, sortOption).map((expense) => (
                <motion.li
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                >
                  <div
                    onClick={() => toggleExpand(expense.id)}
                    className="flex justify-between items-center p-4 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 rounded-full p-2 text-indigo-600">
                        <CategoryIcon
                          category={expense.category}
                          size={20}
                          className="opacity-80"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Rs.{expense.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {expense.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    <>
                      {expandedId === expense.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-100 p-4 bg-gray-50"
                        >
                          <>
                            {expense.description && (
                              <p className="text-sm text-gray-600 mb-4">
                                {expense.description}
                              </p>
                            )}
                          </>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => onEdit(expense)}
                              className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                              disabled={deletingId === expense.id}
                            >
                              Edit
                            </button>
                            {deletingId === expense.id ? (
                              <div className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm flex items-center space-x-1">
                                <Loader size="small" />
                                <span>Deleting...</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => onDelete(expense.id)}
                                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </>
                  </AnimatePresence>
                </motion.li>
              ))}
            </>
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
