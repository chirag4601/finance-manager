'use client'

import { useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { motion } from 'framer-motion'

interface DateFilterProps {
    onFilterChange: (startDate: string, endDate: string) => void
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>('all')
    const [customStartDate, setCustomStartDate] = useState<string>('')
    const [customEndDate, setCustomEndDate] = useState<string>('')

    const applyFilter = (filter: string) => {
        setSelectedFilter(filter)

        const today = new Date()
        let startDate = ''
        let endDate = format(today, 'yyyy-MM-dd')

        switch (filter) {
            case 'today':
                startDate = format(today, 'yyyy-MM-dd')
                break
            case '7days':
                startDate = format(subDays(today, 7), 'yyyy-MM-dd')
                break
            case '30days':
                startDate = format(subDays(today, 30), 'yyyy-MM-dd')
                break
            case 'month':
                startDate = format(startOfMonth(today), 'yyyy-MM-dd')
                endDate = format(endOfMonth(today), 'yyyy-MM-dd')
                break
            case 'year':
                startDate = format(startOfYear(today), 'yyyy-MM-dd')
                endDate = format(endOfYear(today), 'yyyy-MM-dd')
                break
            case 'custom':
                return // Don't set dates yet, wait for custom input
            case 'all':
            default:
                startDate = ''
                endDate = ''
                break
        }

        onFilterChange(startDate, endDate)
    }

    const applyCustomFilter = () => {
        if (customStartDate && customEndDate) {
            onFilterChange(customStartDate, customEndDate)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
            <div className="flex flex-wrap gap-2 mb-4">
                {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: 'Last 7 Days' },
                    { id: '30days', label: 'Last 30 Days' },
                    { id: 'month', label: 'This Month' },
                    { id: 'year', label: 'This Year' },
                    { id: 'custom', label: 'Custom' },
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => applyFilter(filter.id)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            selectedFilter === filter.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {selectedFilter === 'custom' && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <button
                            onClick={applyCustomFilter}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Apply Custom Filter
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}