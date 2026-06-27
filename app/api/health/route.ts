// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, string> = {}

  // Check Gemini
  checks.gemini = process.env.GEMINI_API_KEY ? 'configured' : 'missing'

  // Check Firebase
  checks.firebase_project = process.env.FIREBASE_PROJECT_ID ? 'configured' : 'missing'
  checks.firebase_db = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? 'configured' : 'missing'

  const allOk = Object.values(checks).every((v) => v === 'configured')

  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }, { status: allOk ? 200 : 503 })
}
