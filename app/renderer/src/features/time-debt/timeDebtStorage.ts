import {
  defaultTimeDebtParams,
  type TimeDebtLog,
  type TimeDebtParams,
  type WorkTimeStandard
} from '@shared/timeDebt'
import { accountLocalStorageKey, migrateLegacyLocalStorageKey } from '@/lib/accountStorage'

const LEGACY_LOGS_KEY = 'growth-tree-os:time-debt-logs:v1'
const LEGACY_STANDARDS_KEY = 'growth-tree-os:time-debt-standards:v1'
const LEGACY_PARAMS_KEY = 'growth-tree-os:time-debt-params:v1'

const LOGS_KEY = accountLocalStorageKey('time-debt', 'logs')
const STANDARDS_KEY = accountLocalStorageKey('time-debt', 'standards')
const PARAMS_KEY = accountLocalStorageKey('time-debt', 'params')

export function loadTimeDebtLogs(): TimeDebtLog[] {
  migrateTimeDebtLegacyKeys()
  return loadArray(LOGS_KEY, isTimeDebtLog)
}

export function saveTimeDebtLogs(logs: TimeDebtLog[]): void {
  migrateTimeDebtLegacyKeys()
  window.localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function appendTimeDebtLog(log: TimeDebtLog): TimeDebtLog[] {
  const logs = [log, ...loadTimeDebtLogs()]
  saveTimeDebtLogs(logs)
  return logs
}

export function deleteTimeDebtLog(logId: string): TimeDebtLog[] {
  const logs = loadTimeDebtLogs().filter((log) => log.id !== logId)
  saveTimeDebtLogs(logs)
  return logs
}

export function loadWorkTimeStandards(): WorkTimeStandard[] {
  migrateTimeDebtLegacyKeys()
  return loadArray(STANDARDS_KEY, isWorkTimeStandard)
}

export function saveWorkTimeStandards(standards: WorkTimeStandard[]): void {
  migrateTimeDebtLegacyKeys()
  window.localStorage.setItem(STANDARDS_KEY, JSON.stringify(standards))
}

export function appendWorkTimeStandard(standard: WorkTimeStandard): WorkTimeStandard[] {
  const standards = [standard, ...loadWorkTimeStandards().filter((item) => item.date !== standard.date)]
  saveWorkTimeStandards(standards)
  return standards
}

export function loadTimeDebtParams(): TimeDebtParams {
  if (typeof window === 'undefined') {
    return defaultTimeDebtParams
  }

  migrateTimeDebtLegacyKeys()

  try {
    const raw = window.localStorage.getItem(PARAMS_KEY)
    if (!raw) {
      return defaultTimeDebtParams
    }
    const parsed = JSON.parse(raw)
    return isTimeDebtParams(parsed) ? parsed : defaultTimeDebtParams
  } catch {
    return defaultTimeDebtParams
  }
}

export function saveTimeDebtParams(params: TimeDebtParams): void {
  migrateTimeDebtLegacyKeys()
  window.localStorage.setItem(PARAMS_KEY, JSON.stringify(params))
}

export const timeDebtStorageKeys = {
  logs: LOGS_KEY,
  standards: STANDARDS_KEY,
  params: PARAMS_KEY
}

export const legacyTimeDebtStorageKeys = {
  logs: LEGACY_LOGS_KEY,
  standards: LEGACY_STANDARDS_KEY,
  params: LEGACY_PARAMS_KEY
}

function migrateTimeDebtLegacyKeys(): void {
  migrateLegacyLocalStorageKey(LEGACY_LOGS_KEY, LOGS_KEY)
  migrateLegacyLocalStorageKey(LEGACY_STANDARDS_KEY, STANDARDS_KEY)
  migrateLegacyLocalStorageKey(LEGACY_PARAMS_KEY, PARAMS_KEY)
}

function loadArray<T>(key: string, guard: (value: unknown) => value is T): T[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(guard) : []
  } catch {
    return []
  }
}

function isTimeDebtLog(value: unknown): value is TimeDebtLog {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<TimeDebtLog>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.primaryCategory === 'string' &&
    typeof candidate.secondaryProject === 'string' &&
    typeof candidate.startTime === 'string' &&
    typeof candidate.endTime === 'string' &&
    typeof candidate.durationMinutes === 'number'
  )
}

function isWorkTimeStandard(value: unknown): value is WorkTimeStandard {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<WorkTimeStandard>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.standardWorkHours === 'number' &&
    typeof candidate.standardWorkMinutes === 'number'
  )
}

function isTimeDebtParams(value: unknown): value is TimeDebtParams {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<TimeDebtParams>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.year === 'number' &&
    typeof candidate.annualIncome === 'number' &&
    typeof candidate.effectiveWorkDays === 'number' &&
    typeof candidate.averageWorkHoursPerDay === 'number' &&
    typeof candidate.idealHourlyWage === 'number'
  )
}
