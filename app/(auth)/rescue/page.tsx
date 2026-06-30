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
import { Siren, ArrowLeft, Check, AlertTriangle, Play, Pause, Copy, Mail, FileText, ChevronDown, ChevronUp } from 'lucide-react'

function SprintBlockCard({ block, active, locked, onComplete }: {
  block: SprintBlock; active: boolean; locked: boolean; onComplete: () => void
}) {
  const timer = useRescueTimer(block.duration_minutes)

  return (
    <div className={`border-2 border-border-default p-4 transition-all duration-200 ${
      block.completed ? 'bg-success-soft opacity-80 border-border-success' :
      active ? 'bg-danger-soft border-border-danger shadow-sm translate-x-1' :
      locked ? 'bg-neutral-secondary-soft opacity-60' :
      'bg-neutral-primary hover:-translate-y-1 hover:shadow-sm'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 border-2 border-border-default flex items-center justify-center text-lg font-head font-bold flex-shrink-0 shadow-xs ${
          block.completed ? 'bg-success text-black border-border-success' :
          active ? 'bg-danger text-white border-border-danger animate-pulse' :
          'bg-neutral-secondary-medium text-heading'
        }`}>
          {block.completed ? <Check strokeWidth={4} className="w-6 h-6" /> : block.block_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <h3 className="text-xl font-bold font-head text-heading uppercase tracking-tight">{block.title}</h3>
            <span className={`text-sm font-bold font-mono px-3 py-1 border-2 border-border-default flex-shrink-0 shadow-xs ${
              active ? 'bg-danger text-white border-border-danger' : 'bg-neutral-primary text-heading'
            }`}>
              {block.duration_minutes} MIN
            </span>
          </div>
          <p className="text-base font-medium text-heading leading-relaxed">{block.objective}</p>
          <div className="flex items-center gap-2 mt-3 bg-neutral-secondary-medium border-2 border-border-default p-2 inline-flex shadow-xs">
            <Check className="w-4 h-4 text-success" strokeWidth={4} />
            <span className="text-sm font-bold text-heading uppercase tracking-tight">Done when:</span>
            <span className="text-sm font-bold text-success uppercase">{block.checkin_signal}</span>
          </div>

          {active && (
            <div className="mt-6 space-y-4 bg-neutral-primary border-2 border-border-danger p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`font-mono text-3xl font-bold tracking-tighter ${timer.isCritical ? 'text-danger animate-pulse' : 'text-heading'}`}>
                  {timer.display}
                </span>
                <div className="flex gap-2">
                  {!timer.running ? (
                    <Button size="sm" variant="danger" onClick={timer.start} className="px-4">
                      <Play className="w-4 h-4 mr-1" strokeWidth={3} /> Start
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={timer.pause} className="px-4 border-2 border-border-default">
                      <Pause className="w-4 h-4 mr-1" strokeWidth={3} /> Pause
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="h-4 bg-neutral-secondary-medium border-2 border-border-default overflow-hidden relative shadow-inner">
                <div
                  className="h-full bg-danger transition-all duration-1000 border-r-2 border-border-default"
                  style={{ width: `${100 - timer.percentLeft}%` }}
                />
              </div>

              <div className="p-3 bg-warning-soft border-2 border-border-warning shadow-xs">
                <p className="text-sm font-bold text-heading uppercase tracking-tight flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" strokeWidth={3} />
                  <span><span className="text-warning font-black">DELIVER:</span> {block.deliverable}</span>
                </p>
              </div>

              <Button variant="danger" size="lg" onClick={onComplete} className="w-full text-lg shadow-sm">
                <Check className="w-5 h-5 mr-2" strokeWidth={4} /> Block {block.block_number} Complete → Next
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
    <div className="min-h-screen bg-neutral-secondary-soft text-body font-sans selection:bg-danger selection:text-white">
      {/* Header */}
      <header className="border-b-4 border-border-danger bg-danger px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <Siren className="w-8 h-8 text-white animate-pulse" strokeWidth={2.5} />
          <span className="text-white text-xl font-bold font-head uppercase tracking-widest hidden sm:inline-block">RESCUE ACTIVE</span>
          <span className="text-white/80 font-bold bg-black/20 px-3 py-1 border-2 border-black/40 hidden md:block truncate max-w-xs shadow-inner">
            {taskDesc.slice(0, 40)}{taskDesc.length > 40 ? '...' : ''}
          </span>
        </div>
        <div className={`font-mono text-3xl font-black px-4 py-1 border-2 shadow-xs ${globalTimer.isCritical ? 'text-white bg-black border-black animate-pulse' : 'bg-neutral-primary text-danger border-border-default'}`}>
          {globalTimer.display}
        </div>
      </header>

      <div className="max-w-[1024px] mx-auto p-4 sm:p-6 lg:p-[48px] space-y-8">
        {/* Scope card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-danger-soft border-border-danger shadow-lg p-0 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-8">
              <div>
                <p className="text-sm font-black text-danger uppercase tracking-widest mb-3 border-2 border-border-danger inline-block px-3 py-1 bg-neutral-primary shadow-xs">Achievable Scope</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-7xl font-black font-head text-danger leading-none tracking-tighter">{triage.achievable_percentage}%</p>
                </div>
                <p className="text-lg font-bold text-heading mt-4 uppercase tracking-tight">
                  <span className="bg-neutral-primary border-2 border-border-default px-2 shadow-xs mr-2">{triage.sections_achievable.length} of {triage.sections_achievable.length + triage.sections_cut.length}</span> SECTIONS
                </p>
              </div>
              <div className="text-right md:border-l-4 md:border-border-danger md:pl-8">
                <p className="text-sm font-black text-heading uppercase tracking-widest mb-2">Planned Time</p>
                <p className="text-5xl font-black font-mono text-heading bg-neutral-primary border-2 border-border-default px-4 shadow-xs inline-block">{triage.total_planned_minutes}m</p>
                <p className="text-sm font-bold text-body-subtle uppercase mt-2">of {availableMinutes}m total</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border-t-4 border-border-danger divide-y-4 md:divide-y-0 md:divide-x-4 divide-border-danger bg-neutral-primary">
              <div className="p-6">
                <p className="text-base font-black text-success uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Check strokeWidth={4} className="w-6 h-6" /> Delivering
                </p>
                <div className="space-y-3">
                  {triage.sections_achievable.map((s) => (
                    <div key={s} className="flex items-start gap-3 text-base font-bold text-heading uppercase">
                      <div className="w-3 h-3 border-2 border-border-success bg-success mt-1.5 flex-shrink-0 shadow-xs" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-neutral-secondary-soft">
                <p className="text-base font-black text-danger uppercase tracking-widest flex items-center gap-2 mb-4">
                  <AlertTriangle strokeWidth={4} className="w-6 h-6" /> Cut (Time Constraint)
                </p>
                {triage.sections_cut.length > 0 ? (
                  <div className="space-y-4">
                    {triage.sections_cut.map((s) => (
                      <div key={s.section} className="flex items-start gap-3">
                        <div className="w-3 h-3 border-2 border-border-danger bg-danger mt-1.5 flex-shrink-0 shadow-xs" />
                        <div>
                          <p className="text-base font-black text-heading uppercase">{s.section}</p>
                          <p className="text-sm font-medium text-body-subtle">{s.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-body-subtle uppercase">None cut</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-danger border-t-4 border-border-danger">
              <p className="text-sm font-bold text-white uppercase tracking-tight flex items-start gap-2">
                <Siren className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
                <span>{triage.reasoning}</span>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Sprint plan */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-head text-heading uppercase tracking-tight">
              Sprint Execution Plan
            </h2>
            <div className="flex gap-2">
              <span className="text-sm font-bold font-mono text-heading bg-neutral-primary border-2 border-border-default px-3 py-1 shadow-xs">
                {triage.sprint_blocks.length} BLOCKS
              </span>
            </div>
          </div>
          <div className="space-y-4">
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
          <div className="border-4 border-border-default bg-neutral-primary shadow-md">
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="w-full flex items-center justify-between p-6 bg-warning-soft hover:bg-warning transition-colors border-b-4 border-border-default"
            >
              <div className="flex items-center gap-4 text-left">
                <Mail className="w-8 h-8 text-black" strokeWidth={2.5} />
                <div>
                  <p className="text-lg font-black font-head text-heading uppercase tracking-tight">Stakeholder Comm — Ready</p>
                  <p className="text-sm font-bold text-body truncate max-w-sm md:max-w-xl">{comms.email.subject_options[0]}</p>
                </div>
              </div>
              <div className="border-2 border-border-default bg-neutral-primary p-1 shadow-xs">
                {showEmail ? <ChevronUp strokeWidth={3} className="text-heading" /> : <ChevronDown strokeWidth={3} className="text-heading" />}
              </div>
            </button>
            {showEmail && (
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-sm font-black text-heading uppercase tracking-widest bg-neutral-secondary-soft border-2 border-border-default px-3 py-1">SUBJECT</span>
                  <span className="text-base font-bold text-heading">{comms.email.subject_options[0]}</span>
                </div>
                <div className="email-body text-base font-medium text-heading whitespace-pre-wrap leading-relaxed border-2 border-border-default p-6 bg-neutral-secondary-soft shadow-inner font-mono">
                  {comms.email.body}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <Button size="lg" variant="primary" onClick={handleCopyEmail} className="w-full sm:w-auto text-lg shadow-sm">
                    {emailCopied ? <><Check className="w-5 h-5 mr-2" strokeWidth={4} /> COPIED!</> : <><Copy className="w-5 h-5 mr-2" strokeWidth={3} /> COPY TO CLIPBOARD</>}
                  </Button>
                  <span className="text-sm font-bold text-body-subtle uppercase tracking-widest border-2 border-border-default px-3 py-1 bg-neutral-secondary-soft">Tone: {comms.email.tone}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Outline */}
        {triage.outline.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="border-4 border-border-default bg-neutral-primary shadow-md">
              <button
                onClick={() => setShowOutline(!showOutline)}
                className="w-full flex items-center justify-between p-6 bg-brand-soft hover:bg-brand transition-colors border-b-4 border-border-default"
              >
                <div className="flex items-center gap-4 text-left">
                  <FileText className="w-8 h-8 text-black" strokeWidth={2.5} />
                  <p className="text-lg font-black font-head text-heading uppercase tracking-tight">Deliverable Outline — Achievable Scope</p>
                </div>
                <div className="border-2 border-border-default bg-neutral-primary p-1 shadow-xs">
                  {showOutline ? <ChevronUp strokeWidth={3} className="text-heading" /> : <ChevronDown strokeWidth={3} className="text-heading" />}
                </div>
              </button>
              {showOutline && (
                <div className="p-6 space-y-6">
                  {triage.outline.map((section) => (
                    <div key={section.section} className="border-2 border-border-default p-4 bg-neutral-secondary-soft shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 border-b-2 border-border-default pb-3">
                        <p className="text-lg font-black text-heading uppercase tracking-tight">{section.section}</p>
                        <span className="text-sm font-bold text-heading bg-neutral-primary border-2 border-border-default px-2 py-1 shadow-xs">{section.target_length}</span>
                      </div>
                      <ul className="space-y-3">
                        {section.key_points.map((point, i) => (
                          <li key={i} className="text-base font-medium text-heading flex items-start gap-3">
                            <Zap className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" strokeWidth={3} />
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

        <div className="pt-8 text-center pb-8">
          <Link href="/dashboard">
            <Button variant="secondary" size="lg" className="border-4 border-border-default shadow-md text-lg px-8">
              <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={3} /> Return to Dashboard
            </Button>
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
      <div className="min-h-screen flex items-center justify-center bg-danger-soft">
        <div className="w-12 h-12 border-4 border-border-danger border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-neutral-secondary-soft text-body font-sans selection:bg-danger selection:text-white">
      <header className="border-b-4 border-border-danger bg-danger px-6 py-4 flex items-center gap-4 shadow-md sticky top-0 z-20">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="px-2 border-2 border-border-danger bg-neutral-primary hover:bg-neutral-secondary-soft">
            <ArrowLeft className="w-5 h-5 text-danger" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Siren className="w-8 h-8 text-white animate-pulse" strokeWidth={2.5} />
          <h1 className="text-2xl font-black font-head text-white uppercase tracking-widest">RESCUE MODE</h1>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto p-6 lg:p-[96px]">
        {ariaLoading ? (
          <div className="bg-neutral-primary border-4 border-border-danger p-8 shadow-xl">
            <ARIAStatus mode="RESCUE" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-neutral-primary border-4 border-border-danger p-8 md:p-12 shadow-xl relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-danger rounded-full border-4 border-border-danger opacity-10 pointer-events-none" />

            <div className="relative z-10 border-b-4 border-border-danger pb-6">
              <h2 className="text-4xl font-black text-danger font-head uppercase leading-none tracking-tight mb-4 flex items-center gap-3">
                <AlertTriangle className="w-10 h-10" strokeWidth={3} />
                Deadline Emergency
              </h2>
              <p className="text-xl font-bold text-heading">
                ARIA will triage your situation, build your sprint plan, and draft the stakeholder email.
              </p>
            </div>

            <div className="relative z-10 space-y-8">
              <div>
                <label className="text-base font-black text-heading uppercase tracking-widest block mb-3 bg-neutral-secondary-soft border-2 border-border-default inline-block px-3 py-1 shadow-xs">What's due?</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="e.g. Machine learning assignment, 6 sections, haven't started. Due tonight."
                  rows={4}
                  className="w-full bg-neutral-primary border-4 border-border-default rounded-none p-5 text-xl text-heading font-medium placeholder:text-body-subtle focus:outline-none focus:ring-4 focus:ring-danger focus:border-border-danger resize-none transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-base font-black text-heading uppercase tracking-widest block mb-3 bg-neutral-secondary-soft border-2 border-border-default inline-block px-3 py-1 shadow-xs">Hours available</label>
                  <input
                    type="number"
                    min="0.25"
                    max="24"
                    step="0.25"
                    value={hoursAvailable}
                    onChange={(e) => setHoursAvailable(e.target.value)}
                    className="w-full bg-neutral-primary border-4 border-border-default rounded-none px-5 py-4 text-2xl text-heading font-black font-mono focus:outline-none focus:ring-4 focus:ring-danger focus:border-border-danger transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-base font-black text-heading uppercase tracking-widest block mb-3 bg-neutral-secondary-soft border-2 border-border-default inline-block px-3 py-1 shadow-xs">Stakeholder Type</label>
                  <div className="relative">
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value as RecipientType)}
                      className="w-full bg-neutral-primary border-4 border-border-default rounded-none px-5 py-4 text-lg text-heading font-bold focus:outline-none focus:ring-4 focus:ring-danger focus:border-border-danger transition-all shadow-sm appearance-none"
                    >
                      <option value="professor">Professor / Teacher</option>
                      <option value="manager">Manager</option>
                      <option value="client">Client</option>
                      <option value="colleague">Colleague</option>
                      <option value="investor">Investor</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown strokeWidth={4} className="text-heading" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-danger border-4 border-border-danger shadow-sm flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-white flex-shrink-0" strokeWidth={3} />
                  <p className="text-lg font-black text-white leading-tight uppercase tracking-tight">{error}</p>
                </div>
              )}

              <Button
                variant="danger"
                size="lg"
                onClick={handleActivate}
                disabled={!taskDesc.trim() || !hoursAvailable || parseFloat(hoursAvailable) <= 0}
                className="w-full text-2xl py-8 tracking-tight shadow-lg border-4"
              >
                <Siren className="w-8 h-8 mr-3 animate-pulse" strokeWidth={3} />
                Activate Rescue Protocol
              </Button>

              <div className="p-4 bg-warning-soft border-2 border-border-warning shadow-xs text-center">
                <p className="text-sm font-bold text-heading uppercase tracking-widest">
                  ARIA calculates scope, builds sprint plan, and drafts emails — <span className="text-danger font-black">under 15s</span>.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function RescuePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-danger-soft">
        <div className="w-12 h-12 border-4 border-border-danger border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RescuePage />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
