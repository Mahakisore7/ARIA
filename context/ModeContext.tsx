'use client'
// context/ModeContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ARIAMode } from '@/types/agents'

interface ModeContextValue {
  mode: ARIAMode
  setMode: (mode: ARIAMode) => void
  isRescue: boolean
  isBuild: boolean
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ARIAMode>('BUILD')

  return (
    <ModeContext.Provider value={{
      mode,
      setMode,
      isRescue: mode === 'RESCUE',
      isBuild: mode === 'BUILD',
    }}>
      {children}
    </ModeContext.Provider>
  )
}

export const useMode = () => {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}
