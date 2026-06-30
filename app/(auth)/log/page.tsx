'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ActionLog } from '@/components/aria/ActionLog'
import { Button } from '@/components/ui/index'
import Link from 'next/link'
import { ArrowLeft, Activity } from 'lucide-react'

export default function LogPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-primary-soft">
        <div className="w-12 h-12 border-4 border-border-default border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-secondary-soft text-body font-sans">
      <header className="border-b-4 border-border-default bg-neutral-primary px-6 py-4 flex items-center gap-4 shadow-md sticky top-0 z-20">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="px-2 border-2 border-border-default bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium">
            <ArrowLeft className="w-5 h-5 text-heading" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand" strokeWidth={3} />
          <h1 className="text-xl font-bold font-head text-heading uppercase tracking-tight">ARIA Activity Log</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 border-2 border-border-default bg-neutral-primary px-3 py-1 shadow-xs">
          <span className="w-3 h-3 rounded-none border-2 border-border-success bg-success animate-pulse shadow-xs" />
          <span className="text-sm font-bold text-heading uppercase tracking-widest">Live</span>
        </div>
      </header>
      <div className="max-w-[800px] mx-auto p-6 lg:p-[48px]">
        <div className="mb-8 p-6 bg-brand-soft border-4 border-border-brand shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand rounded-full border-4 border-border-brand opacity-20 pointer-events-none" />
          <p className="text-lg font-bold text-heading leading-relaxed relative z-10 uppercase tracking-tight">
            Every action ARIA takes is logged here — the agent responsible, what it did, and why. 
            This is the complete audit trail of ARIA's autonomous decisions. <br/><br/>
            Click <span className="bg-brand text-black px-2 py-0.5 border-2 border-black font-black uppercase inline-block -rotate-2 mx-1 shadow-xs">Why?</span> on any entry to see ARIA's full reasoning.
          </p>
        </div>
        <ActionLog />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
