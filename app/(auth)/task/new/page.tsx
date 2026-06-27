'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useARIA } from '@/hooks/useARIA'
import { useMode } from '@/context/ModeContext'
import { ARIAStatus } from '@/components/aria/ActionLog'
import { Button, Card, RiskBadge } from '@/components/ui/index'
import { minutesToHuman } from '@/lib/utils/time'
import type { SubtaskPlan, Subtask } from '@/types/agents'
import { motion } from 'framer-motion'
import Link from 'next/link'

function SubtaskItem({ subtask, index }: { subtask: Subtask; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border rounded-lg p-3 transition-colors ${
        subtask.risk_flag
          ? 'border-aria-amber/30 bg-aria-amber/5'
          : 'border-aria-border bg-aria-surface'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xs text-aria-muted font-mono mt-0.5 w-4 flex-shrink-0">{index + 1}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-aria-text">{subtask.title}</span>
            {subtask.risk_flag && (
              <span className="text-[10px] text-aria-amber border border-aria-amber/30 rounded px-1.5 py-0.5">⚠ Risk</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-aria-muted">{minutesToHuman(subtask.estimated_minutes)}</span>
            {subtask.dependencies.length > 0 && (
              <span className="text-xs text-aria-muted">
                Depends on {subtask.dependencies.length} task{subtask.dependencies.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {expanded && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-aria-muted leading-relaxed">{subtask.description}</p>
              {subtask.risk_reason && (
                <p className="text-xs text-aria-amber/80">⚠ {subtask.risk_reason}</p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-aria-muted hover:text-aria-text text-xs flex-shrink-0 mt-0.5"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>
    </motion.div>
  )
}

export default function NewTaskPage() {
  const { user, loading } = useAuth()
  const { buildTask, loading: ariaLoading, error } = useARIA()
  const { setMode } = useMode()
  const router = useRouter()

  const [taskText, setTaskText] = useState('')
  const [deadline, setDeadline] = useState('')
  const [inputMode, setInputMode] = useState<'BUILD' | 'RESCUE'>('BUILD')
  const [result, setResult] = useState<{ plan: SubtaskPlan; taskId: string; riskLevel: string } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-aria-violet border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) { router.push('/'); return null }

  const getAvailableMinutes = (): number => {
    if (!deadline) return 480
    const diff = new Date(deadline).getTime() - Date.now()
    return Math.max(10, Math.round(diff / 60_000))
  }

  const handleSubmit = async () => {
    if (!taskText.trim() || !deadline) return

    if (inputMode === 'RESCUE') {
      const mins = getAvailableMinutes()
      router.push(`/rescue?desc=${encodeURIComponent(taskText)}&minutes=${mins}`)
      return
    }

    setMode('BUILD')
    const deadlineIso = new Date(deadline).toISOString()
    const availableMinutes = getAvailableMinutes()
    const res = await buildTask(taskText, deadlineIso, availableMinutes)
    if (res) {
      setResult({ plan: res.plan, taskId: res.task_id, riskLevel: res.risk_level })
    }
  }

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  // Results view
  if (result) {
    const { plan } = result
    const feasibility = !plan.feasible
      ? 'impossible'
      : plan.total_estimated_minutes > plan.available_minutes * 0.9
        ? 'tight'
        : 'achievable'

    return (
      <div className="min-h-screen">
        <header className="border-b border-aria-border px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard"><Button variant="ghost" size="sm">← Back</Button></Link>
          <h1 className="text-base font-semibold text-aria-text">⚡ ARIA Build Plan</h1>
        </header>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Summary card */}
          <Card>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-aria-muted mb-1">Task</p>
                <p className="text-sm font-medium text-aria-text">{taskText.slice(0, 100)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-semibold mb-1 ${
                  feasibility === 'achievable' ? 'text-aria-green' :
                  feasibility === 'tight' ? 'text-aria-amber' : 'text-aria-red'
                }`}>
                  {feasibility === 'achievable' ? '✓ Achievable' :
                   feasibility === 'tight' ? '⚠ Tight' : '✗ At Risk'}
                </div>
                <p className="text-xs text-aria-muted">
                  {minutesToHuman(plan.total_estimated_minutes)} needed · {minutesToHuman(plan.available_minutes)} available
                </p>
              </div>
            </div>
            {plan.warning && (
              <div className="mt-3 p-2.5 rounded-lg bg-aria-amber/10 border border-aria-amber/20">
                <p className="text-xs text-aria-amber">⚠ {plan.warning}</p>
              </div>
            )}
          </Card>

          {/* Subtasks */}
          <div>
            <h2 className="text-sm font-semibold text-aria-text mb-3">
              {plan.subtasks.length} Subtasks · ARIA&apos;s Execution Plan
            </h2>
            <div className="space-y-2">
              {plan.subtasks.map((s, i) => (
                <SubtaskItem key={s.id} subtask={s} index={i} />
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <Card>
            <p className="text-xs text-aria-violet mb-1.5 font-medium">ARIA&apos;s Reasoning</p>
            <p className="text-sm text-aria-muted leading-relaxed">{plan.reasoning}</p>
          </Card>

          {/* Action buttons */}
          {!confirmed ? (
            <div className="flex gap-3 pt-2">
              <Button variant="primary" onClick={handleConfirm} className="flex-1">
                ✓ Confirm Plan → Dashboard
              </Button>
              <Button variant="secondary" onClick={() => {
                const events = plan.calendar_blocks.map((b) => ({
                  title: b.title,
                  start: b.suggested_start || new Date().toISOString(),
                  durationMinutes: b.duration_minutes,
                }))
                import('@/lib/utils/ics').then(({ generateICS }) => {
                  const ics = generateICS(events)
                  const blob = new Blob([ics], { type: 'text/calendar' })
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = 'aria-plan.ics'
                  a.click()
                })
              }}>
                📅 .ics
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-aria-green text-3xl mb-2">✓</div>
              <p className="text-sm text-aria-green font-medium">Plan saved · Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Input view
  return (
    <div className="min-h-screen">
      <header className="border-b border-aria-border px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard"><Button variant="ghost" size="sm">← Back</Button></Link>
        <h1 className="text-base font-semibold text-aria-text">New Task</h1>
      </header>

      <div className="max-w-xl mx-auto p-4 sm:p-6">
        {ariaLoading ? (
          <ARIAStatus mode={inputMode} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-aria-text mb-1">What needs to get done?</h2>
              <p className="text-sm text-aria-muted">Describe your task in plain language — ARIA handles the rest.</p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl border border-aria-border overflow-hidden">
              <button
                onClick={() => setInputMode('BUILD')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  inputMode === 'BUILD'
                    ? 'bg-aria-violet text-white'
                    : 'text-aria-muted hover:text-aria-text bg-aria-surface'
                }`}
              >
                ⚡ Build Mode
              </button>
              <button
                onClick={() => setInputMode('RESCUE')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  inputMode === 'RESCUE'
                    ? 'bg-aria-amber text-black'
                    : 'text-aria-muted hover:text-aria-text bg-aria-surface'
                }`}
              >
                🚨 Rescue Mode
              </button>
            </div>

            <div>
              <textarea
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder={inputMode === 'BUILD'
                  ? 'e.g. "Write the quarterly product report, due Friday 11pm"'
                  : 'e.g. "Machine learning assignment due in 4 hours, 6 sections, haven\'t started"'
                }
                rows={4}
                maxLength={500}
                className="w-full bg-aria-surface border border-aria-border rounded-xl p-4 text-sm text-aria-text placeholder:text-aria-muted/50 focus:outline-none focus:border-aria-violet resize-none transition-colors"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-aria-muted">ARIA reads natural language — no special formatting needed</p>
                <span className="text-xs text-aria-muted">{taskText.length}/500</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-aria-muted mb-1.5 block">
                {inputMode === 'BUILD' ? 'Deadline' : 'Current date/time (ARIA uses this)'}
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-aria-surface border border-aria-border rounded-xl px-4 py-2.5 text-sm text-aria-text focus:outline-none focus:border-aria-violet transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-aria-red/10 border border-aria-red/20">
                <p className="text-sm text-aria-red">{error}</p>
              </div>
            )}

            <Button
              variant={inputMode === 'RESCUE' ? 'amber' : 'primary'}
              size="lg"
              onClick={handleSubmit}
              disabled={!taskText.trim() || !deadline}
              className="w-full"
            >
              {inputMode === 'BUILD' ? '⚡ Let ARIA Plan This' : '🚨 Activate Rescue Mode'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
