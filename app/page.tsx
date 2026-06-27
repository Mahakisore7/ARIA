'use client'
// app/page.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

const features = [
  {
    mode: 'BUILD',
    icon: '⚡',
    title: 'Build Mode',
    description: 'Drop any task. ARIA decomposes it, estimates time, finds calendar gaps, and builds your execution plan — in seconds.',
    color: 'text-aria-violet',
    border: 'border-aria-violet/20',
    bg: 'bg-aria-violet/5',
  },
  {
    mode: 'SHIELD',
    icon: '🛡',
    title: 'Shield Mode',
    description: 'ARIA monitors your active tasks and flags deadline risk before you realize you have a problem.',
    color: 'text-aria-green',
    border: 'border-aria-green/20',
    bg: 'bg-aria-green/5',
  },
  {
    mode: 'RESCUE',
    icon: '🚨',
    title: 'Rescue Mode',
    description: 'Deadline in hours? ARIA triages your situation, builds a sprint plan, and drafts the stakeholder email — autonomously.',
    color: 'text-aria-amber',
    border: 'border-aria-amber/20',
    bg: 'bg-aria-amber/5',
  },
]

export default function LandingPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-aria-violet border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 border-b border-aria-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-aria-violet flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="font-semibold text-aria-text tracking-tight">ARIA</span>
        </div>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-aria-muted text-sm hover:text-aria-text transition-colors">
          GitHub →
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-aria-violet/30 bg-aria-violet/10 text-aria-violet text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-aria-violet animate-pulse" />
            Autonomous Rescue & Intervention Agent
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-aria-text leading-tight mb-6 max-w-3xl">
            You don&apos;t manage deadlines.{' '}
            <span className="text-aria-violet">ARIA does.</span>
          </h1>

          <p className="text-aria-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            The first AI agent that covers your complete deadline lifecycle — planning, monitoring, and emergency rescue — without waiting to be asked.
          </p>

          <button
            onClick={signIn}
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-base hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-aria-muted text-xs mt-4">Free to use · No credit card · Built on Google AI</p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-aria-border">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`rounded-xl border ${f.border} ${f.bg} p-5`}
            >
              <div className={`text-2xl mb-3`}>{f.icon}</div>
              <div className={`text-sm font-semibold ${f.color} mb-1`}>{f.title}</div>
              <p className="text-aria-muted text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-6 border-t border-aria-border text-center text-aria-muted text-xs">
        Built for Vibe2Ship 2026 · Powered by Gemini 2.0 Flash + Firebase · Google AI Studio
      </footer>
    </main>
  )
}

export const dynamic = 'force-dynamic'
