// lib/agents/rescue.ts
import { ariaCheck } from '@/lib/agents/validator'
import { PROMPTS } from '@/lib/groq/prompts'
import { getGroqClient, GROQ_MODEL } from '@/lib/groq/client'
import type { TriagePlan, CommsDraft, RecipientType } from '@/types/agents'

const MAX_RETRIES = 2

export async function runRescueAgent(
  taskDescription: string,
  availableMinutes: number,
  sections: string[] = [],
  deliverableType = 'assignment'
): Promise<TriagePlan> {
  const groq = getGroqClient()

  let lastViolations = ''

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const retryNote = attempt > 0 ? `\n\nPREVIOUS ATTEMPT FAILED. Fix these violations: ${lastViolations}` : ''

    const prompt = `${PROMPTS.RESCUE_TRIAGE}${retryNote}

SITUATION:
Task: "${taskDescription}"
Available time: ${availableMinutes} minutes (${Math.round(availableMinutes / 60 * 10) / 10} hours)
Known sections: ${sections.length > 0 ? sections.join(', ') : 'not specified — infer from task type'}
Deliverable type: ${deliverableType}

Generate a TriagePlan JSON with this exact structure:
{
  "available_minutes": ${availableMinutes},
  "achievable_percentage": number (0-100),
  "sections_achievable": ["section name", ...],
  "sections_cut": [{ "section": "name", "reason": "specific reason" }, ...],
  "sprint_blocks": [
    {
      "block_number": 1,
      "title": "Block title",
      "objective": "What to accomplish",
      "duration_minutes": number (max 45),
      "deliverable": "Specific measurable output",
      "checkin_signal": "How to know this block is done",
      "completed": false
    }
  ],
  "outline": [
    { "section": "Section name", "key_points": ["point 1", "point 2", "point 3"], "target_length": "X words" }
  ],
  "total_planned_minutes": number,
  "reasoning": "2-sentence explanation of triage decisions"
}`

    try {
      const result = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 4096,
      })

      const text = result.choices[0]?.message?.content || '{}'
      const plan = JSON.parse(text) as TriagePlan

      // Ensure completed is false on all blocks
      if (plan.sprint_blocks) {
        plan.sprint_blocks = plan.sprint_blocks.map((b) => ({ ...b, completed: false }))
      }

      const validation = ariaCheck.validateRescue(plan)
      if (validation.passed) return plan

      lastViolations = validation.violations.join('; ')
    } catch (err) {
      lastViolations = `Parse error: ${String(err)}`
    }
  }

  throw new Error('ARIA-Rescue: Failed to generate valid triage plan after maximum retries')
}

export async function runCommsAgent(
  context: string,
  recipientType: RecipientType,
  deliverableStatus: string,
  revisedTimeline = 'to be determined'
): Promise<CommsDraft> {
  const groq = getGroqClient()
  let lastViolations = ''

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const retryNote = attempt > 0 ? `\n\nPREVIOUS ATTEMPT FAILED. Fix: ${lastViolations}` : ''

    const prompt = `${PROMPTS.COMMS_DRAFT}${retryNote}

CONTEXT:
Recipient type: ${recipientType}
Situation: ${context}
Deliverable status: ${deliverableStatus}
Revised timeline: ${revisedTimeline}

Generate a CommsDraft JSON:
{
  "recipient_type": "${recipientType}",
  "email": {
    "subject_options": ["Subject option 1", "Subject option 2"],
    "body": "Full email body (under 300 words, NO placeholders, max 1 apology)",
    "tone": "tone description"
  },
  "message_short": {
    "body": "Short Slack/WhatsApp version (under 100 words, NO placeholders)",
    "tone": "tone description"
  },
  "key_commitments": ["commitment 1", "commitment 2"],
  "reasoning": "Why this tone and approach for this recipient"
}`

    try {
      const result = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.45,
        max_tokens: 2048,
      })

      const text = result.choices[0]?.message?.content || '{}'
      const draft = JSON.parse(text) as CommsDraft

      const validation = ariaCheck.validateComms(draft)
      if (validation.passed) return draft

      lastViolations = validation.violations.join('; ')
    } catch (err) {
      lastViolations = `Parse error: ${String(err)}`
    }
  }

  throw new Error('ARIA-Comms: Failed to generate valid communication draft after maximum retries')
}
