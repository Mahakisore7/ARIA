// lib/agents/validator.ts
import type { SubtaskPlan, TriagePlan, CommsDraft, ValidationResult } from '@/types/agents'

export const ariaCheck = {
  validateBuild(plan: SubtaskPlan): ValidationResult {
    const violations: string[] = []

    if (!plan.subtasks || plan.subtasks.length === 0) {
      violations.push('No subtasks generated')
    }
    if (plan.subtasks.length > 9) {
      violations.push(`Too many subtasks: ${plan.subtasks.length} (max 9)`)
    }
    const sum = plan.subtasks.reduce((acc, s) => acc + s.estimated_minutes, 0)
    if (sum > plan.available_minutes * 1.15) {
      violations.push(
        `Subtask sum (${sum}min) exceeds available time (${plan.available_minutes}min) by more than 15%`
      )
    }
    const ids = plan.subtasks.map((s) => s.id)
    const uniqueIds = new Set(ids)
    if (uniqueIds.size !== ids.length) {
      violations.push('Duplicate subtask IDs detected')
    }
    for (const subtask of plan.subtasks) {
      for (const dep of subtask.dependencies) {
        if (!uniqueIds.has(dep)) {
          violations.push(`Subtask "${subtask.id}" depends on non-existent subtask "${dep}"`)
        }
      }
      if (subtask.estimated_minutes < 5) {
        violations.push(`Subtask "${subtask.title}" has unrealistically short estimate (${subtask.estimated_minutes}min)`)
      }
    }
    if (!plan.reasoning || plan.reasoning.length < 10) {
      violations.push('Missing or too-short reasoning')
    }

    return {
      passed: violations.length === 0,
      violations,
      retry_prompt: violations.length > 0
        ? `Fix these violations in your SubtaskPlan: ${violations.join('. ')}`
        : null,
    }
  },

  validateRescue(plan: TriagePlan): ValidationResult {
    const violations: string[] = []

    const blockSum = plan.sprint_blocks.reduce((acc, b) => acc + b.duration_minutes, 0)
    const limit = plan.available_minutes - 10 // always keep 10-min buffer
    if (blockSum > limit) {
      violations.push(
        `Sprint block sum (${blockSum}min) exceeds available time minus buffer (${limit}min)`
      )
    }
    for (const block of plan.sprint_blocks) {
      if (block.duration_minutes > 50) {
        violations.push(`Block "${block.title}" exceeds 50 minutes (${block.duration_minutes}min)`)
      }
      if (!block.deliverable || block.deliverable.length < 10) {
        violations.push(`Block "${block.title}" has vague deliverable`)
      }
    }
    if (plan.achievable_percentage < 0 || plan.achievable_percentage > 100) {
      violations.push(`Invalid achievable_percentage: ${plan.achievable_percentage}`)
    }
    if (!plan.reasoning || plan.reasoning.length < 10) {
      violations.push('Missing or too-short reasoning')
    }

    return {
      passed: violations.length === 0,
      violations,
      retry_prompt: violations.length > 0
        ? `Fix these violations in your TriagePlan: ${violations.join('. ')}`
        : null,
    }
  },

  validateComms(draft: CommsDraft): ValidationResult {
    const violations: string[] = []
    const body = draft.email.body

    // Check for placeholders
    const placeholderPattern = /\[.+?\]/g
    const placeholders = body.match(placeholderPattern)
    if (placeholders) {
      violations.push(`Email contains unfilled placeholders: ${placeholders.join(', ')}`)
    }

    // Check apology count
    const apologyWords = ['sorry', 'apologize', 'apologise', 'apologies', 'regret']
    const apologyCount = apologyWords.reduce((acc, w) => {
      const matches = body.toLowerCase().match(new RegExp(w, 'g'))
      return acc + (matches ? matches.length : 0)
    }, 0)
    if (apologyCount > 2) {
      violations.push(`Email over-apologizes (${apologyCount} apology instances, max 1)`)
    }

    // Check word count
    const wordCount = body.split(/\s+/).filter(Boolean).length
    if (wordCount > 350) {
      violations.push(`Email body too long: ${wordCount} words (max 300)`)
    }

    // Check subject lines
    if (!draft.email.subject_options || draft.email.subject_options.length === 0) {
      violations.push('No subject line options provided')
    }
    for (const subj of draft.email.subject_options) {
      if (subj.length > 80) {
        violations.push(`Subject line too long: "${subj}" (max 60 chars)`)
      }
    }

    // Check short message
    const shortWords = draft.message_short.body.split(/\s+/).filter(Boolean).length
    if (shortWords > 120) {
      violations.push(`Short message too long: ${shortWords} words (max 100)`)
    }

    // Check short message for placeholders too
    const shortPlaceholders = draft.message_short.body.match(placeholderPattern)
    if (shortPlaceholders) {
      violations.push(`Short message contains placeholders: ${shortPlaceholders.join(', ')}`)
    }

    return {
      passed: violations.length === 0,
      violations,
      retry_prompt: violations.length > 0
        ? `Fix these violations in your CommsDraft: ${violations.join('. ')} Remember: no placeholders, max 1 apology, email under 300 words.`
        : null,
    }
  },
}
