// lib/gemini/client.ts — lazy initialization
import type { GenerativeModel } from '@google/generative-ai'

function getGenAI() {
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY environment variable is required')
  return new GoogleGenerativeAI(key)
}

const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
]

export function getStructuredModel(schema: object): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.15,
      topP: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: schema as never,
    },
    safetySettings: safetySettings as never,
  })
}

export function getFunctionCallingModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.25, topP: 0.85, maxOutputTokens: 4096 },
    safetySettings: safetySettings as never,
  })
}

export function getCommsModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.5,
      topP: 0.9,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
    safetySettings: safetySettings as never,
  })
}
