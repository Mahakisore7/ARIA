// app/api/aria/rescue/route.ts
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/middleware/auth'
import { checkRateLimit } from '@/lib/middleware/rateLimit'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { runRescueAgent, runCommsAgent } from '@/lib/agents/rescue'
import { createTask, updateTask, writeActionLog, makeLogEntry } from '@/lib/firebase/db'
import type { RescueRequest } from '@/types/agents'

export async function POST(req: Request) {
  const start = Date.now()

  try {
    const uid = await verifyToken(req)
    if (!checkRateLimit(uid)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 })
    }

    const body = (await req.json()) as RescueRequest
    const taskDescription = sanitizeInput(body.task_description || '')
    const availableMinutes = body.available_minutes
    const sections = body.sections || []
    const recipientType = body.recipient_type || 'manager'
    const existingTaskId = body.task_id

    if (!taskDescription || taskDescription.length < 3) {
      return NextResponse.json({ error: 'Task description required.' }, { status: 400 })
    }
    if (!availableMinutes || availableMinutes < 5) {
      return NextResponse.json({ error: 'Available time too short.' }, { status: 400 })
    }

    // Run ARIA-Rescue (triage)
    const triage = await runRescueAgent(taskDescription, availableMinutes, sections)

    // Run ARIA-Comms in parallel after triage
    const deliverableStatus = `Will deliver: ${triage.sections_achievable.join(', ')}. Cut: ${triage.sections_cut.map((s) => s.section).join(', ') || 'nothing'}.`
    const comms = await runCommsAgent(
      `Task: ${taskDescription}. ${deliverableStatus}`,
      recipientType,
      deliverableStatus,
      'remaining sections within 48 hours'
    )

    // Persist or update task
    let taskId = existingTaskId || ''
    if (!existingTaskId) {
      taskId = await createTask(uid, {
        title: taskDescription.slice(0, 80),
        description: taskDescription,
        deadline_iso: new Date(Date.now() + availableMinutes * 60_000).toISOString(),
        status: 'rescued',
        risk_level: 'CRITICAL',
        mode_created: 'RESCUE',
        created_at: Date.now(),
        updated_at: Date.now(),
        subtasks: [],
        rescue_plan: {
          activated_at: Date.now(),
          available_minutes: availableMinutes,
          achievable_percentage: triage.achievable_percentage,
          sprint_blocks: triage.sprint_blocks,
          comms_draft: comms,
        },
      })
    } else {
      await updateTask(uid, existingTaskId, {
        status: 'rescued',
        risk_level: 'CRITICAL',
        rescue_plan: {
          activated_at: Date.now(),
          available_minutes: availableMinutes,
          achievable_percentage: triage.achievable_percentage,
          sprint_blocks: triage.sprint_blocks,
          comms_draft: comms,
        },
      })
    }

    // Write action log entries
    const latency = Date.now() - start
    const triageActionId = await writeActionLog(
      uid,
      makeLogEntry(
        'ARIA-Rescue',
        'generate_sprint_plan',
        taskId,
        `"${taskDescription.slice(0, 50)}" · ${availableMinutes}min available`,
        `${triage.achievable_percentage}% achievable · ${triage.sprint_blocks.length} sprint blocks · ${triage.sections_cut.length} sections cut`,
        triage.reasoning,
        latency,
        0,
        false,
        null
      )
    )

    const commsActionId = await writeActionLog(
      uid,
      makeLogEntry(
        'ARIA-Comms',
        'draft_communication',
        taskId,
        `Drafted ${recipientType} communication for partial delivery`,
        `Email drafted · Subject: "${comms.email.subject_options[0]}" · Tone: ${comms.email.tone}`,
        comms.reasoning,
        latency,
        0,
        false,
        null
      )
    )

    return NextResponse.json({
      task_id: taskId,
      triage,
      comms,
      action_ids: [triageActionId, commsActionId],
    })
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', route: '/api/aria/rescue', error: String(err), timestamp: new Date().toISOString() }))

    if (String(err).includes('Unauthorized')) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    return NextResponse.json({ error: 'ARIA encountered an issue. Please try again.' }, { status: 500 })
  }
}
