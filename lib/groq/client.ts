import Groq from 'groq-sdk'

export function getGroqClient() {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY environment variable is required')
  return new Groq({ apiKey: key })
}

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
