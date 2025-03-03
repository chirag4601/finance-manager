'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Expense } from '@/types'

interface ExpenseListProps {
    expenses: Expense[]
    onEdit: (expense: Expense) => void
    onDelete: (id: number) => void
}

export default function ExpenseList({
                                        expenses,
                                        onEdit,
                                        onDelete
                                    }: ExpenseListProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null)

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id)
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Recently Added Expenses</h2>

            {expenses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 bg-gray-50 rounded-lg"
                >
                    <p className="text-gray-500">No expenses found</p>
                    <p className="text-gray-400 text-sm mt-1">Add your first expense to get started</p>
                </motion.div>
            ) : (
                <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                >
                    <AnimatePresence>
                        {expenses.map((expense) => (
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
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                Rs.{expense.amount.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-gray-500">{expense.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(expense.date), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === expense.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-gray-100 p-4 bg-gray-50"
                                        >
                                            {expense.description && (
                                                <p className="text-sm text-gray-600 mb-4">{expense.description}</p>
                                            )}
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => onEdit(expense)}
                                                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete(expense.id)}
                                                    className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            )}
        </div>
    )
}