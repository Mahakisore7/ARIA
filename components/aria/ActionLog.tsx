'use client'
import { useState, useEffect } from 'react'
import { useActionLog } from '@/hooks/useActionLog'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@/components/ui/index'
import type { ActionLogEntry, AgentName } from '@/types/agents'

const agentColors: Record<AgentName, string> = {
  'ARIA-Core':   'bg-aria-violet/20 text-aria-violet border-aria-violet/30',
  'ARIA-Build':  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'ARIA-Rescue': 'bg-aria-amber/20 text-aria-amber border-aria-amber/30',
  'ARIA-Comms':  'bg-aria-green/20 text-aria-green border-aria-green/30',
  'ARIA-Shield': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'ARIA-Check':  'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const actionIcons: Record<string, string> = {
  decompose_task:       '⚡',
  generate_sprint_plan: '🚨',
  draft_communication:  '✉️',
  calculate_risk:       '🛡',
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`
  return `${Math.round(diff / 3_600_000)}h ago`
}

function ActionEntry({ entry }: { entry: ActionLogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const agentCls = agentColors[entry.agent] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  const icon = actionIcons[entry.action_type] || '🤖'

  return (
    <div className="border-b border-aria-border py-3 animate-slide-in last:border-b-0">
      <div className="flex items-start gap-2.5">
        <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${agentCls}`}>
              {entry.agent}
            </span>
            <span className="text-xs text-aria-muted">{timeAgo(entry.timestamp)}</span>
          </div>
          <p className="text-sm text-aria-text leading-relaxed">{entry.output_summary}</p>
          {expanded && (
            <p className="text-xs text-aria-muted mt-1 leading-relaxed">{entry.input_summary}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 ml-7">
        <button
          onClick={() => setReasoningOpen(true)}
          className="text-[11px] text-aria-violet hover:text-aria-violet/80 transition-colors font-medium"
        >
          Why? →
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-aria-muted hover:text-aria-text transition-colors"
        >
          {expanded ? 'Less' : 'Details'}
        </button>
        {entry.undoable && (
          <span className="text-[11px] text-aria-green/60 ml-auto">↩ Reversible</span>
        )}
      </div>

      <Modal open={reasoningOpen} onClose={() => setReasoningOpen(false)} title="ARIA's Reasoning">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-aria-muted mb-1.5">Agent</div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${agentCls}`}>{entry.agent}</span>
          </div>
          <div>
            <div className="text-xs text-aria-muted mb-1.5">Action</div>
            <p className="text-sm text-aria-text capitalize">{entry.action_type.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <div className="text-xs text-aria-muted mb-1.5">Why ARIA did this</div>
            <p className="text-sm text-aria-text leading-relaxed bg-aria-bg rounded-lg p-3">{entry.reasoning}</p>
          </div>
          {entry.metadata && (
            <div className="pt-2 border-t border-aria-border grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-aria-muted mb-1">Model</div>
                <p className="text-xs text-aria-text font-mono">{entry.metadata.gemini_model}</p>
              </div>
              <div>
                <div className="text-xs text-aria-muted mb-1">Latency</div>
                <p className="text-xs text-aria-text font-mono">{entry.metadata.latency_ms}ms</p>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-aria-text">All ARIA Actions</h3>
          <span className="text-xs text-aria-muted">{entries.length} total</span>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">🤖</div>
          <p className="text-sm text-aria-muted">ARIA hasn&apos;t taken any actions yet.</p>
          <p className="text-xs text-aria-muted mt-1">Actions appear here — each one explained.</p>
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
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className={`w-12 h-12 rounded-full border-[3px] border-t-transparent animate-spin ${mode === 'RESCUE' ? 'border-aria-amber' : 'border-aria-violet'}`} />
      <p className={`text-sm font-medium ${mode === 'RESCUE' ? 'text-aria-amber' : 'text-aria-text'}`}>
        {steps[step]}
      </p>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i <= step
                ? (mode === 'RESCUE' ? 'bg-aria-amber' : 'bg-aria-violet')
                : 'bg-aria-border'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
