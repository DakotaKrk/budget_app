import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData, generateId } from '@/lib/db'
import { PersonBudgetItem } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const person = searchParams.get('person') as PersonBudgetItem['person'] | null
  const month = searchParams.get('month')

  const data = readData()
  let items = data.personBudget

  if (person) items = items.filter(i => i.person === person)
  if (month) items = items.filter(i => i.month === month)

  return NextResponse.json(items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { person, name, amount, month } = body

  if (!person || !name || !amount || !month) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const newItem: PersonBudgetItem = {
    id: generateId(),
    person,
    name: name.trim(),
    amount: Number(amount),
    month,
    createdAt: new Date().toISOString(),
  }

  const data = readData()
  data.personBudget.push(newItem)
  writeData(data)

  return NextResponse.json(newItem, { status: 201 })
}
