import { NextRequest, NextResponse } from 'next/server'
import { readData, computeSummary } from '@/lib/db'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
  const data = readData()
  const summary = computeSummary(data, month)
  return NextResponse.json(summary)
}
