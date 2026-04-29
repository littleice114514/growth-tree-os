const ACTIVE_TIMER_KEY = 'growth-tree-os:time-debt:active-timer'

export type ActiveTimeDebtTimer = {
  id: string
  title: string
  primaryCategory: string
  secondaryProject: string
  workloadUnit: string
  actualStart: string
  startTimestampMs: number
  sourcePlanId?: string
  plannedStart?: string
  plannedEnd?: string
  plannedDuration?: number
  suggestedEnd?: string
  status: 'active'
  createdAt: string
  updatedAt: string
}

export function loadActiveTimeDebtTimer(): ActiveTimeDebtTimer | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_TIMER_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return isActiveTimeDebtTimer(parsed) ? normalizeActiveTimer(parsed) : null
  } catch {
    return null
  }
}

export function saveActiveTimeDebtTimer(timer: ActiveTimeDebtTimer): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(normalizeActiveTimer(timer)))
  dispatchActiveTimerChange()
}

export function clearActiveTimeDebtTimer(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(ACTIVE_TIMER_KEY)
  dispatchActiveTimerChange()
}

export function createActiveTimeDebtTimer(input: {
  title: string
  primaryCategory: string
  secondaryProject: string
  workloadUnit: string
  actualStart: string
  startTimestampMs: number
  sourcePlanId?: string
  plannedStart?: string
  plannedEnd?: string
  plannedDuration?: number
  suggestedEnd?: string
}): ActiveTimeDebtTimer {
  const timestamp = new Date().toISOString()
  return {
    id: `active-time-debt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    primaryCategory: input.primaryCategory.trim(),
    secondaryProject: input.secondaryProject.trim(),
    workloadUnit: input.workloadUnit,
    actualStart: input.actualStart,
    startTimestampMs: input.startTimestampMs,
    sourcePlanId: input.sourcePlanId,
    plannedStart: input.plannedStart,
    plannedEnd: input.plannedEnd,
    plannedDuration: input.plannedDuration,
    suggestedEnd: input.suggestedEnd,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export const timeDebtActiveTimerStorageKey = ACTIVE_TIMER_KEY

function normalizeActiveTimer(timer: ActiveTimeDebtTimer): ActiveTimeDebtTimer {
  const startTimestampMs = Number.isFinite(timer.startTimestampMs)
    ? timer.startTimestampMs
    : new Date(timer.actualStart).getTime()
  return {
    ...timer,
    startTimestampMs,
    status: 'active',
    updatedAt: timer.updatedAt || timer.createdAt || new Date().toISOString()
  }
}

function isActiveTimeDebtTimer(value: unknown): value is ActiveTimeDebtTimer {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<ActiveTimeDebtTimer>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.primaryCategory === 'string' &&
    typeof candidate.secondaryProject === 'string' &&
    typeof candidate.workloadUnit === 'string' &&
    typeof candidate.actualStart === 'string' &&
    typeof candidate.startTimestampMs === 'number' &&
    candidate.status === 'active' &&
    typeof candidate.createdAt === 'string'
  )
}

function dispatchActiveTimerChange(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new Event('time-debt-active-timer-change'))
}
