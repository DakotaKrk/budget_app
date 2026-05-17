import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(n: number): string {
  return n.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' kr'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}

export function formatShortMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('sv-SE', { month: 'short' })
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
