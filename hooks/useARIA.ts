'use client'
// hooks/useARIA.ts
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { SubtaskPlan, RescueResult, RiskLevel } from '@/types/agents'

interface BuildResult {
  task_id: string
  action_id: string
  plan: SubtaskPlan
  risk_level: RiskLevel
  risk_reasoning: string
}

export function useARIA() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authFetch = async (url: string, body: object) => {
    const token = await getToken()
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const classifyIntent = async (message: string) => {
    const token = await getToken()
    const res = await fetch('/api/aria/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
    })
    return res.json()
  }

  const buildTask = async (
    taskDescription: string,
    deadlineIso: string,
    availableMinutes: number
  ): Promise<BuildResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await authFetch('/api/aria/build', {
        task_description: taskDescription,
        deadline_iso: deadlineIso,
        available_minutes: availableMinutes,
      })
      return result as BuildResult
    } catch (err) {
      setError(String(err).replace('Error: ', ''))
      return null
    } finally {
      setLoading(false)
    }
  }

  const rescueTask = async (
    taskDescription: string,
    availableMinutes: number,
    recipientType = 'manager',
    taskId?: string
  ): Promise<RescueResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await authFetch('/api/aria/rescue', {
        task_description: taskDescription,
        available_minutes: availableMinutes,
        recipient_type: recipientType,
        task_id: taskId,
      })
      return result as RescueResult
    } catch (err) {
      setError(String(err).replace('Error: ', ''))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, setError, classifyIntent, buildTask, rescueTask }
}
