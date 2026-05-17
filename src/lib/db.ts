import fs from 'fs'
import path from 'path'
import { BudgetData, Category, Transaction } from '@/types'

const DATA_FILE = path.join(process.cwd(), 'data', 'budget.json')

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Lön', type: 'income', color: '#6366f1', icon: '💼' },
  { id: 'c2', name: 'Secondhand', type: 'income', color: '#10b981', icon: '👗' },
  { id: 'c3', name: 'Återbetalning', type: 'income', color: '#a855f7', icon: '🏦' },
  { id: 'c4', name: 'Övrigt inkomst', type: 'income', color: '#f59e0b', icon: '🎁' },
  { id: 'c5', name: 'Mat & Dryck', type: 'expense', color: '#ef4444', icon: '🛒' },
  { id: 'c6', name: 'Hyra & Bostad', type: 'expense', color: '#6366f1', icon: '🏠' },
  { id: 'c7', name: 'Transport', type: 'expense', color: '#f59e0b', icon: '🚌' },
  { id: 'c8', name: 'Nöje & Fritid', type: 'expense', color: '#a855f7', icon: '🎭' },
  { id: 'c9', name: 'Kläder', type: 'expense', color: '#ec4899', icon: '👕' },
  { id: 'c10', name: 'Hälsa', type: 'expense', color: '#10b981', icon: '💊' },
  { id: 'c11', name: 'Prenumerationer', type: 'expense', color: '#818cf8', icon: '📱' },
  { id: 'c12', name: 'Övrigt utgift', type: 'expense', color: '#94a3b8', icon: '📦' },
]

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    const initial: BudgetData = { categories: DEFAULT_CATEGORIES, transactions: [], personBudget: [] }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8')
  }
}

export function readData(): BudgetData {
  ensureDataFile()
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  const parsed = JSON.parse(raw)
  if (!parsed.personBudget) parsed.personBudget = []
  return parsed
}

export function writeData(data: BudgetData): void {
  ensureDataFile()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getTransactionsForMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter(t => t.date.startsWith(month))
}

export function computeSummary(data: BudgetData, month: string) {
  const monthTxs = getTransactionsForMonth(data.transactions, month)
  const catMap = new Map(data.categories.map(c => [c.id, c]))

  let income = 0
  let expenses = 0
  const byCat: Record<string, { total: number; category: Category }> = {}

  for (const tx of monthTxs) {
    const cat = tx.categoryId ? catMap.get(tx.categoryId) : null
    if (cat?.type === 'income') income += tx.amount
    if (cat?.type === 'expense') expenses += tx.amount
    if (tx.categoryId && cat) {
      if (!byCat[tx.categoryId]) byCat[tx.categoryId] = { total: 0, category: cat }
      byCat[tx.categoryId].total += tx.amount
    }
  }

  const byCategory = Object.entries(byCat).map(([id, { total, category }]) => ({
    categoryId: id,
    name: category.name,
    color: category.color,
    icon: category.icon,
    type: category.type,
    total,
  })).sort((a, b) => b.total - a.total)

  const lastSixMonths: Array<{ month: string; income: number; expenses: number }> = []
  for (let i = 5; i >= 0; i--) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const txs = getTransactionsForMonth(data.transactions, key)
    let inc = 0, exp = 0
    for (const tx of txs) {
      const cat = tx.categoryId ? catMap.get(tx.categoryId) : null
      if (cat?.type === 'income') inc += tx.amount
      if (cat?.type === 'expense') exp += tx.amount
    }
    lastSixMonths.push({ month: key, income: inc, expenses: exp })
  }

  return { income, expenses, result: income - expenses, byCategory, lastSixMonths }
}
