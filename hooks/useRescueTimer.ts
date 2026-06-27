'use client'
import { useState, useEffect, useCallback } from 'react'

export function useRescueTimer(totalMinutes: number) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); setRunning(false); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => { setRunning(false); setSecondsLeft(totalMinutes * 60) }, [totalMinutes])

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  const display = hours > 0
    ? `${hours}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
    : `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
  const percentLeft = totalMinutes > 0 ? (secondsLeft / (totalMinutes * 60)) * 100 : 100
  const isCritical = percentLeft < 20

  return { display, secondsLeft, percentLeft, isCritical, running, start, pause, reset }
}
