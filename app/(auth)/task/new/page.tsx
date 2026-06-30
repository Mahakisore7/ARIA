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
import { Zap, Siren, ArrowLeft, Calendar, Check, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

function SubtaskItem({ subtask, index }: { subtask: Subtask; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`border-2 border-border-default rounded-none p-4 transition-all duration-200 ${
        subtask.risk_flag
          ? 'bg-warning-soft border-border-warning'
          : 'bg-neutral-primary hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-sm text-heading font-head bg-neutral-secondary-soft border-2 border-border-default px-2 py-1 flex-shrink-0 shadow-xs">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="text-lg font-bold text-heading font-head uppercase leading-tight">{subtask.title}</span>
            {subtask.risk_flag && (
              <span className="text-xs font-bold text-danger uppercase border-2 border-border-danger bg-danger-soft px-2 py-0.5 inline-flex items-center gap-1 shadow-xs">
                <AlertTriangle className="w-3 h-3" strokeWidth={3} /> Risk
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 border-2 border-border-default inline-flex bg-neutral-secondary-soft px-3 py-1 shadow-xs">
            <span className="text-sm font-semibold text-heading tracking-tight">{minutesToHuman(subtask.estimated_minutes)}</span>
            {subtask.dependencies.length > 0 && (
              <span className="text-sm font-semibold text-body-subtle tracking-tight border-l-2 border-border-default pl-4">
                Depends on {subtask.dependencies.length} task{subtask.dependencies.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {expanded && (
            <div className="mt-4 p-4 border-2 border-border-default bg-neutral-secondary-medium shadow-sm">
              <p className="text-sm text-heading font-medium leading-relaxed">{subtask.description}</p>
              {subtask.risk_reason && (
                <p className="text-sm font-bold text-danger mt-3 uppercase tracking-tight flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={3} /> 
                  <span>{subtask.risk_reason}</span>
                </p>
              )}
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setExpanded(!expanded)} className="flex-shrink-0 px-3 py-1 text-xs">
          {expanded ? 'HIDE' : 'VIEW'}
        </Button>
      </div>
    </div>
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-primary-soft">
        <div className="w-8 h-8 border-[3px] border-border-default border-t-brand rounded-full animate-spin" />
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
      <div className="min-h-screen bg-neutral-secondary-soft text-body font-sans">
        <header className="border-b-2 border-border-default bg-neutral-primary px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="px-2 border-2 border-border-default bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium">
              <ArrowLeft className="w-5 h-5 text-heading" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-brand" strokeWidth={3} />
            <h1 className="text-xl font-bold font-head text-heading uppercase tracking-tight">Build Plan Active</h1>
          </div>
        </header>

        <div className="max-w-[1024px] mx-auto p-6 lg:p-[48px] space-y-8">
          {/* Summary card */}
          <Card className="bg-brand-soft border-border-brand shadow-lg">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-heading uppercase tracking-widest mb-2 border-2 border-border-default inline-block px-2 py-1 bg-neutral-primary">Task Overview</p>
                <h2 className="text-2xl font-bold text-heading font-head leading-tight">{taskText}</h2>
              </div>
              <div className="text-right flex-shrink-0 border-2 border-border-default bg-neutral-primary p-4 shadow-sm">
                <div className={`text-lg font-bold font-head uppercase mb-2 flex items-center justify-end gap-2 ${
                  feasibility === 'achievable' ? 'text-success' :
                  feasibility === 'tight' ? 'text-warning' : 'text-danger'
                }`}>
                  {feasibility === 'achievable' ? <><Check strokeWidth={3} className="w-5 h-5"/> Achievable</> :
                   feasibility === 'tight' ? <><AlertTriangle strokeWidth={3} className="w-5 h-5"/> Tight</> : 
                   <><AlertTriangle strokeWidth={3} className="w-5 h-5"/> At Risk</>}
                </div>
                <div className="grid grid-cols-2 gap-4 text-left border-t-2 border-border-default pt-2 mt-2">
                  <div>
                    <p className="text-xs text-body-subtle font-bold uppercase">Needed</p>
                    <p className="text-base font-bold text-heading">{minutesToHuman(plan.total_estimated_minutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-body-subtle font-bold uppercase">Available</p>
                    <p className="text-base font-bold text-heading">{minutesToHuman(plan.available_minutes)}</p>
                  </div>
                </div>
              </div>
            </div>
            {plan.warning && (
              <div className="mt-6 p-4 bg-warning border-2 border-border-default shadow-xs flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-black flex-shrink-0" strokeWidth={2.5} />
                <p className="text-base font-bold text-black leading-tight uppercase tracking-tight">{plan.warning}</p>
              </div>
            )}
          </Card>

          {/* Reasoning */}
          <Card className="bg-neutral-primary">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-border-default pb-3">
              <Zap className="w-5 h-5 text-brand" strokeWidth={3} />
              <h2 className="text-lg font-bold text-heading font-head uppercase tracking-tight">ARIA's Reasoning</h2>
            </div>
            <p className="text-base text-heading font-medium leading-relaxed">{plan.reasoning}</p>
          </Card>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-heading font-head uppercase tracking-tight">
                Execution Plan
              </h2>
              <span className="text-sm font-bold text-heading bg-neutral-primary border-2 border-border-default px-3 py-1 shadow-xs">
                {plan.subtasks.length} SUBTASKS
              </span>
            </div>
            <div className="space-y-4">
              {plan.subtasks.map((s, i) => (
                <SubtaskItem key={s.id} subtask={s} index={i} />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {!confirmed ? (
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-border-default">
              <Button variant="primary" size="lg" onClick={handleConfirm} className="flex-1 text-lg">
                <Check className="w-5 h-5 mr-2" strokeWidth={3} />
                Confirm Plan & Initialize
              </Button>
              <Button variant="secondary" size="lg" onClick={() => {
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
              }} className="px-6 text-lg">
                <Calendar className="w-5 h-5 mr-2" strokeWidth={2.5} />
                .ics Export
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 bg-success-soft border-2 border-border-success shadow-md">
              <Check className="w-16 h-16 text-success mx-auto mb-4" strokeWidth={3} />
              <h2 className="text-3xl font-bold text-heading font-head uppercase tracking-tight mb-2">Plan Saved</h2>
              <p className="text-lg text-heading font-medium">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Input view
  return (
    <div className="min-h-screen bg-neutral-secondary-soft text-body font-sans">
      <header className="border-b-2 border-border-default bg-neutral-primary px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="px-2 border-2 border-border-default bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium">
            <ArrowLeft className="w-5 h-5 text-heading" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold font-head text-heading uppercase tracking-tight">New Task Request</h1>
      </header>

      <div className="max-w-[800px] mx-auto p-6 lg:p-[96px]">
        {ariaLoading ? (
          <div className="bg-neutral-primary border-2 border-border-default p-8 shadow-xl">
             <ARIAStatus mode={inputMode} />
          </div>
        ) : (
          <div className="space-y-8 bg-neutral-primary border-2 border-border-default p-8 shadow-xl relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-warning rounded-full border-2 border-border-default opacity-20 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-heading font-head uppercase leading-none tracking-tight mb-3">What needs to get done?</h2>
              <p className="text-lg text-heading font-medium">Describe your task in plain language — ARIA handles the rest.</p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-neutral-secondary-soft border-2 border-border-default p-1 relative z-10 shadow-xs">
              <button
                onClick={() => setInputMode('BUILD')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-lg font-bold font-head uppercase transition-all duration-200 border-2 ${
                  inputMode === 'BUILD'
                    ? 'bg-brand border-border-default text-black shadow-sm'
                    : 'bg-transparent border-transparent text-heading hover:bg-neutral-secondary-medium'
                }`}
              >
                <Zap className="w-5 h-5" strokeWidth={3} />
                Build Mode
              </button>
              <button
                onClick={() => setInputMode('RESCUE')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-lg font-bold font-head uppercase transition-all duration-200 border-2 ${
                  inputMode === 'RESCUE'
                    ? 'bg-danger border-border-danger text-white shadow-sm'
                    : 'bg-transparent border-transparent text-heading hover:bg-neutral-secondary-medium'
                }`}
              >
                <Siren className="w-5 h-5" strokeWidth={3} />
                Rescue Mode
              </button>
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <textarea
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder={inputMode === 'BUILD'
                    ? 'e.g. "Write the quarterly product report, due Friday 11pm"'
                    : 'e.g. "Machine learning assignment due in 4 hours, 6 sections, haven\'t started"'
                  }
                  rows={5}
                  maxLength={500}
                  className="w-full bg-neutral-primary border-2 border-border-default rounded-none p-5 text-lg text-heading font-medium placeholder:text-body-subtle focus:outline-none focus:ring-4 focus:ring-brand focus:border-border-default resize-none transition-all shadow-sm"
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm font-bold text-body-subtle uppercase tracking-tight">ARIA reads natural language</p>
                  <span className="text-sm font-bold text-body-subtle bg-neutral-secondary-soft border-2 border-border-default px-2 shadow-xs">{taskText.length}/500</span>
                </div>
              </div>

              <div className="border-t-2 border-border-default pt-6">
                <label className="text-sm font-bold text-heading uppercase tracking-widest block mb-2">
                  {inputMode === 'BUILD' ? 'Target Deadline' : 'Emergency Time (ARIA uses this)'}
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-neutral-primary border-2 border-border-default rounded-none px-5 py-4 text-lg text-heading font-bold focus:outline-none focus:ring-4 focus:ring-brand focus:border-border-default transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-danger-soft border-2 border-border-danger shadow-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" strokeWidth={3} />
                  <p className="text-base font-bold text-danger leading-tight">{error}</p>
                </div>
              )}

              <Button
                variant={inputMode === 'RESCUE' ? 'danger' : 'primary'}
                size="lg"
                onClick={handleSubmit}
                disabled={!taskText.trim() || !deadline}
                className="w-full text-xl py-6 tracking-tight shadow-md"
              >
                {inputMode === 'BUILD' ? <><Zap className="w-6 h-6 mr-2" strokeWidth={3} /> Initialize Build Plan</> : <><Siren className="w-6 h-6 mr-2" strokeWidth={3} /> Activate Rescue Protocol</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
