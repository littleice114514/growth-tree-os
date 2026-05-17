export type InvestmentAssetType = 'cash' | 'saving' | 'investment' | 'fund' | 'crypto' | 'stock' | 'other'

export type InvestmentStatus = 'active' | 'paused'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'none'

export type InvestmentRecord = {
  id: string
  assetName: string
  assetType: InvestmentAssetType
  marketSymbol?: string
  principal: number
  quantity?: number
  averageCost?: number
  currentValue: number
  latestPrice?: number
  firstBuyDate?: string
  recurringAmount: number
  recurringFrequency: RecurringFrequency
  recurringStartDate?: string
  recurringDay?: number
  nextRecurringDate?: string
  status: InvestmentStatus
  note: string
  createdAt: string
  updatedAt: string
}

export type InvestmentRecordDraft = {
  assetName: string
  assetType: InvestmentAssetType
  marketSymbol: string
  principal: string
  quantity: string
  recurringAmount: string
  recurringFrequency: RecurringFrequency
  recurringStartDate: string
  recurringDay: string
  firstBuyDate: string
  status: InvestmentStatus
  note: string
}

const STORAGE_KEY = 'growth-tree-os:wealth-investment-records:v1'

export const investmentAssetTypeLabels: Record<InvestmentAssetType, string> = {
  cash: '现金',
  saving: '储蓄',
  investment: '投资',
  fund: '基金',
  crypto: '数字资产',
  stock: '股票',
  other: '其他'
}

export const investmentStatusLabels: Record<InvestmentStatus, string> = {
  active: '进行中',
  paused: '暂停'
}

export const recurringFrequencyLabels: Record<RecurringFrequency, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
  none: '不定投'
}

export function createInvestmentDraft(): InvestmentRecordDraft {
  return {
    assetName: '',
    assetType: 'investment',
    marketSymbol: '',
    principal: '',
    quantity: '',
    recurringAmount: '',
    recurringFrequency: 'monthly',
    recurringStartDate: '',
    recurringDay: '',
    firstBuyDate: '',
    status: 'active',
    note: ''
  }
}

export function loadInvestmentRecords(): InvestmentRecord[] {
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
    return parsed.filter(isInvestmentRecord)
  } catch {
    return []
  }
}

export function saveInvestmentRecords(records: InvestmentRecord[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function appendInvestmentRecord(record: InvestmentRecord): InvestmentRecord[] {
  const records = [record, ...loadInvestmentRecords()]
  saveInvestmentRecords(records)
  return records
}

export function updateInvestmentRecord(updated: InvestmentRecord): InvestmentRecord[] {
  const records = loadInvestmentRecords().map((r) => (r.id === updated.id ? updated : r))
  saveInvestmentRecords(records)
  return records
}

export function deleteInvestmentRecord(recordId: string): InvestmentRecord[] {
  const records = loadInvestmentRecords().filter((r) => r.id !== recordId)
  saveInvestmentRecords(records)
  return records
}

export { STORAGE_KEY as investmentRecordsStorageKey }

function isInvestmentRecord(value: unknown): value is InvestmentRecord {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<InvestmentRecord>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.assetName === 'string' &&
    typeof candidate.assetType === 'string' &&
    typeof candidate.principal === 'number' &&
    Number.isFinite(candidate.principal) &&
    typeof candidate.currentValue === 'number' &&
    Number.isFinite(candidate.currentValue) &&
    typeof candidate.status === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

/** Compute currentValue from quantity * latestPrice, fallback to principal */
export function computeCurrentValue(record: InvestmentRecord): {
  value: number
  isAutoValued: boolean
  latestPrice?: number
} {
  if (record.quantity != null && record.latestPrice != null && record.quantity > 0 && record.latestPrice > 0) {
    return {
      value: record.quantity * record.latestPrice,
      isAutoValued: true,
      latestPrice: record.latestPrice
    }
  }
  return {
    value: record.currentValue ?? record.principal,
    isAutoValued: false
  }
}

/** Compute next recurring date from start date and frequency */
export function computeNextRecurringDate(
  startDate: string | undefined,
  frequency: RecurringFrequency,
  recurringDay?: number
): string | undefined {
  if (!startDate || frequency === 'none') return undefined

  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (frequency === 'daily') {
    return formatLocalDate(today)
  }

  if (frequency === 'weekly') {
    const dayOfWeek = start.getDay()
    const currentDay = today.getDay()
    let daysUntil = dayOfWeek - currentDay
    if (daysUntil <= 0) daysUntil += 7
    const next = new Date(today)
    next.setDate(next.getDate() + daysUntil)
    return formatLocalDate(next)
  }

  if (frequency === 'monthly') {
    const day = recurringDay ?? start.getDate()
    let next = new Date(today.getFullYear(), today.getMonth(), day)
    if (next <= today) {
      next = new Date(today.getFullYear(), today.getMonth() + 1, day)
    }
    return formatLocalDate(next)
  }

  return undefined
}

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
