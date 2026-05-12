const PLANS_KEY = 'growth-tree-os:time-debt-plans:v1'

export type TimeDebtPlanStatus = 'planned' | 'active' | 'completed' | 'abandoned'

export type TimeDebtPlan = {
  id: string
  title: string
  primaryCategory: string
  secondaryProject: string
  plannedStartTime: string
  plannedEndTime: string
  plannedDurationMinutes: number
  tags?: string[]
  note?: string
  actualStartTime?: string
  actualEndTime?: string
  actualDurationMinutes?: number
  suggestedEndTime?: string
  completedLogId?: string
  reminderHint?: string
  status: TimeDebtPlanStatus
  createdAt: string
  updatedAt: string
}

export type TimeDebtPlanDraft = {
  title: string
  primaryCategory: string
  secondaryProject: string
  plannedStartTime: string
  plannedEndTime: string
  tags?: string[]
  note?: string
}

export function loadTimeDebtPlans(): TimeDebtPlan[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(PLANS_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTimeDebtPlan).map(normalizeTimeDebtPlan) : []
  } catch {
    return []
  }
}

export function saveTimeDebtPlans(plans: TimeDebtPlan[]): void {
  window.localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
}

export function createTimeDebtPlan(draft: TimeDebtPlanDraft): TimeDebtPlan {
  const timestamp = new Date().toISOString()
  const plannedDurationMinutes = calculateDurationMinutes(draft.plannedStartTime, draft.plannedEndTime)
  return {
    id: `time-debt-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: draft.title.trim(),
    primaryCategory: draft.primaryCategory.trim(),
    secondaryProject: draft.secondaryProject.trim(),
    plannedStartTime: draft.plannedStartTime,
    plannedEndTime: draft.plannedEndTime,
    plannedDurationMinutes,
    tags: normalizeTags(draft.tags),
    note: draft.note?.trim() || undefined,
    reminderHint: 'Time Debt planned task can later be bridged into the reminders module.',
    status: 'planned',
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

function normalizeTags(tags: string[] | undefined): string[] | undefined {
  if (!tags) {
    return undefined
  }
  const normalized = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)))
  return normalized.length > 0 ? normalized : undefined
}

export function appendTimeDebtPlan(plan: TimeDebtPlan): TimeDebtPlan[] {
  const plans = [plan, ...loadTimeDebtPlans()]
  saveTimeDebtPlans(plans)
  return plans
}

export function updateTimeDebtPlan(planId: string, patch: Partial<TimeDebtPlan>): TimeDebtPlan[] {
  const timestamp = new Date().toISOString()
  const plans = loadTimeDebtPlans().map((plan) => (plan.id === planId ? { ...plan, ...patch, updatedAt: timestamp } : plan))
  saveTimeDebtPlans(plans)
  return plans
}

export const timeDebtPlansStorageKey = PLANS_KEY

function normalizeTimeDebtPlan(plan: TimeDebtPlan): TimeDebtPlan {
  return {
    ...plan,
    plannedDurationMinutes: plan.plannedDurationMinutes || calculateDurationMinutes(plan.plannedStartTime, plan.plannedEndTime),
    reminderHint: plan.reminderHint ?? 'Time Debt planned task can later be bridged into the reminders module.'
  }
}

function isTimeDebtPlan(value: unknown): value is TimeDebtPlan {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<TimeDebtPlan>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.primaryCategory === 'string' &&
    typeof candidate.secondaryProject === 'string' &&
    typeof candidate.plannedStartTime === 'string' &&
    typeof candidate.plannedEndTime === 'string' &&
    (candidate.status === 'planned' || candidate.status === 'active' || candidate.status === 'completed' || candidate.status === 'abandoned')
  )
}

function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }
  return Math.round((end - start) / 60000)
}
