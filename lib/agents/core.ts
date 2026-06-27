// lib/agents/core.ts
import { getStructuredModel } from '@/lib/gemini/client'
import { PROMPTS, SCHEMAS } from '@/lib/gemini/prompts'
import type { IntentClassification } from '@/types/agents'

export async function classifyIntent(userMessage: string): Promise<IntentClassification> {
  const model = getStructuredModel(SCHEMAS.INTENT)

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `${PROMPTS.CORE_INTENT}\n\nClassify this message: "${userMessage}"\n\nCurrent time: ${new Date().toISOString()}` }],
      },
    ],
  })

  const text = result.response.text()
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean) as IntentClassification
}
