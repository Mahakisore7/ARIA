'use client'
import { useState, useEffect } from 'react'
import { useActionLog } from '@/hooks/useActionLog'
import { useAuth } from '@/context/AuthContext'
import { Modal, Button } from '@/components/ui/index'
import type { ActionLogEntry, AgentName } from '@/types/agents'
import { Zap, Siren, Mail, ShieldCheck, Cpu, ArrowRight, CornerDownRight, Activity } from 'lucide-react'

const agentStyles: Record<AgentName, { bg: string; text: string; border: string; icon: any }> = {
  'ARIA-Core':   { bg: 'bg-neutral-secondary-soft', text: 'text-heading', border: 'border-border-default', icon: Cpu },
  'ARIA-Build':  { bg: 'bg-brand-soft', text: 'text-brand', border: 'border-border-brand', icon: Zap },
  'ARIA-Rescue': { bg: 'bg-danger-soft', text: 'text-danger', border: 'border-border-danger', icon: Siren },
  'ARIA-Comms':  { bg: 'bg-success-soft', text: 'text-success', border: 'border-border-success', icon: Mail },
  'ARIA-Shield': { bg: 'bg-warning-soft', text: 'text-warning', border: 'border-border-warning', icon: ShieldCheck },
  'ARIA-Check':  { bg: 'bg-neutral-secondary-medium', text: 'text-heading', border: 'border-border-default', icon: CheckIcon },
}

function CheckIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return 'JUST NOW'
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}M AGO`
  return `${Math.round(diff / 3_600_000)}H AGO`
}

function ActionEntry({ entry }: { entry: ActionLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const agentStyle = agentStyles[entry.agent] || agentStyles['ARIA-Core']
  const IconComponent = agentStyle.icon

  return (
    <div className="border-4 border-border-default bg-neutral-primary shadow-md mb-6 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 md:p-6">
        <div className={`w-14 h-14 border-4 ${agentStyle.border} flex items-center justify-center flex-shrink-0 bg-neutral-primary shadow-xs`}>
          <IconComponent className={`w-7 h-7 ${agentStyle.text}`} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap border-b-2 border-border-default pb-3">
            <span className={`text-sm font-black font-mono px-3 py-1 border-2 uppercase tracking-widest shadow-xs bg-neutral-primary ${agentStyle.border} ${agentStyle.text}`}>
              {entry.agent}
            </span>
            <span className="text-sm font-bold text-body-subtle bg-neutral-secondary-soft border-2 border-border-default px-2 py-0.5">{timeAgo(entry.timestamp)}</span>
            {entry.undoable && (
              <span className="text-xs font-black text-success uppercase border-2 border-border-success bg-success-soft px-2 py-0.5 ml-auto shadow-xs hidden sm:block">Reversible</span>
            )}
          </div>
          <p className="text-lg font-bold text-heading leading-relaxed uppercase tracking-tight">{entry.output_summary}</p>
          {expanded && (
            <div className="mt-4 p-4 border-2 border-border-default bg-neutral-secondary-soft shadow-inner">
              <p className="text-sm font-medium text-heading font-mono leading-relaxed">{entry.input_summary}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t-2 border-border-default">
            <Button size="sm" variant="primary" onClick={() => setReasoningOpen(true)} className="px-4 py-1 text-sm shadow-xs">
              WHY? <ArrowRight className="w-4 h-4 ml-1" strokeWidth={3} />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setExpanded(!expanded)} className="px-4 py-1 text-sm bg-white text-black hover:bg-neutral-primary hover:text-heading shadow-xs">
              {expanded ? 'LESS' : 'DETAILS'}
            </Button>
          </div>
        </div>
      </div>

      <Modal open={reasoningOpen} onClose={() => setReasoningOpen(false)} title="ARIA'S REASONING">
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-border-default pb-4">
            <div className="flex-1">
              <p className="text-xs font-black text-body-subtle uppercase tracking-widest mb-1">Agent</p>
              <span className={`text-sm font-black font-mono px-3 py-1 border-2 uppercase tracking-widest bg-neutral-primary ${agentStyle.border} ${agentStyle.text}`}>
                {entry.agent}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-body-subtle uppercase tracking-widest mb-1">Action</p>
              <p className="text-base font-bold text-heading uppercase tracking-tight">{entry.action_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-body-subtle uppercase tracking-widest mb-2 flex items-center gap-2">
              <CornerDownRight className="w-4 h-4" strokeWidth={3} /> Logic Log
            </p>
            <p className="text-base text-heading font-medium leading-relaxed bg-neutral-secondary-soft border-2 border-border-default p-5 shadow-inner">
              {entry.reasoning}
            </p>
          </div>
          {entry.metadata && (
            <div className="pt-4 border-t-2 border-border-default grid grid-cols-2 gap-4">
              <div className="bg-neutral-primary border-2 border-border-default p-3 shadow-xs">
                <p className="text-xs font-black text-body-subtle uppercase tracking-widest mb-1">Model</p>
                <p className="text-sm font-bold text-heading font-mono truncate">{entry.metadata.gemini_model}</p>
              </div>
              <div className="bg-neutral-primary border-2 border-border-default p-3 shadow-xs">
                <p className="text-xs font-black text-body-subtle uppercase tracking-widest mb-1">Latency</p>
                <p className="text-sm font-bold text-heading font-mono">{entry.metadata.latency_ms}ms</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export function ActionLog({ compact = false }: { compact?: boolean }) {
  const { entries, loading } = useActionLog()
  const { user } = useAuth()

  if (!user) return null

  const displayEntries = compact ? entries.slice(0, 6) : entries

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-8 border-b-4 border-border-default pb-4">
          <h3 className="text-2xl font-black font-head text-heading uppercase tracking-tight">Timeline</h3>
          <span className="text-sm font-bold text-heading bg-neutral-secondary-soft border-2 border-border-default px-3 py-1 shadow-xs">{entries.length} LOGS</span>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-neutral-secondary-medium border-4 border-border-default animate-pulse" />)}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-16 bg-neutral-secondary-soft border-4 border-border-default shadow-md">
          <Activity className="w-16 h-16 text-body-subtle mx-auto mb-4" strokeWidth={2} />
          <h3 className="text-2xl font-black font-head text-heading uppercase tracking-tight mb-2">No Actions Yet</h3>
          <p className="text-lg font-bold text-body-subtle uppercase tracking-tight">When ARIA executes tasks autonomously, the logs will appear here.</p>
        </div>
      )}

      <div>
        {displayEntries.map((entry) => <ActionEntry key={entry.id} entry={entry} />)}
      </div>
    </div>
  )
}

// ARIAStatus component
const buildSteps = [
  'Reading your task...',
  'Identifying subtasks and dependencies...',
  'Estimating time for each step...',
  'Building your execution plan...',
]
const rescueSteps = [
  'Assessing the situation...',
  'Calculating achievable scope...',
  'Building your sprint plan...',
  'Drafting stakeholder communication...',
  'Almost ready...',
]

export function ARIAStatus({ mode }: { mode: 'BUILD' | 'RESCUE' }) {
  const steps = mode === 'BUILD' ? buildSteps : rescueSteps
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => s < steps.length - 1 ? s + 1 : s)
    }, mode === 'BUILD' ? 1800 : 2500)
    return () => clearInterval(interval)
  }, [mode, steps.length])

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 text-center bg-neutral-primary border-4 border-border-default shadow-xl">
      <div className={`w-16 h-16 border-4 border-t-transparent animate-spin ${mode === 'RESCUE' ? 'border-border-danger' : 'border-border-brand'}`} />
      <h2 className={`text-2xl font-black font-head uppercase tracking-tight ${mode === 'RESCUE' ? 'text-danger' : 'text-brand'}`}>
        {steps[step]}
      </h2>
      <div className="flex gap-3 bg-neutral-secondary-soft border-2 border-border-default p-2 shadow-xs">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 border-2 transition-colors duration-300 ${
              i <= step
                ? (mode === 'RESCUE' ? 'bg-danger border-border-danger' : 'bg-brand border-border-brand')
                : 'bg-neutral-primary border-border-default'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
