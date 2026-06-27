// lib/firebase/db.ts
import { adminDb } from '@/lib/firebase/admin'
import type { Task, ActionLogEntry, AgentName } from '@/types/agents'

// ─── Action Log ──────────────────────────────────────────────────────────────
export async function writeActionLog(
  uid: string,
  entry: Omit<ActionLogEntry, 'id' | 'timestamp'>
): Promise<string> {
  const ref = adminDb.ref(`users/${uid}/action_log`).push()
  const id = ref.key!
  await ref.set({ ...entry, timestamp: Date.now() })
  return id
}

export async function undoAction(uid: string, actionId: string): Promise<boolean> {
  const ref = adminDb.ref(`users/${uid}/action_log/${actionId}`)
  const snap = await ref.get()
  if (!snap.exists()) return false

  const action = snap.val() as ActionLogEntry
  if (!action.undoable || !action.undo_payload) return false

  // Apply undo payload
  if (action.action_type === 'decompose_task') {
    const { task_id } = action.undo_payload as { task_id: string }
    await adminDb.ref(`users/${uid}/tasks/${task_id}`).remove()
  }

  await ref.update({ undoable: false, undo_applied: true })
  return true
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export async function createTask(uid: string, task: Omit<Task, 'id'>): Promise<string> {
  const ref = adminDb.ref(`users/${uid}/tasks`).push()
  const id = ref.key!
  await ref.set({ ...task, id, created_at: Date.now(), updated_at: Date.now() })
  return id
}

export async function updateTask(uid: string, taskId: string, updates: Partial<Task>): Promise<void> {
  await adminDb.ref(`users/${uid}/tasks/${taskId}`).update({ ...updates, updated_at: Date.now() })
}

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  await adminDb.ref(`users/${uid}/tasks/${taskId}`).remove()
}

// ─── Log Helper ──────────────────────────────────────────────────────────────
export function makeLogEntry(
  agent: AgentName,
  actionType: string,
  taskId: string,
  inputSummary: string,
  outputSummary: string,
  reasoning: string,
  latencyMs: number,
  retryCount: number,
  undoable = false,
  undoPayload: Record<string, unknown> | null = null
): Omit<ActionLogEntry, 'id' | 'timestamp'> {
  return {
    action_type: actionType,
    agent,
    task_id: taskId,
    input_summary: inputSummary,
    output_summary: outputSummary,
    reasoning,
    undoable,
    undo_payload: undoPayload,
    metadata: {
      gemini_model: 'gemini-2.0-flash',
      latency_ms: latencyMs,
      retry_count: retryCount,
    },
  }
}
