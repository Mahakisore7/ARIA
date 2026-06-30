'use client'
// app/page.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button, Card } from '@/components/ui/index'
import { Zap, ShieldCheck, Siren } from 'lucide-react'

const features = [
  {
    mode: 'BUILD',
    icon: <Zap className="w-10 h-10 text-black" strokeWidth={2} />,
    title: 'Build Mode',
    description: 'Drop any task. ARIA decomposes it, estimates time, finds calendar gaps, and builds your execution plan — in seconds.',
    bgHover: 'group-hover:bg-brand',
    iconBg: 'bg-brand'
  },
  {
    mode: 'SHIELD',
    icon: <ShieldCheck className="w-10 h-10 text-black" strokeWidth={2} />,
    title: 'Shield Mode',
    description: 'ARIA monitors your active tasks and flags deadline risk before you realize you have a problem.',
    bgHover: 'group-hover:bg-success',
    iconBg: 'bg-success'
  },
  {
    mode: 'RESCUE',
    icon: <Siren className="w-10 h-10 text-white" strokeWidth={2} />,
    title: 'Rescue Mode',
    description: 'Deadline in hours? ARIA triages your situation, builds a sprint plan, and drafts the stakeholder email — autonomously.',
    bgHover: 'group-hover:bg-danger',
    iconBg: 'bg-danger'
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-primary-soft">
        <div className="w-8 h-8 border-[3px] border-border-default border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-primary-soft text-body font-sans selection:bg-brand selection:text-black">
      
      {/* Nav */}
      <nav className="px-6 py-5 border-b-2 border-border-default bg-neutral-secondary-soft flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ARIA Logo" className="w-8 h-8 border-2 border-border-default object-cover shadow-2xs" />
          <span className="font-head text-xl text-heading tracking-tight">ARIA</span>
        </div>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="font-semibold text-heading hover:text-fg-brand transition-colors underline hover:no-underline">
          GitHub →
        </a>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-[96px] text-center bg-neutral-primary-soft relative overflow-hidden">
        {/* Background graphic element (Neobrutalism signature) */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-warning rounded-full border-2 border-border-default shadow-md -z-10" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-brand-soft rounded-none border-2 border-border-default shadow-lg -z-10 transform rotate-12" />
        
        {/* Stitch Generated Hero Illustration */}
        <div className="absolute top-1/4 right-[10%] hidden lg:block -z-10 transform rotate-6 hover:rotate-0 transition-all">
          <img 
            src="https://lh3.googleusercontent.com/aida/AP1WRLtBKr4yoCr4UK0L_p-yzNsAzdW9ud9DRHS7YqdyPqiaLO5jHPvZUGDFN9C33FwQZJcqSwi_no_yezGrunPbV0-ORWKOy1nUtZpBMOSYSctk_SKawKiZL_iDWUqqG1zVYPD7BesDHkVTxNurS9ajWUFqzeYfhmpa0YKKQeCBUUzaEsO8eIzFBrgXGn_2Fvmi4wdnC2dLs8sfYvhZeljj4ruQ0LtbaQ_i4wCezh-lCzdNdrizSajKmXAy8Pkt" 
            alt="Stitch Neobrutalist Hero"
            className="w-64 border-4 border-border-default shadow-xl rounded-none"
          />
        </div>

        <div className="max-w-[1152px] mx-auto w-full z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 border-[3px] border-black bg-brand text-black text-sm font-bold uppercase tracking-widest mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all transform -rotate-1 cursor-default">
            <span className="w-3 h-3 rounded-none bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse" />
            Autonomous Rescue & Intervention Agent
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[64px] font-bold text-heading leading-[1.1] tracking-[-1px] mb-8 font-head max-w-4xl mx-auto">
            You don't manage deadlines. <br />
            <span className="bg-brand text-black px-2 py-1 mt-2 inline-block border-2 border-border-default shadow-sm rotate-[-1deg]">ARIA does.</span>
          </h1>

          <p className="text-body text-xl max-w-2xl mx-auto mb-[48px] leading-[1.7]">
            The first AI agent that covers your complete deadline lifecycle — planning, monitoring, and emergency rescue — without waiting to be asked.
          </p>

          <Button size="lg" variant="primary" onClick={signIn} className="text-lg px-8 py-4 bg-brand border-2 border-border-default text-black shadow-md hover:-translate-y-1 hover:-translate-x-1 hover:shadow-lg active:translate-y-1 active:translate-x-1 active:shadow-xs">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>

          <p className="text-body-subtle text-sm mt-6 font-semibold">Free to use · No credit card · Built on Google AI</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-[96px] border-t-2 border-border-default bg-neutral-secondary-soft">
        <div className="max-w-[1152px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
            {features.map((f, i) => (
              <Card key={f.mode} interactive className={`bg-neutral-primary text-left group overflow-hidden transition-colors duration-300 ${f.bgHover}`}>
                <div className={`mb-6 p-4 inline-block border-2 border-border-default shadow-xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="text-[28px] font-head text-heading group-hover:text-black leading-[1.3] mb-4 border-b-2 border-border-default pb-2 inline-block transition-colors">{f.title}</h3>
                <p className="text-body text-[16px] leading-[1.7] group-hover:text-black/80 transition-colors font-medium">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 border-t-2 border-border-default bg-neutral-primary-soft text-center text-body-subtle font-semibold text-sm">
        Built for Vibe2Ship 2026 · Powered by Gemini 2.0 Flash + Firebase · Google AI Studio
      </footer>
    </main>
  )
}

export const dynamic = 'force-dynamic'
