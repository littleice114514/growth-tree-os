export type InvestmentAssetType = 'cash' | 'saving' | 'investment' | 'fund' | 'crypto' | 'stock' | 'other'

export type InvestmentStatus = 'active' | 'paused'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'none'

export type InvestmentRecord = {
  id: string
  assetName: string
  assetType: InvestmentAssetType
  principal: number
  currentValue: number
  recurringAmount: number
  recurringFrequency: RecurringFrequency
  status: InvestmentStatus
  note: string
  createdAt: string
  updatedAt: string
}

export type InvestmentRecordDraft = {
  assetName: string
  assetType: InvestmentAssetType
  principal: string
  currentValue: string
  recurringAmount: string
  recurringFrequency: RecurringFrequency
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
    principal: '',
    currentValue: '',
    recurringAmount: '',
    recurringFrequency: 'monthly',
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
