import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = readData()
  data.transactions = data.transactions.filter(t => t.id !== id)
  writeData(data)
  return NextResponse.json({ ok: true })
}
