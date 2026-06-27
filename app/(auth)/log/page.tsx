'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ActionLog } from '@/components/aria/ActionLog'
import { Button } from '@/components/ui/index'
import Link from 'next/link'

export default function LogPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-aria-violet border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-aria-border px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="sm">← Dashboard</Button></Link>
        <h1 className="text-base font-semibold text-aria-text">ARIA Activity Log</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-aria-green animate-pulse" />
          <span className="text-xs text-aria-muted">Live</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-6 p-4 bg-aria-surface border border-aria-border rounded-xl">
          <p className="text-xs text-aria-muted leading-relaxed">
            Every action ARIA takes is logged here — the agent responsible, what it did, and why.
            This is the complete audit trail of ARIA&apos;s autonomous decisions.
            Click <span className="text-aria-violet font-medium">Why?</span> on any entry to see ARIA&apos;s full reasoning.
          </p>
        </div>
        <ActionLog />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
