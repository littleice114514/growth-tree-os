const TIME_PLAN_REMINDERS_KEY = 'growth-tree-os:time-plan-reminders:v1'
const TIME_DEBT_NAVIGATION_INTENT_KEY = 'growth-tree-os:time-debt-navigation-intent:v1'

export type LocalReminderType = 'time-plan' | 'node-maintenance' | 'routine'

export type TimePlanReminderStatus =
  | 'pending'
  | 'due'
  | 'active'
  | 'completed'
  | 'missed'
  | 'dismissed'
  | 'archived'

export type TimePlanReminder = {
  id: string
  reminderId: string
  type: LocalReminderType
  sourceType: 'time-debt-plan'
  sourceId: string
  title: string
  plannedStart: string
  plannedEnd: string
  plannedDuration: number
  primaryCategory: string
  secondaryProject: string
  status: TimePlanReminderStatus
  originalPlannedStart?: string
  snoozedUntil?: string
  snoozeCount: number
  createdAt: string
  updatedAt: string
  archivedAt?: string
}

export type TimePlanReminderDraft = {
  sourceId: string
  title: string
  plannedStart: string
  plannedEnd: string
  plannedDuration: number
  primaryCategory: string
  secondaryProject: string
}

export type TimeDebtNavigationIntent = {
  sourceId: string
  mode: 'focus' | 'start' | 'manual'
  createdAt: string
}

export function loadTimePlanReminders(): TimePlanReminder[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(TIME_PLAN_REMINDERS_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTimePlanReminder).map(normalizeTimePlanReminder) : []
  } catch {
    return []
  }
}

export function saveTimePlanReminders(reminders: TimePlanReminder[]): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(TIME_PLAN_REMINDERS_KEY, JSON.stringify(reminders.map(normalizeTimePlanReminder)))
}

export function createTimePlanReminder(draft: TimePlanReminderDraft): TimePlanReminder {
  const timestamp = new Date().toISOString()
  const id = `time-plan-reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    reminderId: id,
    type: 'time-plan',
    sourceType: 'time-debt-plan',
    sourceId: draft.sourceId,
    title: draft.title.trim(),
    plannedStart: draft.plannedStart,
    plannedEnd: draft.plannedEnd,
    plannedDuration: draft.plannedDuration,
    primaryCategory: draft.primaryCategory.trim(),
    secondaryProject: draft.secondaryProject.trim(),
    status: 'pending',
    originalPlannedStart: draft.plannedStart,
    snoozeCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export function upsertTimePlanReminder(reminder: TimePlanReminder): TimePlanReminder[] {
  const reminders = loadTimePlanReminders()
  const next = [
    normalizeTimePlanReminder(reminder),
    ...reminders.filter((item) => item.sourceId !== reminder.sourceId && item.id !== reminder.id)
  ]
  saveTimePlanReminders(next)
  dispatchTimePlanReminderChange()
  return next
}

export function updateTimePlanReminderBySource(
  sourceId: string,
  patch: Partial<TimePlanReminder>
): TimePlanReminder[] {
  const timestamp = new Date().toISOString()
  const reminders = loadTimePlanReminders().map((reminder) =>
    reminder.sourceId === sourceId
      ? normalizeTimePlanReminder({
          ...reminder,
          ...patch,
          updatedAt: timestamp
        })
      : reminder
  )
  saveTimePlanReminders(reminders)
  dispatchTimePlanReminderChange()
  return reminders
}

export function archiveTimePlanReminderBySource(
  sourceId: string,
  status: Extract<TimePlanReminderStatus, 'completed' | 'dismissed' | 'missed' | 'archived'>
): TimePlanReminder[] {
  const timestamp = new Date().toISOString()
  return updateTimePlanReminderBySource(sourceId, {
    status,
    archivedAt: timestamp
  })
}

export function resolveTimePlanReminderStatus(
  reminder: TimePlanReminder,
  nowMs = Date.now()
): TimePlanReminderStatus {
  if (reminder.status === 'active' || reminder.status === 'completed' || reminder.status === 'dismissed' || reminder.status === 'archived') {
    return reminder.status
  }
  const startMs = new Date(reminder.snoozedUntil || reminder.plannedStart).getTime()
  const endMs = new Date(reminder.plannedEnd).getTime()
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return reminder.status
  }
  if (nowMs > endMs) {
    return 'missed'
  }
  if (nowMs >= startMs) {
    return 'due'
  }
  return 'pending'
}

export function isArchivedTimePlanReminder(reminder: TimePlanReminder): boolean {
  return reminder.status === 'completed' || reminder.status === 'dismissed' || reminder.status === 'archived'
}

export function writeTimeDebtNavigationIntent(intent: Omit<TimeDebtNavigationIntent, 'createdAt'>): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(
    TIME_DEBT_NAVIGATION_INTENT_KEY,
    JSON.stringify({
      ...intent,
      createdAt: new Date().toISOString()
    })
  )
}

export function consumeTimeDebtNavigationIntent(): TimeDebtNavigationIntent | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(TIME_DEBT_NAVIGATION_INTENT_KEY)
    window.localStorage.removeItem(TIME_DEBT_NAVIGATION_INTENT_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    return isTimeDebtNavigationIntent(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const timePlanReminderStorageKeys = {
  reminders: TIME_PLAN_REMINDERS_KEY,
  navigationIntent: TIME_DEBT_NAVIGATION_INTENT_KEY
}

function normalizeTimePlanReminder(reminder: TimePlanReminder): TimePlanReminder {
  return {
    ...reminder,
    reminderId: reminder.reminderId || reminder.id,
    type: reminder.type || 'time-plan',
    sourceType: 'time-debt-plan',
    originalPlannedStart: reminder.originalPlannedStart || reminder.plannedStart,
    snoozeCount: reminder.snoozeCount || 0,
    plannedDuration: reminder.plannedDuration || calculateDurationMinutes(reminder.plannedStart, reminder.plannedEnd)
  }
}

function isTimePlanReminder(value: unknown): value is TimePlanReminder {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<TimePlanReminder>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.sourceId === 'string' &&
    candidate.sourceType === 'time-debt-plan' &&
    typeof candidate.title === 'string' &&
    typeof candidate.plannedStart === 'string' &&
    typeof candidate.plannedEnd === 'string' &&
    typeof candidate.primaryCategory === 'string' &&
    typeof candidate.secondaryProject === 'string' &&
    isTimePlanReminderStatus(candidate.status)
  )
}

function isTimePlanReminderStatus(value: unknown): value is TimePlanReminderStatus {
  return (
    value === 'pending' ||
    value === 'due' ||
    value === 'active' ||
    value === 'completed' ||
    value === 'missed' ||
    value === 'dismissed' ||
    value === 'archived'
  )
}

function isTimeDebtNavigationIntent(value: unknown): value is TimeDebtNavigationIntent {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<TimeDebtNavigationIntent>
  return (
    typeof candidate.sourceId === 'string' &&
    (candidate.mode === 'focus' || candidate.mode === 'start' || candidate.mode === 'manual') &&
    typeof candidate.createdAt === 'string'
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

function dispatchTimePlanReminderChange(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new Event('time-plan-reminders-change'))
}
