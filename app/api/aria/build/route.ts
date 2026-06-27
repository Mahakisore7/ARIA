// app/api/aria/build/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware/auth'
import { checkRateLimit } from '@/lib/middleware/rateLimit'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { runBuildAgent } from '@/lib/agents/build'
import { calculateRisk } from '@/lib/agents/shield'
import { createTask, writeActionLog, makeLogEntry } from '@/lib/firebase/db'
import type { BuildRequest, TaskCategory } from '@/types/agents'

export async function POST(req: Request) {
  const start = Date.now()

  try {
    const uid = await verifyToken(req)
    if (!checkRateLimit(uid)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 })
    }

    const body = (await req.json()) as BuildRequest
    const taskDescription = sanitizeInput(body.task_description || '')
    const deadlineIso = body.deadline_iso
    const availableMinutes = body.available_minutes

    if (!taskDescription || taskDescription.length < 3) {
      return NextResponse.json({ error: 'Task description is too short.' }, { status: 400 })
    }
    if (!deadlineIso) {
      return NextResponse.json({ error: 'Deadline is required for Build Mode.' }, { status: 400 })
    }
    if (!availableMinutes || availableMinutes < 10) {
      return NextResponse.json({ error: 'Not enough time available.' }, { status: 400 })
    }

    // Run ARIA-Build agent
    const plan = await runBuildAgent(
      taskDescription,
      deadlineIso,
      availableMinutes,
      (body.user_context || 'other') as TaskCategory
    )

    // Calculate initial risk
    const riskScore = calculateRisk(
      'pending',
      deadlineIso,
      plan.total_estimated_minutes / 60,
      0,
      false
    )

    // Persist task to Firebase
    const taskId = await createTask(uid, {
      title: taskDescription.slice(0, 80),
      description: taskDescription,
      deadline_iso: deadlineIso,
      status: 'active',
      risk_level: riskScore.risk_level,
      mode_created: 'BUILD',
      created_at: Date.now(),
      updated_at: Date.now(),
      subtasks: plan.subtasks,
    })

    // Write action log
    const actionId = await writeActionLog(
      uid,
      makeLogEntry(
        'ARIA-Build',
        'decompose_task',
        taskId,
        `Task: "${taskDescription.slice(0, 60)}" · ${availableMinutes}min available`,
        `Generated ${plan.subtasks.length} subtasks · ${plan.total_estimated_minutes}min total · Feasible: ${plan.feasible}`,
        plan.reasoning,
        Date.now() - start,
        0,
        true,
        { task_id: taskId }
      )
    )

    return NextResponse.json({
      task_id: taskId,
      action_id: actionId,
      plan,
      risk_level: riskScore.risk_level,
      risk_reasoning: riskScore.reasoning,
    })
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', route: '/api/aria/build', error: String(err), timestamp: new Date().toISOString() }))

    if (String(err).includes('Unauthorized')) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    return NextResponse.json({ error: 'ARIA encountered an issue. Please try again.' }, { status: 500 })
  }
}
