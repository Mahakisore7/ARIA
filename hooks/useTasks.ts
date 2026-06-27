'use client'
import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/context/AuthContext'
import type { Task } from '@/types/agents'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setTasks([]); setLoading(false); return }
    const tasksRef = ref(db, `users/${user.uid}/tasks`)
    setLoading(true)
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const result: Task[] = []
      snapshot.forEach((child) => {
        result.push({ id: child.key!, ...child.val() } as Task)
      })
      result.sort((a, b) => {
        const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        return (riskOrder[a.risk_level] ?? 4) - (riskOrder[b.risk_level] ?? 4)
      })
      setTasks(result)
      setLoading(false)
    })
    return () => off(tasksRef, 'value', unsubscribe)
  }, [user])

  return { tasks, loading }
}
