import type { SystemXRecord } from './types'

const SYSTEMX_RECORDS_STORAGE_KEY = 'growth-tree-os:systemx-records:v1'
const MAX_SYSTEMX_RECORDS = 100

export function loadSystemXRecords(): SystemXRecord[] {
  if (!canUseLocalStorage()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(SYSTEMX_RECORDS_STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isSystemXRecord).slice(0, MAX_SYSTEMX_RECORDS)
  } catch {
    return []
  }
}

export function saveSystemXRecords(records: SystemXRecord[]): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.setItem(SYSTEMX_RECORDS_STORAGE_KEY, JSON.stringify(records.slice(0, MAX_SYSTEMX_RECORDS)))
  } catch {
    // Storage quota or private browsing errors should not blank the page.
  }
}

export function appendSystemXRecord(record: SystemXRecord): SystemXRecord[] {
  const records = [record, ...loadSystemXRecords()].slice(0, MAX_SYSTEMX_RECORDS)
  saveSystemXRecords(records)
  return records
}

export function clearSystemXRecords(): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(SYSTEMX_RECORDS_STORAGE_KEY)
  } catch {
    // Keep clear safe in restricted browser environments.
  }
}

export { SYSTEMX_RECORDS_STORAGE_KEY as systemXRecordsStorageKey }

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isSystemXRecord(value: unknown): value is SystemXRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<SystemXRecord>
  return (
    Boolean(candidate.input) &&
    Boolean(candidate.analysis) &&
    typeof candidate.input?.id === 'string' &&
    typeof candidate.input?.title === 'string' &&
    typeof candidate.input?.content === 'string' &&
    typeof candidate.input?.type === 'string' &&
    typeof candidate.input?.createdAt === 'string' &&
    typeof candidate.analysis?.id === 'string' &&
    typeof candidate.analysis?.inputId === 'string' &&
    typeof candidate.analysis?.summary === 'string' &&
    Array.isArray(candidate.analysis?.facts) &&
    Array.isArray(candidate.analysis?.patterns) &&
    Array.isArray(candidate.analysis?.principles) &&
    Array.isArray(candidate.analysis?.actions) &&
    Array.isArray(candidate.analysis?.risks) &&
    typeof candidate.analysis?.feedbackRule === 'string' &&
    Array.isArray(candidate.analysis?.systemTags) &&
    typeof candidate.analysis?.createdAt === 'string'
  )
}
