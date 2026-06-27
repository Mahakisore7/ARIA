// lib/agents/build.ts
import { getFunctionCallingModel } from '@/lib/gemini/client'
import { ariaTools } from '@/lib/gemini/tools'
import { PROMPTS } from '@/lib/gemini/prompts'
import { ariaCheck } from '@/lib/agents/validator'
import type { SubtaskPlan } from '@/types/agents'

const MAX_RETRIES = 2

export async function runBuildAgent(
  taskDescription: string,
  deadlineIso: string,
  availableMinutes: number,
  taskCategory = 'other'
): Promise<SubtaskPlan> {
  const model = getFunctionCallingModel()
  let retryCount = 0
  let lastViolations = ''

  while (retryCount <= MAX_RETRIES) {
    const userMessage = retryCount === 0
      ? `Plan this task: "${taskDescription}". Deadline: ${deadlineIso}. Available time: ${availableMinutes} minutes. Category: ${taskCategory}. Use the decompose_task function.`
      : `Previous attempt failed validation. Fix these issues: ${lastViolations}. Re-run decompose_task with corrections.`

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: PROMPTS.BUILD_DECOMPOSE }] },
        { role: 'model', parts: [{ text: 'Understood. I will decompose tasks using the decompose_task function and return valid structured JSON.' }] },
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      tools: ariaTools as never,
    })

    const candidate = result.response.candidates?.[0]
    if (!candidate) throw new Error('No response from Gemini')

    const part = candidate.content.parts[0]

    // Gemini decided to call a function
    if (part.functionCall && part.functionCall.name === 'decompose_task') {
      const args = part.functionCall.args as {
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

    // Fallback: Gemini returned text instead of function call
    // Try to parse as JSON directly
    const text = part.text || ''
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
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 3000,
      responseMimeType: 'application/json',
    },
  })

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

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Clean and parse
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const plan = JSON.parse(clean) as SubtaskPlan

  // Ensure completed is set on all subtasks
  plan.subtasks = plan.subtasks.map((s) => ({ ...s, completed: false }))

  return plan
}
