import { NextRequest, NextResponse } from 'next/server'
import { insertResponse } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    await insertResponse({ ...body, ip })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[submit]', e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
