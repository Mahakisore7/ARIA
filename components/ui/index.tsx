'use client'
// components/ui/index.tsx — all UI primitives in one export
import clsx from 'clsx'
import { useEffect, type ReactNode } from 'react'
import type { RiskLevel } from '@/types/agents'

// ─── RiskBadge ───────────────────────────────────────────────────────────────
const riskConfig: Record<RiskLevel, { cls: string; dot: string }> = {
  LOW:      { cls: 'border-aria-green/30 bg-aria-green/10 text-aria-green',                         dot: 'bg-aria-green' },
  MEDIUM:   { cls: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',                         dot: 'bg-yellow-400' },
  HIGH:     { cls: 'border-orange-500/30 bg-orange-500/10 text-orange-400',                         dot: 'bg-orange-400' },
  CRITICAL: { cls: 'border-aria-red/40 bg-aria-red/10 text-aria-red animate-pulse-red',             dot: 'bg-aria-red' },
}

export function RiskBadge({ level, size = 'sm' }: { level: RiskLevel; size?: 'xs' | 'sm' }) {
  const c = riskConfig[level]
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 border rounded-full font-semibold tracking-wide',
      size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      c.cls
    )}>
      <span className={clsx('rounded-full flex-shrink-0', size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5', c.dot)} />
      {level}
    </span>
  )
}

// ─── Button ──────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'amber'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap'
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  }
  const variants: Record<ButtonVariant, string> = {
    primary:   'bg-aria-violet hover:bg-aria-violet-dim text-white shadow-sm',
    secondary: 'bg-aria-surface border border-aria-border hover:border-aria-muted text-aria-text',
    danger:    'bg-aria-red/10 border border-aria-red/30 hover:bg-aria-red/20 text-aria-red',
    ghost:     'text-aria-muted hover:text-aria-text hover:bg-aria-surface',
    amber:     'bg-aria-amber hover:bg-amber-600 text-black font-semibold',
  }
  return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: ReactNode; className?: string; amber?: boolean }
export function Card({ children, className, amber }: CardProps) {
  return (
    <div className={clsx(
      'rounded-xl border p-4',
      amber ? 'bg-amber-950/30 border-aria-amber/20' : 'bg-aria-surface border-aria-border',
      className
    )}>
      {children}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', amber }: { size?: 'sm' | 'md' | 'lg'; amber?: boolean }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' }
  return (
    <span className={clsx(
      'rounded-full animate-spin border-t-transparent inline-block',
      sizes[size],
      amber ? 'border-aria-amber' : 'border-aria-violet'
    )} />
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps { open: boolean; onClose: () => void; title?: string; children: ReactNode }
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-aria-surface border border-aria-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in shadow-2xl">
        {title && <h2 className="text-base font-semibold text-aria-text mb-4 pr-6">{title}</h2>}
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-aria-muted hover:text-aria-text transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; visible: boolean }
export function Toast({ message, type = 'info', visible }: ToastProps) {
  const colors = {
    success: 'bg-aria-green/10 border-aria-green/30 text-aria-green',
    error:   'bg-aria-red/10 border-aria-red/30 text-aria-red',
    info:    'bg-aria-violet/10 border-aria-violet/30 text-aria-violet',
  }
  return (
    <div className={clsx(
      'fixed bottom-4 right-4 z-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300',
      colors[type],
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
    )}>
      {message}
    </div>
  )
}
