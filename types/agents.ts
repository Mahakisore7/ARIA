// ─── ARIA Agent Type Definitions ───────────────────────────────────────────

export type ARIAMode = 'BUILD' | 'RESCUE' | 'SHIELD' | 'CLARIFY'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TaskStatus = 'active' | 'complete' | 'rescued' | 'missed'
export type AgentName = 'ARIA-Core' | 'ARIA-Build' | 'ARIA-Rescue' | 'ARIA-Comms' | 'ARIA-Shield' | 'ARIA-Check'
export type RecipientType = 'professor' | 'manager' | 'client' | 'colleague' | 'investor'
export type TaskCategory = 'coding' | 'writing' | 'research' | 'design' | 'administrative' | 'other'

// ─── ARIA-Core Output ───────────────────────────────────────────────────────
export interface IntentClassification {
  mode: ARIAMode
  task_description: string
  deadline_iso: string | null
  available_minutes: number | null
  confidence: number
  clarification_needed: string | null
  task_category: TaskCategory
}

// ─── ARIA-Build Output ──────────────────────────────────────────────────────
export interface Subtask {
  id: string
  title: string
  description: string
  estimated_minutes: number
  dependencies: string[]
  risk_flag: boolean
  risk_reason: string | null
  completed: boolean
}

export interface CalendarBlock {
  subtask_id: string
  suggested_start: string
  duration_minutes: number
  title: string
}

export interface SubtaskPlan {
  feasible: boolean
  warning: string | null
  subtasks: Subtask[]
  total_estimated_minutes: number
  available_minutes: number
  critical_path: string[]
  calendar_blocks: CalendarBlock[]
  reasoning: string
}

// ─── ARIA-Rescue Output ─────────────────────────────────────────────────────
export interface SprintBlock {
  block_number: number
  title: string
  objective: string
  duration_minutes: number
  deliverable: string
  checkin_signal: string
  completed: boolean
}

export interface OutlineSection {
  section: string
  key_points: string[]
  target_length: string
}

export interface TriagePlan {
  available_minutes: number
  achievable_percentage: number
  sections_achievable: string[]
  sections_cut: Array<{ section: string; reason: string }>
  sprint_blocks: SprintBlock[]
  outline: OutlineSection[]
  total_planned_minutes: number
  reasoning: string
}

// ─── ARIA-Comms Output ──────────────────────────────────────────────────────
export interface CommsDraft {
  recipient_type: RecipientType
  email: {
    subject_options: string[]
    body: string
    tone: string
  }
  message_short: {
    body: string
    tone: string
  }
  key_commitments: string[]
  reasoning: string
}

// ─── ARIA-Shield Output ─────────────────────────────────────────────────────
export interface RiskScore {
  task_id: string
  risk_level: RiskLevel
  risk_ratio: number
  reasoning: string
  recommended_action: string
}

// ─── Combined Rescue Result ─────────────────────────────────────────────────
export interface RescueResult {
  triage: TriagePlan
  comms: CommsDraft
  action_ids: string[]
}

// ─── Validation Result ──────────────────────────────────────────────────────
export interface ValidationResult {
  passed: boolean
  violations: string[]
  retry_prompt: string | null
}

// ─── Action Log Entry ───────────────────────────────────────────────────────
export interface ActionLogEntry {
  id: string
  action_type: string
  agent: AgentName
  task_id: string
  timestamp: number
  input_summary: string
  output_summary: string
  reasoning: string
  undoable: boolean
  undo_payload: Record<string, unknown> | null
  metadata: {
    gemini_model: string
    latency_ms: number
    retry_count: number
  }
}

// ─── Task (Firebase model) ──────────────────────────────────────────────────
export interface Task {
  id: string
  title: string
  description: string
  deadline_iso: string
  status: TaskStatus
  risk_level: RiskLevel
  task_category?: TaskCategory
  mode_created: 'BUILD' | 'RESCUE'
  created_at: number
  updated_at: number
  subtasks: Subtask[]
  sprint_blocks?: SprintBlock[]
  reasoning?: string
  rescue_plan?: {
    activated_at: number
    available_minutes: number
    achievable_percentage: number
    sprint_blocks: SprintBlock[]
    comms_draft: CommsDraft
  }
}

// ─── API Request / Response Types ───────────────────────────────────────────
export interface BuildRequest {
  task_description: string
  deadline_iso: string
  available_minutes: number
  user_context?: string
}

export interface RescueRequest {
  task_description: string
  available_minutes: number
  sections?: string[]
  recipient_type?: RecipientType
  task_id?: string
}

export interface RiskRequest {
  tasks: Array<{
    task_id: string
    deadline_iso: string
    estimated_effort_hours: number
    progress_percentage: number
    has_dependencies: boolean
  }>
}
