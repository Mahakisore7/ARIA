'use client'
// components/ui/index.tsx — Neobrutalism UI primitives
import clsx from 'clsx'
import { useEffect, type ReactNode } from 'react'
import type { RiskLevel } from '@/types/agents'

// ─── RiskBadge ───────────────────────────────────────────────────────────────
const riskConfig: Record<RiskLevel, { cls: string; dot: string }> = {
  LOW:      { cls: 'border-border-success bg-success-soft text-fg-success-strong', dot: 'bg-success' },
  MEDIUM:   { cls: 'border-border-warning bg-warning-soft text-fg-warning',        dot: 'bg-warning' },
  HIGH:     { cls: 'border-border-warning bg-warning text-black',                  dot: 'bg-black' },
  CRITICAL: { cls: 'border-border-danger bg-danger-soft text-fg-danger-strong',    dot: 'bg-danger' },
}

export function RiskBadge({ level, size = 'sm' }: { level: RiskLevel; size?: 'xs' | 'sm' }) {
  const c = riskConfig[level]
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 border-2 rounded-none font-semibold tracking-wide shadow-xs',
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
  const isGhost = variant === 'ghost'
  
  const base = clsx(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all whitespace-nowrap box-border',
    isGhost ? '' : 'border-2 border-border-default rounded-none shadow-sm hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-md active:translate-y-[2px] active:translate-x-[2px] active:shadow-2xs',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'
  )
  
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  }
  
  const variants: Record<ButtonVariant, string> = {
    primary:   'bg-brand hover:bg-brand-strong text-black',
    secondary: 'bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium text-heading',
    danger:    'bg-danger hover:bg-danger text-white',
    ghost:     'text-body hover:text-heading hover:bg-neutral-secondary-medium',
    amber:     'bg-warning hover:bg-warning-strong text-black',
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
interface CardProps { children: ReactNode; className?: string; amber?: boolean; interactive?: boolean }
export function Card({ children, className, amber, interactive }: CardProps) {
  return (
    <div className={clsx(
      'rounded-none border-2 p-4 transition-all',
      amber ? 'bg-warning-soft border-border-warning shadow-md' : 'bg-neutral-primary-soft border-border-default shadow-md',
      interactive && 'cursor-pointer hover:-translate-y-[2px] hover:-translate-x-[2px] hover:shadow-lg active:translate-y-[2px] active:translate-x-[2px] active:shadow-xs',
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
      amber ? 'border-warning' : 'border-brand-strong'
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
      {/* Overlay - solid 50% black, NO BLUR */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Content Container - shadow-xl (hard offset), 2px border, 0px radius */}
      <div className="relative bg-neutral-primary border-2 border-border-default rounded-none max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-border-default flex justify-between items-center">
          {title ? <h2 className="text-xl font-bold text-heading font-head tracking-tight">{title}</h2> : <div />}
          <Button variant="ghost" size="sm" onClick={onClose} className="px-2 py-1 h-auto">×</Button>
        </div>
        
        {/* Body */}
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; visible: boolean }
export function Toast({ message, type = 'info', visible }: ToastProps) {
  const colors = {
    success: 'bg-success-soft border-border-success text-fg-success-strong',
    error:   'bg-danger-soft border-border-danger text-fg-danger-strong',
    info:    'bg-neutral-primary-soft border-border-default text-heading',
  }
  return (
    <div className={clsx(
      'fixed bottom-4 right-4 z-50 border-2 rounded-none px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300',
      colors[type],
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
    )}>
      {message}
    </div>
  )
}
