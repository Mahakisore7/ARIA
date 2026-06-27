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
import { motion } from 'framer-motion'
import Link from 'next/link'

function TaskCard({ task }: { task: Task }) {
  const completedCount = task.subtasks?.filter((s) => s.completed).length || 0
  const totalCount = task.subtasks?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-aria-surface border border-aria-border rounded-xl p-4 hover:border-aria-muted/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <RiskBadge level={task.risk_level} size="xs" />
            <span className="text-xs text-aria-muted">{isoToRelative(task.deadline_iso)}</span>
            <span className="text-xs text-aria-muted capitalize">{task.mode_created} mode</span>
          </div>
          <h3 className="text-sm font-medium text-aria-text leading-snug">{task.title}</h3>
          {totalCount > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-[11px] text-aria-muted mb-1">
                <span>{completedCount}/{totalCount} subtasks</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-aria-border rounded-full overflow-hidden">
                <div className="h-full bg-aria-violet rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Link href={`/task/${task.id}`}>
          <Button size="sm" variant="secondary">View →</Button>
        </Link>
        {(task.risk_level === 'CRITICAL' || task.risk_level === 'HIGH') && (
          <Link href={`/rescue?task=${task.id}&desc=${encodeURIComponent(task.description)}`}>
            <Button size="sm" variant="danger">🚨 Rescue</Button>
          </Link>
        )}
      </div>
    </motion.div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-aria-violet border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const criticalCount = tasks.filter((t) => t.risk_level === 'CRITICAL').length
  const activeTasks = tasks.filter((t) => t.status === 'active' || t.status === 'rescued')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-aria-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-aria-violet flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="font-semibold text-aria-text hidden sm:block tracking-tight">ARIA</span>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-xs text-aria-red font-semibold px-2 py-1 rounded-full bg-aria-red/10 border border-aria-red/20 animate-pulse">
              {criticalCount} CRITICAL
            </span>
          )}
          <Link href="/task/new">
            <Button size="sm" variant="primary">+ New Task</Button>
          </Link>
          <Link href="/rescue">
            <Button size="sm" variant="danger">🚨 Rescue</Button>
          </Link>
          <button onClick={signOut} className="text-xs text-aria-muted hover:text-aria-text ml-1 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-aria-text">Active Tasks</h1>
            <p className="text-sm text-aria-muted mt-1">
              {user.displayName ? `Welcome back, ${user.displayName.split(' ')[0]}.` : 'Welcome back.'}{' '}
              ARIA is monitoring {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {tasksLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
            </div>
          )}

          {!tasksLoading && activeTasks.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🛡</div>
              <h2 className="text-lg font-medium text-aria-text mb-2">ARIA is ready.</h2>
              <p className="text-aria-muted text-sm mb-6 max-w-xs mx-auto">
                Add your first task and ARIA will build your execution plan.
              </p>
              <Link href="/task/new">
                <Button variant="primary" size="lg">+ Add Your First Task</Button>
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {activeTasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>

          {/* Mobile action log */}
          <div className="lg:hidden mt-8">
            <div className="border-t border-aria-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-aria-green animate-pulse" />
                <span className="text-sm font-semibold text-aria-text">ARIA Activity</span>
              </div>
              <ActionLog compact />
            </div>
          </div>
        </main>

        <aside className="hidden lg:flex w-80 border-l border-aria-border flex-col">
          <div className="p-4 border-b border-aria-border flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aria-green animate-pulse" />
            <span className="text-xs font-semibold text-aria-text">ARIA Activity</span>
            <span className="text-xs text-aria-muted ml-auto">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ActionLog compact />
          </div>
          <div className="p-4 border-t border-aria-border">
            <Link href="/log" className="text-xs text-aria-violet hover:text-aria-violet/80 transition-colors">
              View all activity →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
