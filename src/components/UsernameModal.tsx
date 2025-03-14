"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function UsernameModal({
  onSetUsername,
}: {
  onSetUsername: (username: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSetUsername(input.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-xl"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Welcome! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please enter your name to continue tracking expenses.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg bg-white dark:bg-gray-700 dark:text-gray-100"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="mt-6 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
