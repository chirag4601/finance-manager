'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CATEGORIES, ExpenseFormInput } from '@/types'

const expenseSchema = z.object({
    amount: z.string().min(1, 'Amount is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    date: z.string().optional(),
})

interface ExpenseFormProps {
    onSubmit: (data: ExpenseFormInput) => void
    initialData?: ExpenseFormInput
    isEditing?: boolean
}

export default function ExpenseForm({
                                        onSubmit,
                                        initialData,
                                        isEditing = false
                                    }: ExpenseFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ExpenseFormInput>({
        resolver: zodResolver(expenseSchema),
        defaultValues: initialData ? {
            ...initialData,
            amount: initialData.amount?.toString() || '',
            date: initialData.date || ''
        } : {
            amount: '',
            category: '',
            description: '',
            date: '',
        },
    })

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                amount: initialData.amount?.toString() || '',
                date: initialData.date || ''
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = async (data: ExpenseFormInput) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data)
        } finally {
            reset( {
                amount: '',
                category: '',
                description: '',
                date: '',
            })
            setIsSubmitting(false)
        }
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4 bg-white rounded-lg p-6 shadow-md"
        >
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                    </div>
                    <input
                        type="number"
                        id="amount"
                        step="0.01"
                        className="text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border-gray-300 rounded-md"
                        placeholder="0.00 "
                        {...register('amount')}
                    />
                </div>
                {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                </label>
                <select
                    id="category"
                    className="text-black mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    {...register('category')}
                >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                </label>
                <input
                    type="text"
                    id="description"
                    className="text-black mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    {...register('description')}
                />
            </div>

            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date (Optional)
                </label>
                <input
                    type="date"
                    id="date"
                    className="text-black mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    {...register('date')}
                />
                <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use current date
                </p>
            </div>

            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
            </motion.button>
        </motion.form>
    )
}