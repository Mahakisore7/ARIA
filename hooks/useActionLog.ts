'use client'
import { useEffect, useState } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/context/AuthContext'
import type { ActionLogEntry } from '@/types/agents'

export function useActionLog() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ActionLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setEntries([]); setLoading(false); return }
    const logRef = ref(db, `users/${user.uid}/action_log`)
    setLoading(true)
    const unsubscribe = onValue(logRef, (snapshot) => {
      const result: ActionLogEntry[] = []
      snapshot.forEach((child) => {
        result.unshift({ id: child.key!, ...child.val() } as ActionLogEntry)
      })
      setEntries(result)
      setLoading(false)
    })
    return () => off(logRef, 'value', unsubscribe)
  }, [user])

  return { entries, loading }
}
