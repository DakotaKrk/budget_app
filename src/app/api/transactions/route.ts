import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData, generateId } from '@/lib/db'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month')
  const type = req.nextUrl.searchParams.get('type')
  const recurring = req.nextUrl.searchParams.get('recurring')

  const data = readData()
  const catMap = new Map(data.categories.map(c => [c.id, c]))

  let txs = data.transactions

  if (month) txs = txs.filter(t => t.date.startsWith(month))
  if (recurring === 'true') txs = txs.filter(t => t.isRecurring)

  if (type) {
    txs = txs.filter(t => {
      const cat = t.categoryId ? catMap.get(t.categoryId) : null
      return cat?.type === type
    })
  }

  const enriched = txs
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .map(t => ({
      ...t,
      category: t.categoryId ? catMap.get(t.categoryId) ?? null : null,
    }))

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = readData()

  const tx = {
    id: generateId(),
    amount: Number(body.amount),
    description: String(body.description),
    categoryId: body.categoryId ?? null,
    date: String(body.date),
    isRecurring: Boolean(body.isRecurring),
    recurringInterval: body.recurringInterval ?? null,
    createdAt: new Date().toISOString(),
  }

  data.transactions.push(tx)
  writeData(data)

  const cat = tx.categoryId ? data.categories.find(c => c.id === tx.categoryId) ?? null : null
  return NextResponse.json({ ...tx, category: cat }, { status: 201 })
}
