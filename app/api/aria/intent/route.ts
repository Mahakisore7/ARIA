// app/api/aria/intent/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware/auth'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { classifyIntent } from '@/lib/agents/core'

export async function POST(req: Request) {
  try {
    await verifyToken(req)
    const { message } = (await req.json()) as { message: string }
    const sanitized = sanitizeInput(message || '')
    if (!sanitized) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    }
    const intent = await classifyIntent(sanitized)
    return NextResponse.json(intent)
  } catch (err) {
    if (String(err).includes('Unauthorized')) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to classify intent.' }, { status: 500 })
  }
}
