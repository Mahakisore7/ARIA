'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/hooks/useTasks'
import { useActionLog } from '@/hooks/useActionLog'
import { useMode } from '@/context/ModeContext'
import { isoToRelative } from '@/lib/utils/time'
import { RiskBadge, Button, Card, Modal } from '@/components/ui/index'
import { ActionLog } from '@/components/aria/ActionLog'
import type { Task } from '@/types/agents'
import Link from 'next/link'

function TaskCard({ task }: { task: Task }) {
  const completedCount = task.subtasks?.filter((s) => s.completed).length || 0
  const totalCount = task.subtasks?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card interactive className="mb-4 bg-neutral-primary">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <RiskBadge level={task.risk_level} size="xs" />
            <span className="text-xs text-body-subtle font-semibold tracking-wide uppercase border-2 border-border-default px-2 py-0.5 bg-neutral-secondary-soft">
              {isoToRelative(task.deadline_iso)}
            </span>
            <span className="text-xs text-heading font-bold uppercase underline decoration-2 decoration-brand">
              {task.mode_created} MODE
            </span>
          </div>
          <h3 className="text-xl font-bold text-heading font-head leading-snug mb-3">{task.title}</h3>
          
          {totalCount > 0 && (
            <div className="mt-3 border-2 border-border-default bg-neutral-secondary-soft p-2">
              <div className="flex justify-between text-xs text-heading font-semibold mb-2">
                <span>{completedCount}/{totalCount} subtasks</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 border-2 border-border-default bg-neutral-primary w-full relative">
                <div className="absolute top-0 left-0 h-full bg-brand border-r-2 border-border-default transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-5 pt-4 border-t-2 border-border-default">
        <Link href={`/task/${task.id}`}>
          <Button size="sm" variant="secondary" className="px-4">View →</Button>
        </Link>
        {(task.risk_level === 'CRITICAL' || task.risk_level === 'HIGH') && (
          <Link href={`/rescue?task=${task.id}&desc=${encodeURIComponent(task.description)}`}>
            <Button size="sm" variant="danger">🚨 Rescue Protocol</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const { tasks, loading: tasksLoading } = useTasks()
  const { setMode } = useMode()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/')
    setMode('SHIELD')
  }, [user, loading, router, setMode])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-primary-soft">
        <div className="w-8 h-8 border-[3px] border-border-default border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  const criticalCount = tasks.filter((t) => t.risk_level === 'CRITICAL').length
  const activeTasks = tasks.filter((t) => {
    if (t.status !== 'active' && t.status !== 'rescued') return false
    const totalCount = t.subtasks?.length || 0
    if (totalCount === 0) return true
    const completedCount = t.subtasks?.filter(s => s.completed).length || 0
    return completedCount < totalCount
  })

  return (
    <div className="min-h-screen flex flex-col bg-neutral-secondary-soft font-sans text-body">
      {/* Header */}
      <header className="border-b-2 border-border-default bg-neutral-primary px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ARIA Logo" className="w-10 h-10 border-2 border-border-default object-cover shadow-2xs" />
          <span className="font-head text-xl text-heading tracking-tight hidden sm:block">ARIA <span className="text-body-subtle">/ DASHBOARD</span></span>
        </div>
        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="text-xs text-white font-bold px-3 py-1 bg-danger border-2 border-border-default shadow-xs animate-pulse">
              {criticalCount} CRITICAL
            </span>
          )}
          <Link href="/task/new">
            <Button size="sm" variant="primary">+ New Task</Button>
          </Link>
          <Link href="/rescue">
            <Button size="sm" variant="danger">🚨 Rescue</Button>
          </Link>
          <button onClick={signOut} className="text-sm font-semibold text-body hover:text-heading transition-colors ml-2 underline hover:no-underline">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-[1536px] w-full mx-auto">
        <main className="flex-1 overflow-y-auto p-6 lg:p-[48px]">
          <div className="mb-8 border-b-2 border-border-default pb-6">
            <h1 className="text-4xl font-head font-bold text-heading">Active Tasks</h1>
            <p className="text-lg text-body mt-2 leading-[1.7]">
              {user.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}.` : 'Welcome back.'}{' '}
              ARIA is shielding <strong className="text-heading bg-brand-soft px-1">{activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}</strong>.
            </p>
          </div>

          {tasksLoading && (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 border-2 border-border-default bg-neutral-primary animate-pulse" />
              ))}
            </div>
          )}

          {!tasksLoading && activeTasks.length === 0 && (
            <div className="text-center py-[96px] bg-neutral-primary border-2 border-border-default shadow-md">
              <div className="text-6xl mb-6">🛡</div>
              <h2 className="text-3xl font-head font-bold text-heading mb-4">ARIA is ready.</h2>
              <p className="text-body text-lg mb-8 max-w-md mx-auto">
                Add your first task and ARIA will decompose it and build your execution plan.
              </p>
              <Link href="/task/new">
                <Button variant="primary" size="lg" className="text-lg">+ Add Task</Button>
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {activeTasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>

          {/* Mobile action log */}
          <div className="lg:hidden mt-[48px] bg-neutral-primary border-2 border-border-default shadow-md p-4">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-border-default pb-2">
              <span className="w-3 h-3 rounded-full bg-success border-2 border-border-default" />
              <span className="text-base font-bold font-head text-heading">ARIA LOG</span>
            </div>
            <ActionLog compact />
          </div>
        </main>

        <aside className="hidden lg:flex w-96 border-l-2 border-border-default flex-col bg-neutral-primary">
          <div className="p-4 border-b-2 border-border-default flex items-center justify-between bg-neutral-secondary-soft">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success border-2 border-border-default" />
              <span className="text-sm font-bold font-head text-heading">LIVE ACTIVITY</span>
            </div>
            <span className="text-xs font-semibold text-body bg-neutral-primary border-2 border-border-default px-2">SYSTE_OK</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-primary">
            <ActionLog compact />
          </div>
          <div className="p-4 border-t-2 border-border-default bg-neutral-secondary-soft text-center">
            <Link href="/log" className="text-sm font-bold text-heading hover:text-brand-strong transition-colors underline hover:no-underline">
              View all activity →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
