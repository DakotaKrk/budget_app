import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data = readData()

  data.categories = data.categories.map(c =>
    c.id === id ? { ...c, name: body.name, color: body.color, icon: body.icon } : c
  )
  writeData(data)

  const updated = data.categories.find(c => c.id === id)!
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = readData()
  data.categories = data.categories.filter(c => c.id !== id)
  writeData(data)
  return NextResponse.json({ ok: true })
}
