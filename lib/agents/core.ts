// lib/agents/core.ts
import { getGroqClient, GROQ_MODEL } from '@/lib/groq/client'
import { PROMPTS, SCHEMAS } from '@/lib/groq/prompts'
import type { IntentClassification } from '@/types/agents'

export async function classifyIntent(userMessage: string): Promise<IntentClassification> {
  const groq = getGroqClient()

  const result = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: PROMPTS.CORE_INTENT + '\n\nYou must return valid JSON matching this schema: ' + JSON.stringify(SCHEMAS.INTENT) },
      { role: 'user', content: `Classify this message: "${userMessage}"\n\nCurrent time: ${new Date().toISOString()}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.15,
    max_tokens: 2048,
  })

  const text = result.choices[0]?.message?.content || '{}'
  return JSON.parse(text) as IntentClassification
}
