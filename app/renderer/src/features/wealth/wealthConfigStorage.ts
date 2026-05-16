import { type WealthBaseConfig } from '@shared/wealth'

const STORAGE_KEY = 'growth-tree-os:wealth-base-config:v1'

function getLocalDateKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultConfig: WealthBaseConfig = {
  date: getLocalDateKey(),
  openingBalance: 42860,
  dailySafeLine: 260,
  monthlyRemainingDisposable: 4160,
  remainingDaysInMonth: 16,
  savingPoolBefore: 860,
  realityStandard: 9200,
  deservedStandard: 14800,
  consecutiveOverdraftDays: 0
}

export function getDefaultWealthBaseConfig(): WealthBaseConfig {
  return { ...defaultConfig }
}

export function loadWealthBaseConfig(): WealthBaseConfig {
  if (typeof window === 'undefined') {
    return { ...defaultConfig }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...defaultConfig }
    }
    const parsed = JSON.parse(raw)
    if (!isWealthBaseConfig(parsed)) {
      return { ...defaultConfig }
    }
    return { ...defaultConfig, ...parsed, date: getLocalDateKey() }
  } catch {
    return { ...defaultConfig }
  }
}

export function saveWealthBaseConfig(config: WealthBaseConfig): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function resetWealthBaseConfig(): WealthBaseConfig {
  const config = { ...defaultConfig, date: getLocalDateKey() }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  return config
}

export { STORAGE_KEY as wealthConfigStorageKey }

function isWealthBaseConfig(value: unknown): value is WealthBaseConfig {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<WealthBaseConfig>
  return (
    typeof candidate.date === 'string' &&
    typeof candidate.openingBalance === 'number' &&
    Number.isFinite(candidate.openingBalance) &&
    typeof candidate.dailySafeLine === 'number' &&
    Number.isFinite(candidate.dailySafeLine) &&
    typeof candidate.savingPoolBefore === 'number' &&
    Number.isFinite(candidate.savingPoolBefore) &&
    typeof candidate.realityStandard === 'number' &&
    Number.isFinite(candidate.realityStandard) &&
    typeof candidate.deservedStandard === 'number' &&
    Number.isFinite(candidate.deservedStandard)
  )
}
