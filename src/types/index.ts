export type Expense = {
  id: number;
  amount: number;
  category: string;
  description?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ExpenseFormInput = {
  amount: string;
  category: string;
  description?: string;
  date?: string;
};

export const CATEGORIES = [
  "Food",
  "Housing/Rent",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Medicines",
  "Shopping",
  "Education",
  "Personal",
  "Investment: Stocks",
  "Investment: MF",
  "Travel",
  "Other",
];
