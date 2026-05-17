import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data = readData()

  const idx = data.personBudget.findIndex(i => i.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  data.personBudget[idx] = { ...data.personBudget[idx], ...body }
  writeData(data)

  return NextResponse.json(data.personBudget[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = readData()

  data.personBudget = data.personBudget.filter(i => i.id !== id)
  writeData(data)

  return NextResponse.json({ ok: true })
}
