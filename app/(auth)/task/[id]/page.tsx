'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/hooks/useTasks'
import { db } from '@/lib/firebase/client'
import { ref, update } from 'firebase/database'
import { Button, Card, RiskBadge } from '@/components/ui/index'
import { isoToRelative, minutesToHuman } from '@/lib/utils/time'
import { ArrowLeft, CheckSquare, Square, AlertTriangle, Zap, Siren } from 'lucide-react'

export default function TaskViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading } = useTasks()
  
  const [updating, setUpdating] = useState(false)

  const task = tasks.find((t) => t.id === id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-primary-soft">
        <div className="w-8 h-8 border-[3px] border-border-default border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-neutral-secondary-soft p-12 text-center">
        <h1 className="text-4xl font-bold font-head uppercase mb-4 text-heading">Task Not Found</h1>
        <Link href="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const toggleSubtask = async (index: number, currentStatus: boolean) => {
    if (!user || !task.subtasks) return
    setUpdating(true)
    try {
      const updates: Record<string, any> = {}
      updates[`users/${user.uid}/tasks/${task.id}/subtasks/${index}/completed`] = !currentStatus
      await update(ref(db), updates)
    } finally {
      setUpdating(false)
    }
  }

  const toggleSprintBlock = async (index: number, currentStatus: boolean) => {
    if (!user || !task.sprint_blocks) return
    setUpdating(true)
    try {
      const updates: Record<string, any> = {}
      updates[`users/${user.uid}/tasks/${task.id}/sprint_blocks/${index}/completed`] = !currentStatus
      await update(ref(db), updates)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-secondary-soft text-body font-sans">
      <header className="border-b-2 border-border-default bg-neutral-primary px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="px-2 border-2 border-border-default bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium">
            <ArrowLeft className="w-5 h-5 text-heading" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {task.mode_created === 'BUILD' ? (
            <Zap className="w-6 h-6 text-brand" strokeWidth={3} />
          ) : (
            <Siren className="w-6 h-6 text-danger" strokeWidth={3} />
          )}
          <h1 className="text-xl font-bold font-head text-heading uppercase tracking-tight">Task View</h1>
        </div>
      </header>

      <div className="max-w-[1024px] mx-auto p-6 lg:p-[48px] space-y-8">
        {/* Header Card */}
        <Card className="bg-brand-soft border-border-brand shadow-lg">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <RiskBadge level={task.risk_level} size="sm" />
                <span className="text-sm font-bold bg-neutral-primary border-2 border-border-default px-2 py-0.5">
                  Due {isoToRelative(task.deadline_iso)}
                </span>
                <span className="text-sm font-bold bg-neutral-primary border-2 border-border-default px-2 py-0.5">
                  {task.task_category}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-heading font-head leading-tight mt-4">{task.title}</h2>
              <p className="text-lg text-heading font-medium mt-3 leading-relaxed opacity-90">{task.description}</p>
            </div>
            {(task.risk_level === 'CRITICAL' || task.risk_level === 'HIGH') && task.mode_created !== 'RESCUE' && (
              <div className="text-right flex-shrink-0 border-2 border-border-default bg-neutral-primary p-4 shadow-sm">
                <h3 className="text-sm font-bold uppercase mb-3 text-danger flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> High Risk Detected
                </h3>
                <Link href={`/rescue?task=${task.id}&desc=${encodeURIComponent(task.description)}`}>
                  <Button variant="danger" size="sm" className="w-full">Activate Rescue Protocol</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Reasoning */}
        {task.reasoning && (
          <Card className="bg-neutral-primary">
            <h2 className="text-lg font-bold text-heading font-head uppercase tracking-tight mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand" strokeWidth={3} /> ARIA's Reasoning
            </h2>
            <p className="text-base text-heading font-medium leading-relaxed">{task.reasoning}</p>
          </Card>
        )}

        {/* Execution Plan (BUILD Mode) */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-heading font-head uppercase tracking-tight">Execution Plan</h2>
              <span className="text-sm font-bold bg-neutral-primary border-2 border-border-default px-3 py-1 shadow-xs">
                {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} DONE
              </span>
            </div>
            
            <div className="space-y-4">
              {task.subtasks.map((sub, index) => (
                <div 
                  key={sub.id || index}
                  onClick={() => !updating && toggleSubtask(index, !!sub.completed)}
                  className={`flex items-start gap-4 p-4 border-2 border-border-default cursor-pointer transition-all ${
                    sub.completed 
                      ? 'bg-neutral-secondary-soft opacity-60' 
                      : sub.risk_flag 
                        ? 'bg-warning-soft border-border-warning hover:-translate-y-[2px] shadow-sm'
                        : 'bg-neutral-primary hover:-translate-y-[2px] shadow-sm'
                  }`}
                >
                  <button disabled={updating} className="mt-1 flex-shrink-0 text-heading hover:text-brand transition-colors">
                    {sub.completed ? (
                      <CheckSquare className="w-6 h-6 text-success" />
                    ) : (
                      <Square className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold font-head uppercase ${sub.completed ? 'line-through text-body-subtle' : 'text-heading'}`}>
                      {sub.title}
                    </h3>
                    {!sub.completed && (
                      <p className="text-sm text-heading font-medium mt-1">{sub.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs font-bold bg-neutral-secondary-medium border-2 border-border-default px-2 py-0.5">
                        {minutesToHuman(sub.estimated_minutes)}
                      </span>
                      {sub.risk_flag && !sub.completed && (
                        <span className="text-xs font-bold text-danger uppercase border-2 border-border-danger bg-danger-soft px-2 py-0.5 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" strokeWidth={3} /> Risk
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sprint Blocks (RESCUE Mode) */}
        {task.sprint_blocks && task.sprint_blocks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-heading font-head uppercase tracking-tight text-danger flex items-center gap-2">
                <Siren className="w-6 h-6" /> Emergency Sprints
              </h2>
            </div>
            
            <div className="space-y-4">
              {task.sprint_blocks.map((block, index) => (
                <div 
                  key={index}
                  onClick={() => !updating && toggleSprintBlock(index, !!block.completed)}
                  className={`flex items-start gap-4 p-4 border-2 border-border-default cursor-pointer transition-all ${
                    block.completed 
                      ? 'bg-neutral-secondary-soft opacity-60' 
                      : 'bg-danger-soft border-border-danger hover:-translate-y-[2px] shadow-sm'
                  }`}
                >
                  <button disabled={updating} className="mt-1 flex-shrink-0 text-heading hover:text-danger transition-colors">
                    {block.completed ? (
                      <CheckSquare className="w-6 h-6 text-success" />
                    ) : (
                      <Square className="w-6 h-6 text-danger" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold font-head uppercase ${block.completed ? 'line-through text-body-subtle' : 'text-danger-strong'}`}>
                      Block {block.block_number}: {block.title}
                    </h3>
                    {!block.completed && (
                      <p className="text-sm font-bold text-black mt-2 leading-snug">Deliverable: {block.deliverable}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs font-bold bg-white border-2 border-border-danger text-danger-strong px-2 py-0.5 uppercase tracking-wide">
                        {block.duration_minutes} MIN SPRINT
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
