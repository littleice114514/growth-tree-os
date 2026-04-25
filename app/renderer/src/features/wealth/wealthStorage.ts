import type { WealthRecord } from '@shared/wealth'

const STORAGE_KEY = 'growth-tree-os:wealth-records:v1'

export function loadWealthRecords(): WealthRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(isWealthRecord)
  } catch {
    return []
  }
}

export function saveWealthRecords(records: WealthRecord[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function appendWealthRecord(record: WealthRecord): WealthRecord[] {
  const records = [record, ...loadWealthRecords()]
  saveWealthRecords(records)
  return records
}

export function deleteWealthRecord(recordId: string): WealthRecord[] {
  const records = loadWealthRecords().filter((record) => record.id !== recordId)
  saveWealthRecords(records)
  return records
}

export { STORAGE_KEY as wealthRecordsStorageKey }

function isWealthRecord(value: unknown): value is WealthRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WealthRecord>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}
