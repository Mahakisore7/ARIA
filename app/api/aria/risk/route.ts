// app/api/aria/risk/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware/auth'
import { calculateRisk } from '@/lib/agents/shield'
import type { RiskRequest } from '@/types/agents'

export async function POST(req: Request) {
  try {
    await verifyToken(req)
    const body = (await req.json()) as RiskRequest

    const risk_scores = body.tasks.map((t) =>
      calculateRisk(t.task_id, t.deadline_iso, t.estimated_effort_hours, t.progress_percentage, t.has_dependencies)
    )

    return NextResponse.json({ risk_scores })
  } catch (err) {
    if (String(err).includes('Unauthorized')) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Risk calculation failed.' }, { status: 500 })
  }
}
