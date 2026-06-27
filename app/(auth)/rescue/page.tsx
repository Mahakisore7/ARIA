'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useARIA } from '@/hooks/useARIA'
import { useMode } from '@/context/ModeContext'
import { useRescueTimer } from '@/hooks/useRescueTimer'
import { ARIAStatus } from '@/components/aria/ActionLog'
import { Button, Card } from '@/components/ui/index'
import type { RescueResult, SprintBlock, RecipientType } from '@/types/agents'
import { motion } from 'framer-motion'
import Link from 'next/link'

function SprintBlockCard({ block, active, locked, onComplete }: {
  block: SprintBlock; active: boolean; locked: boolean; onComplete: () => void
}) {
  const timer = useRescueTimer(block.duration_minutes)

  return (
    <div className={`border rounded-xl p-4 transition-all ${
      block.completed ? 'border-aria-green/30 bg-aria-green/5 opacity-70' :
      active ? 'border-aria-amber bg-aria-amber/10' :
      locked ? 'border-aria-border bg-aria-surface opacity-40' :
      'border-aria-border bg-aria-surface'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
          block.completed ? 'bg-aria-green text-black' :
          active ? 'bg-aria-amber text-black animate-pulse' :
          'bg-aria-border text-aria-muted'
        }`}>
          {block.completed ? '✓' : block.block_number}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-aria-text">{block.title}</h3>
            <span className={`text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 ${
              active ? 'text-aria-amber bg-aria-amber/10' : 'text-aria-muted bg-aria-border'
            }`}>
              {block.duration_minutes}m
            </span>
          </div>
          <p className="text-xs text-aria-muted mt-1 leading-relaxed">{block.objective}</p>
          <p className="text-xs text-aria-green/70 mt-1.5">✓ Done when: <span className="text-aria-green/90">{block.checkin_signal}</span></p>

          {active && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xl font-bold ${timer.isCritical ? 'text-aria-red' : 'text-aria-amber'}`}>
                  {timer.display}
                </span>
                <div className="flex gap-2">
                  {!timer.running ? (
                    <Button size="sm" variant="amber" onClick={timer.start}>▶ Start</Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={timer.pause}>⏸ Pause</Button>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-aria-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-aria-amber rounded-full transition-all duration-1000"
                  style={{ width: `${100 - timer.percentLeft}%` }}
                />
              </div>
              <div className="p-2.5 rounded-lg bg-black/20 border border-aria-amber/10">
                <p className="text-xs text-aria-muted">
                  <span className="text-aria-amber/80 font-medium">Deliver:</span> {block.deliverable}
                </p>
              </div>
              <Button variant="amber" size="sm" onClick={onComplete} className="w-full">
                ✓ Block {block.block_number} Complete → Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RescueDashboard({ result, availableMinutes, taskDesc }: {
  result: RescueResult; availableMinutes: number; taskDesc: string
}) {
  const { triage, comms } = result
  const [activeBlock, setActiveBlock] = useState(0)
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([])
  const [emailCopied, setEmailCopied] = useState(false)
  const [showOutline, setShowOutline] = useState(false)
  const [showEmail, setShowEmail] = useState(true)
  const globalTimer = useRescueTimer(availableMinutes)

  useEffect(() => { globalTimer.start() }, [])

  const handleCopyEmail = () => {
    const subject = comms.email.subject_options[0]
    const text = `Subject: ${subject}\n\n${comms.email.body}`
    navigator.clipboard.writeText(text).then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2500)
    }).catch(() => {
      // Fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2500)
    })
  }

  const handleBlockComplete = (blockIndex: number) => {
    setCompletedBlocks((prev) => [...prev, blockIndex])
    triage.sprint_blocks[blockIndex].completed = true
    if (blockIndex + 1 < triage.sprint_blocks.length) {
      setActiveBlock(blockIndex + 1)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#1A1200' }}>
      {/* Amber header */}
      <div className="border-b border-aria-amber/20 bg-aria-amber/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-aria-amber text-sm font-bold tracking-wider">🚨 RESCUE MODE</span>
          <span className="text-xs text-aria-amber/50 hidden sm:block truncate max-w-48">
            — {taskDesc.slice(0, 40)}{taskDesc.length > 40 ? '...' : ''}
          </span>
        </div>
        <div className={`font-mono text-xl font-bold ${globalTimer.isCritical ? 'text-aria-red animate-pulse' : 'text-aria-amber'}`}>
          {globalTimer.display}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 pb-12">
        {/* Scope card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card amber>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-aria-amber/70 mb-1 font-semibold uppercase tracking-wider">Achievable Scope</p>
                <p className="text-5xl font-bold text-aria-amber leading-none">{triage.achievable_percentage}%</p>
                <p className="text-sm text-aria-text mt-2">
                  {triage.sections_achievable.length} of {triage.sections_achievable.length + triage.sections_cut.length} sections
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-aria-muted mb-1">Planned</p>
                <p className="text-2xl font-bold text-aria-text">{triage.total_planned_minutes}m</p>
                <p className="text-xs text-aria-muted">of {availableMinutes}m total</p>
              </div>
            </div>

            {triage.sections_achievable.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold text-aria-green">✓ Delivering</p>
                {triage.sections_achievable.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-aria-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-aria-green flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            )}

            {triage.sections_cut.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold text-aria-red/70">✗ Cut (time constraint)</p>
                {triage.sections_cut.map((s) => (
                  <div key={s.section} className="flex items-start gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-aria-red/40 flex-shrink-0 mt-0.5" />
                    <span className="text-aria-muted">
                      <strong className="text-aria-text/60">{s.section}:</strong> {s.reason}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 pt-3 border-t border-aria-amber/10 text-xs text-aria-amber/60 italic">
              {triage.reasoning}
            </p>
          </Card>
        </motion.div>

        {/* Sprint plan */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-sm font-semibold text-aria-text mb-3">
            Sprint Plan · {triage.sprint_blocks.length} Blocks · {triage.total_planned_minutes}m total
          </h2>
          <div className="space-y-3">
            {triage.sprint_blocks.map((block, i) => (
              <SprintBlockCard
                key={block.block_number}
                block={{ ...block, completed: completedBlocks.includes(i) }}
                active={i === activeBlock && !completedBlocks.includes(i)}
                locked={i > activeBlock}
                onComplete={() => handleBlockComplete(i)}
              />
            ))}
          </div>
        </motion.div>

        {/* Email draft */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="border border-aria-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="w-full flex items-center justify-between px-4 py-3 bg-aria-surface hover:bg-aria-bg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-aria-green">Stakeholder Communication — Ready</p>
                  <p className="text-xs text-aria-muted truncate max-w-xs">{comms.email.subject_options[0]}</p>
                </div>
              </div>
              <span className="text-aria-muted text-xs ml-2">{showEmail ? '▲' : '▼'}</span>
            </button>
            {showEmail && (
              <div className="p-4 bg-aria-surface border-t border-aria-border">
                <div className="mb-2">
                  <span className="text-xs text-aria-muted">Subject: </span>
                  <span className="text-xs text-aria-text font-medium">{comms.email.subject_options[0]}</span>
                </div>
                <div className="email-body text-sm text-aria-text/90 whitespace-pre-wrap leading-relaxed border border-aria-border rounded-lg p-3 bg-aria-bg text-xs">
                  {comms.email.body}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Button size="sm" variant="secondary" onClick={handleCopyEmail}>
                    {emailCopied ? '✓ Copied!' : '📋 Copy Email'}
                  </Button>
                  <span className="text-xs text-aria-muted">Tone: {comms.email.tone}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Outline */}
        {triage.outline.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="border border-aria-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowOutline(!showOutline)}
                className="w-full flex items-center justify-between px-4 py-3 bg-aria-surface hover:bg-aria-bg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <p className="text-xs font-semibold text-aria-text">Deliverable Outline — Achievable Scope Only</p>
                </div>
                <span className="text-aria-muted text-xs">{showOutline ? '▲' : '▼'}</span>
              </button>
              {showOutline && (
                <div className="p-4 bg-aria-surface border-t border-aria-border space-y-4">
                  {triage.outline.map((section) => (
                    <div key={section.section}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-aria-text">{section.section}</p>
                        <span className="text-xs text-aria-muted">{section.target_length}</span>
                      </div>
                      <ul className="space-y-1">
                        {section.key_points.map((point, i) => (
                          <li key={i} className="text-xs text-aria-muted flex items-start gap-2">
                            <span className="text-aria-violet flex-shrink-0 mt-px">·</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function RescuePage() {
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const { rescueTask, loading: ariaLoading, error } = useARIA()
  const { setMode } = useMode()
  const router = useRouter()

  const prefilledDesc = searchParams.get('desc') || ''
  const prefilledMinutes = parseInt(searchParams.get('minutes') || '0', 10)

  const [taskDesc, setTaskDesc] = useState(prefilledDesc)
  const [hoursAvailable, setHoursAvailable] = useState(
    prefilledMinutes > 0 ? String((prefilledMinutes / 60).toFixed(1)) : '4'
  )
  const [recipientType, setRecipientType] = useState<RecipientType>('manager')
  const [result, setResult] = useState<RescueResult | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/')
    setMode('RESCUE')
  }, [user, loading, router, setMode])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1200' }}>
        <div className="w-6 h-6 border-2 border-aria-amber border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (result) {
    return (
      <RescueDashboard
        result={result}
        availableMinutes={Math.round(parseFloat(hoursAvailable) * 60)}
        taskDesc={taskDesc}
      />
    )
  }

  const handleActivate = async () => {
    const minutes = Math.round(parseFloat(hoursAvailable) * 60)
    if (isNaN(minutes) || minutes < 5) return
    const res = await rescueTask(taskDesc, minutes, recipientType)
    if (res) setResult(res)
  }

  return (
    <div className="min-h-screen" style={{ background: '#1A1200' }}>
      <div className="border-b border-aria-amber/20 bg-aria-amber/10 px-4 sm:px-6 py-3 flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-aria-amber/70 hover:text-aria-amber">← Back</Button>
        </Link>
        <span className="text-aria-amber text-sm font-bold">🚨 RESCUE MODE</span>
      </div>

      <div className="max-w-xl mx-auto p-4 sm:p-6">
        {ariaLoading ? (
          <ARIAStatus mode="RESCUE" />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-aria-amber mb-1">Deadline Emergency</h2>
              <p className="text-sm text-aria-amber/60">
                ARIA will triage your situation, build your sprint plan, and draft the stakeholder email.
              </p>
            </div>

            <div>
              <label className="text-xs text-aria-muted mb-1.5 block">What&apos;s due?</label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="e.g. Machine learning assignment, 6 sections, haven't started. Due tonight."
                rows={3}
                className="w-full bg-black/30 border border-aria-amber/30 rounded-xl p-4 text-sm text-aria-text placeholder:text-aria-muted/40 focus:outline-none focus:border-aria-amber resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-aria-muted mb-1.5 block">Hours available</label>
              <input
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                value={hoursAvailable}
                onChange={(e) => setHoursAvailable(e.target.value)}
                className="w-full bg-black/30 border border-aria-amber/30 rounded-xl px-4 py-2.5 text-sm text-aria-text focus:outline-none focus:border-aria-amber"
              />
            </div>

            <div>
              <label className="text-xs text-aria-muted mb-1.5 block">Stakeholder to communicate with</label>
              <select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value as RecipientType)}
                className="w-full bg-black/30 border border-aria-amber/30 rounded-xl px-4 py-2.5 text-sm text-aria-text focus:outline-none focus:border-aria-amber"
              >
                <option value="professor">Professor / Teacher</option>
                <option value="manager">Manager</option>
                <option value="client">Client</option>
                <option value="colleague">Colleague</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-aria-red/10 border border-aria-red/20">
                <p className="text-sm text-aria-red">{error}</p>
              </div>
            )}

            <Button
              variant="amber"
              size="lg"
              onClick={handleActivate}
              disabled={!taskDesc.trim() || !hoursAvailable || parseFloat(hoursAvailable) <= 0}
              className="w-full text-base"
            >
              🚨 Activate Rescue — ARIA Will Handle It
            </Button>

            <p className="text-xs text-aria-muted/60 text-center">
              ARIA calculates achievable scope, builds your sprint plan, and drafts your stakeholder email — in under 15 seconds.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function RescuePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1A1200' }}>
        <div className="w-6 h-6 border-2 border-aria-amber border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RescuePage />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
