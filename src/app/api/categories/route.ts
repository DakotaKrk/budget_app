import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData, generateId } from '@/lib/db'

export async function GET() {
  const data = readData()
  return NextResponse.json(data.categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = readData()

  const cat = {
    id: generateId(),
    name: String(body.name),
    type: body.type as 'income' | 'expense',
    color: String(body.color),
    icon: String(body.icon),
  }

  data.categories.push(cat)
  writeData(data)
  return NextResponse.json(cat, { status: 201 })
}
