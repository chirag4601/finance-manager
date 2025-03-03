'use client'

import { useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import { Expense } from '@/types'

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ExpenseChartProps {
    expenses: Expense[]
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
    const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

    // Process data for charts
    const categoryData = expenses.reduce((acc, expense) => {
        const category = expense.category
        if (!acc[category]) {
            acc[category] = 0
        }
        acc[category] += expense.amount
        return acc
    }, {} as Record<string, number>)

    const categories = Object.keys(categoryData)
    const amounts = Object.values(categoryData)

    // Generate random colors for chart segments
    const generateColors = (count: number) => {
        const colors = []
        const transparentColors = []

        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 220) + 35
            const g = Math.floor(Math.random() * 220) + 35
            const b = Math.floor(Math.random() * 220) + 35

            colors.push(`rgb(${r}, ${g}, ${b})`)
            transparentColors.push(`rgba(${r}, ${g}, ${b}, 0.2)`)
        }

        return { colors, transparentColors }
    }

    const { colors, transparentColors } = generateColors(categories.length)

    const pieData = {
        labels: categories,
        datasets: [
            {
                data: amounts,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('rgb', 'rgba').replace(')', ', 1)')),
                borderWidth: 1,
            },
        ],
    }

    const barData = {
        labels: categories,
        datasets: [
            {
                label: 'Expenses by Category',
                data: amounts,
                backgroundColor: transparentColors,
                borderColor: colors,
                borderWidth: 1,
            },
        ],
    }

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || ''
                        const value = context.raw || 0
                        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)
                        const percentage = Math.round((value / total) * 100)
                        return `${label}: Rs.${value.toFixed(2)} (${percentage}%)`
                    }
                }
            }
        },
    }

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || ''
                        const value = context.raw || 0
                        return `${label}: Rs.${value.toFixed(2)}`
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return 'Rs.' + value
                    }
                }
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-md"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Expense Breakdown</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setChartType('pie')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            chartType === 'pie'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Pie
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-1 rounded-md text-sm ${
                            chartType === 'bar'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Bar
                    </button>
                </div>
            </div>

            {expenses.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p>Add expenses to see your spending breakdown</p>
                </div>
            ) : (
                <div className="h-64 sm:h-80">
                    {chartType === 'pie' ? (
                        <Pie data={pieData} options={pieOptions} />
                    ) : (
                        <Bar data={barData} options={barOptions} />
                    )}
                </div>
            )}
        </motion.div>
    )
}