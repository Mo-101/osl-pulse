import { NextResponse } from 'next/server'
import { getAll } from '@/lib/db'

export async function GET() {
  try {
    const rows = await getAll()
    return NextResponse.json({ count: rows.length, responses: rows })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
