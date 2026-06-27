// lib/agents/shield.ts
import type { RiskLevel, RiskScore } from '@/types/agents'

export function calculateRisk(
  taskId: string,
  deadlineIso: string,
  estimatedEffortHours: number,
  progressPercentage = 0,
  hasDependencies = false
): RiskScore {
  const now = new Date()
  const deadline = new Date(deadlineIso)
  const minutesRemaining = Math.round((deadline.getTime() - now.getTime()) / 60_000)
  const hoursRemaining = minutesRemaining / 60

  const remainingEffortHours = estimatedEffortHours * (1 - progressPercentage / 100)
  const riskRatio = hoursRemaining > 0 ? remainingEffortHours / hoursRemaining : 999

  let riskLevel: RiskLevel
  let reasoning: string
  let recommendedAction: string

  if (minutesRemaining < 0) {
    riskLevel = 'CRITICAL'
    reasoning = 'Deadline has already passed.'
    recommendedAction = 'Activate Rescue Mode immediately and communicate with stakeholders.'
  } else if (riskRatio > 0.85) {
    riskLevel = 'CRITICAL'
    reasoning = `Only ${Math.round(hoursRemaining * 10) / 10}h remaining but ~${Math.round(remainingEffortHours * 10) / 10}h of work left (${Math.round(riskRatio * 100)}% capacity utilization).`
    recommendedAction = 'Activate Rescue Mode now.'
  } else if (riskRatio > 0.65) {
    riskLevel = 'HIGH'
    reasoning = `${Math.round(hoursRemaining * 10) / 10}h remaining, ${Math.round(remainingEffortHours * 10) / 10}h work needed. Very tight window with minimal buffer.`
    recommendedAction = 'Start immediately. Activate Rescue Mode if you fall behind.'
  } else if (riskRatio > 0.40) {
    riskLevel = 'MEDIUM'
    reasoning = `${Math.round(hoursRemaining * 10) / 10}h remaining, ${Math.round(remainingEffortHours * 10) / 10}h work needed. Manageable but watch the pace.`
    recommendedAction = 'Maintain current pace. Check progress at midpoint.'
  } else {
    riskLevel = 'LOW'
    reasoning = `${Math.round(hoursRemaining * 10) / 10}h remaining, ${Math.round(remainingEffortHours * 10) / 10}h work needed. Comfortable buffer exists.`
    recommendedAction = 'Stay on plan. ARIA is monitoring.'
  }

  if (hasDependencies && riskLevel !== 'CRITICAL') {
    const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    const currentIndex = levels.indexOf(riskLevel)
    riskLevel = levels[Math.min(currentIndex + 1, 3)]
    reasoning += ' External dependency detected — risk level upgraded.'
  }

  return {
    task_id: taskId,
    risk_level: riskLevel,
    risk_ratio: riskRatio,
    reasoning,
    recommended_action: recommendedAction,
  }
}
