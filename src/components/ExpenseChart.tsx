"use client";

import { useEffect, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { motion } from "framer-motion";

import Loader from "@/components/Loader";
import { Expense } from "@/types";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ExpenseChartProps {
  expenses: Expense[];
  isLoading: boolean;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

export default function ExpenseChart({
  expenses,
  isLoading,
  selectedCategory,
  setSelectedCategory,
}: ExpenseChartProps) {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setTheme(darkModeQuery.matches ? "dark" : "light");

      const handler = (e: MediaQueryListEvent) =>
        setTheme(e.matches ? "dark" : "light");
      darkModeQuery.addEventListener("change", handler);
      return () => darkModeQuery.removeEventListener("change", handler);
    }
  }, []);

  // Filter expenses by selected category if any
  const filteredExpenses = selectedCategory
    ? expenses.filter((exp) => exp.category === selectedCategory)
    : expenses;

  // Process data for charts
  const categoryData = filteredExpenses.reduce(
    (acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const categories = Object.keys(categoryData);
  const amounts = Object.values(categoryData);
  const total = amounts.reduce((a, b) => a + b, 0);

  const generateConsistentColors = (categories: string[]) => {
    const baseColors = [
      { h: 210, s: 100, l: 60 }, // Blue
      { h: 160, s: 100, l: 45 }, // Green
      { h: 335, s: 100, l: 60 }, // Pink
      { h: 40, s: 100, l: 50 }, // Orange
      { h: 275, s: 100, l: 60 }, // Purple
      { h: 190, s: 100, l: 45 }, // Teal
      { h: 0, s: 100, l: 60 }, // Red
      { h: 60, s: 100, l: 50 }, // Yellow
    ];

    return categories.map((category, index) => {
      const baseColor = baseColors[index % baseColors.length];
      const hueOffset =
        (category.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
          20) -
        10;

      const luminance = theme === "dark" ? baseColor.l + 10 : baseColor.l;

      return {
        base: `hsl(${baseColor.h + hueOffset}, ${baseColor.s}%, ${luminance}%)`,
        transparent: `hsla(${baseColor.h + hueOffset}, ${baseColor.s}%, ${luminance}%, 0.7)`,
      };
    });
  };

  const colorPalette = generateConsistentColors(categories);
  const colors = colorPalette.map((c) => c.base);
  const transparentColors = colorPalette.map((c) => c.transparent);

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: transparentColors,
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: categories,
    datasets: [
      {
        label: "Expenses by Category",
        data: amounts,
        backgroundColor: transparentColors,
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: theme === "dark" ? "#e4e4e7" : "#27272a",
        },
        onClick: (e: any, legendItem: any, legend: any) => {
          const selected = legend.chart.data.labels[legendItem.index];
          setSelectedCategory((prev) =>
            prev === selected ? null : selected
          );
        },
      },
      tooltip: {
        backgroundColor:
          theme === "dark"
            ? "rgba(30, 41, 59, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
        titleColor: theme === "dark" ? "#e4e4e7" : "#27272a",
        bodyColor: theme === "dark" ? "#e4e4e7" : "#27272a",
        borderColor:
          theme === "dark"
            ? "rgba(226, 232, 240, 0.2)"
            : "rgba(30, 41, 59, 0.2)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ₹${value.toLocaleString("en-IN")} (${percentage}%)`;
          },
        },
      },
    },
    scales:
      chartType === "bar"
        ? {
            y: {
              beginAtZero: true,
              grid: {
                color:
                  theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                color: theme === "dark" ? "#e4e4e7" : "#27272a",
                callback: function (value) {
                  return "₹" + value.toLocaleString("en-IN");
                },
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: theme === "dark" ? "#e4e4e7" : "#27272a",
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
          }
        : undefined,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"} 
        p-6 rounded-xl shadow-lg transition-colors duration-300`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Expense Breakdown</h2>
          <div className="mt-1 flex items-center">
            <span
              className={`${theme === "dark" ? "text-emerald-400" : "text-emerald-600"} font-semibold`}
            >
              {isLoading ? <Loader /> : `₹${total.toLocaleString("en-IN")}`}
            </span>
            <span
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} text-sm ml-2`}
            >
              total expenses
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <div
            className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} p-1 rounded-lg flex items-center`}
          >
            <button
              onClick={() => setChartType("pie")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartType === "pie"
                  ? `${theme === "dark" ? "bg-indigo-600" : "bg-indigo-500"} text-white`
                  : `${theme === "dark" ? "text-gray-300 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}`
              }`}
            >
              Pie
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartType === "bar"
                  ? `${theme === "dark" ? "bg-indigo-600" : "bg-indigo-500"} text-white`
                  : `${theme === "dark" ? "text-gray-300 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}`
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <>
        {isLoading ? (
          <div className="h-64 sm:h-80 mt-6 flex items-center justify-center">
            <Loader size="large" text="Preparing chart data..." />
          </div>
        ) : expenses.length === 0 ? (
          <div
            className={`text-center py-16 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} flex flex-col items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 opacity-60"
            >
              <path d="M3 11h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11Z" />
              <path d="M10 9V3h4v6" />
              <path d="M12 14v4" />
            </svg>
            <p className="text-lg font-medium">No expenses yet</p>
            <p className="mt-1">Add expenses to see your spending breakdown</p>
          </div>
        ) : (
          <div className="h-64 sm:h-80 mt-6">
            {chartType === "pie" ? (
              <Pie data={pieData} options={chartOptions} />
            ) : (
              <Bar data={barData} options={chartOptions} />
            )}
          </div>
        )}
      </>
    </motion.div>
  );
}
