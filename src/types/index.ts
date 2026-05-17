export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

export interface Transaction {
  id: string
  amount: number
  description: string
  categoryId: string | null
  date: string
  isRecurring: boolean
  recurringInterval: 'monthly' | 'weekly' | 'yearly' | null
  createdAt: string
}

export interface PersonBudgetItem {
  id: string
  person: 'nenlil' | 'nathalie'
  name: string
  amount: number
  month: string
  createdAt: string
}

export interface BudgetData {
  categories: Category[]
  transactions: Transaction[]
  personBudget: PersonBudgetItem[]
}

export interface MonthlySummary {
  income: number
  expenses: number
  result: number
  byCategory: Array<{
    categoryId: string
    name: string
    color: string
    icon: string
    type: 'income' | 'expense'
    total: number
  }>
  lastSixMonths: Array<{
    month: string
    income: number
    expenses: number
  }>
}

export type Page = 'overview' | 'expenses' | 'income' | 'recurring' | 'categories'
