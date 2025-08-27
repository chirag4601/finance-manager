export type Expense = {
  id: number;
  amount: number;
  category: string;
  description?: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  username: string;
};

export type ExpenseFormInput = {
  amount: string;
  category: string;
  description?: string;
  date?: string;
};

export const CATEGORIES = [
  "Grocery",
   "Dining",
  "Housing/Rent",
  "Transportation (Intracity)",
  "Entertainment",
  "Utilities",
  "Medicines",
  "Shopping",
  "Office Spends",
  "Personal",
  "Travel",
  "Other",
];
