// lib/agents/build.ts
import { getGroqClient, GROQ_MODEL } from '@/lib/groq/client'
import { ariaTools } from '@/lib/groq/tools'
import { PROMPTS } from '@/lib/groq/prompts'
import { ariaCheck } from '@/lib/agents/validator'
import type { SubtaskPlan } from '@/types/agents'

const MAX_RETRIES = 2

export async function runBuildAgent(
  taskDescription: string,
  deadlineIso: string,
  availableMinutes: number,
  taskCategory = 'other'
): Promise<SubtaskPlan> {
  const groq = getGroqClient()
  let retryCount = 0
  let lastViolations = ''

  while (retryCount <= MAX_RETRIES) {
    const userMessage = retryCount === 0
      ? `Plan this task: "${taskDescription}". Deadline: ${deadlineIso}. Available time: ${availableMinutes} minutes. Category: ${taskCategory}. Use the decompose_task function.`
      : `Previous attempt failed validation. Fix these issues: ${lastViolations}. Re-run decompose_task with corrections.`

    const result = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: PROMPTS.BUILD_DECOMPOSE },
        { role: 'assistant', content: 'Understood. I will decompose tasks using the decompose_task function and return valid structured JSON.' },
        { role: 'user', content: userMessage },
      ],
      tools: ariaTools as any,
      tool_choice: 'auto',
      temperature: 0.25,
      max_tokens: 4096,
    })

    const message = result.choices[0]?.message
    if (!message) throw new Error('No response from Groq')

    // Groq decided to call a function
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0]
      if (toolCall.function.name === 'decompose_task') {
        const args = JSON.parse(toolCall.function.arguments) as {
          task_description: string
          deadline_iso: string
          available_minutes: number
          task_category?: string
        }

        // Execute the tool locally — generate the actual plan
        const plan = await executeDecompose(args)

        // Validate
        const validation = ariaCheck.validateBuild(plan)
        if (validation.passed) {
          return plan
        }

        lastViolations = validation.violations.join('; ')
        retryCount++
        continue
      }
    }

    // Fallback: Groq returned text instead of function call
    // Try to parse as JSON directly
    const text = message.content || ''
    try {
      const parsed = JSON.parse(text) as SubtaskPlan
      const validation = ariaCheck.validateBuild(parsed)
      if (validation.passed) return parsed
      lastViolations = validation.violations.join('; ')
      retryCount++
    } catch {
      retryCount++
    }
  }

  throw new Error('ARIA-Build: Failed to generate valid subtask plan after maximum retries')
}

async function executeDecompose(args: {
  task_description: string
  deadline_iso: string
  available_minutes: number
  task_category?: string
}): Promise<SubtaskPlan> {
  const groq = getGroqClient()

  const prompt = `${PROMPTS.BUILD_DECOMPOSE}

Task: "${args.task_description}"
Deadline: ${args.deadline_iso}  
Available minutes: ${args.available_minutes}
Category: ${args.task_category || 'other'}

Generate a SubtaskPlan JSON with this exact structure:
{
  "feasible": boolean,
  "warning": string or null,
  "subtasks": [{ "id": "st-1", "title": string, "description": string, "estimated_minutes": number, "dependencies": [], "risk_flag": boolean, "risk_reason": string or null, "completed": false }],
  "total_estimated_minutes": number,
  "available_minutes": ${args.available_minutes},
  "critical_path": ["st-1", ...],
  "calendar_blocks": [{ "subtask_id": "st-1", "suggested_start": "ISO string", "duration_minutes": number, "title": string }],
  "reasoning": "2-sentence explanation of decomposition approach"
}`

  const result = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 3000,
  })

  const text = result.choices[0]?.message?.content || '{}'
  const plan = JSON.parse(text) as SubtaskPlan

  // Ensure completed is set on all subtasks
  plan.subtasks = plan.subtasks?.map((s) => ({ ...s, completed: false })) || []

  return plan
}
