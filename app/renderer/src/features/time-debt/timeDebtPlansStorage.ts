const PLANS_KEY = 'growth-tree-os:time-debt-plans:v1'

export type TimeDebtPlanStatus = 'planned' | 'active' | 'completed'

export type TimeDebtPlan = {
  id: string
  title: string
  primaryCategory: string
  secondaryProject: string
  plannedStartTime: string
  plannedEndTime: string
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
    return Array.isArray(parsed) ? parsed.filter(isTimeDebtPlan) : []
  } catch {
    return []
  }
}

export function saveTimeDebtPlans(plans: TimeDebtPlan[]): void {
  window.localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
}

export function createTimeDebtPlan(draft: TimeDebtPlanDraft): TimeDebtPlan {
  const timestamp = new Date().toISOString()
  return {
    id: `time-debt-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: draft.title.trim(),
    primaryCategory: draft.primaryCategory.trim(),
    secondaryProject: draft.secondaryProject.trim(),
    plannedStartTime: draft.plannedStartTime,
    plannedEndTime: draft.plannedEndTime,
    status: 'planned',
    createdAt: timestamp,
    updatedAt: timestamp
  }
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
    (candidate.status === 'planned' || candidate.status === 'active' || candidate.status === 'completed')
  )
}
