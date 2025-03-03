export type Expense = {
    id: number
    amount: number
    category: string
    description?: string | null
    date: Date
    createdAt: Date
    updatedAt: Date
}

export type ExpenseFormInput = {
    amount: string
    category: string
    description?: string
    date?: string
}

export const CATEGORIES = [
    'Food',
    'Housing',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Shopping',
    'Education',
    'Personal',
    'Travel',
    'Other',
]