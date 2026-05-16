import type { WealthRecord } from '@shared/wealth'

export type OverdraftDay = {
  date: string
  totalExpense: number
  safeLine: number
  isOverdraft: boolean
}

export type OverdraftStreak = {
  current: number
  riskTriggered: boolean
  lastOverdraftDate: string | null
  days: OverdraftDay[]
}

export type PeriodKey = 'today' | 'yesterday' | 'last7' | 'last30'

export const periodLabels: Record<PeriodKey, string> = {
  today: '今天',
  yesterday: '昨天',
  last7: '近 7 天',
  last30: '近 30 天'
}

const RISK_THRESHOLD = 3

export function calculateOverdraftStreak(
  records: WealthRecord[],
  dailySafeLine: number,
  today: string
): OverdraftStreak {
  const expenseByDate = buildDailyExpenseMap(records)
  const dates = sortedUniqueDates(expenseByDate, today)
  const days: OverdraftDay[] = dates.map((date) => {
    const totalExpense = expenseByDate.get(date) ?? 0
    return {
      date,
      totalExpense,
      safeLine: dailySafeLine,
      isOverdraft: totalExpense > dailySafeLine
    }
  })

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].isOverdraft) {
      current++
    } else {
      break
    }
  }

  const lastOverdraftDate = current > 0 ? days[days.length - 1].date : null

  return {
    current,
    riskTriggered: current >= RISK_THRESHOLD,
    lastOverdraftDate,
    days
  }
}

export function calculatePeriodOverdraftStreak(
  records: WealthRecord[],
  dailySafeLine: number,
  period: PeriodKey,
  today: string
): OverdraftStreak {
  const { startDate, endDate } = resolvePeriodRange(period, today)
  const filtered = records.filter((r) => r.date >= startDate && r.date <= endDate)
  const expenseByDate = buildDailyExpenseMap(filtered)
  const dates = buildDateRange(startDate, endDate)
  const days: OverdraftDay[] = dates.map((date) => {
    const totalExpense = expenseByDate.get(date) ?? 0
    return {
      date,
      totalExpense,
      safeLine: dailySafeLine,
      isOverdraft: totalExpense > dailySafeLine
    }
  })

  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].isOverdraft) {
      current++
    } else {
      break
    }
  }

  const totalOverdraftDays = days.filter((d) => d.isOverdraft).length
  const lastOverdraftDate = totalOverdraftDays > 0 ? days.filter((d) => d.isOverdraft).pop()?.date ?? null : null

  return {
    current,
    riskTriggered: current >= RISK_THRESHOLD,
    lastOverdraftDate,
    days
  }
}

function resolvePeriodRange(period: PeriodKey, today: string): { startDate: string; endDate: string } {
  if (period === 'today') {
    return { startDate: today, endDate: today }
  }
  if (period === 'yesterday') {
    const yesterday = shiftDate(today, -1)
    return { startDate: yesterday, endDate: yesterday }
  }
  const daysBack = period === 'last7' ? 6 : 29
  return { startDate: shiftDate(today, -daysBack), endDate: today }
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shiftDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return localDateKey(d)
}

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00')
  const last = new Date(end + 'T00:00:00')
  while (current <= last) {
    dates.push(localDateKey(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function buildDailyExpenseMap(records: WealthRecord[]): Map<string, number> {
  const expenseTypes = new Set(['real_expense', 'ongoing_cost', 'experience_cost'])
  const map = new Map<string, number>()
  for (const record of records) {
    if (!expenseTypes.has(record.type)) continue
    map.set(record.date, (map.get(record.date) ?? 0) + record.amount)
  }
  return map
}

function buildDailyIncomeMap(records: WealthRecord[]): Map<string, number> {
  const incomeTypes = new Set(['real_income', 'passive_income', 'system_income', 'stable_finance'])
  const map = new Map<string, number>()
  for (const record of records) {
    if (!incomeTypes.has(record.type)) continue
    map.set(record.date, (map.get(record.date) ?? 0) + record.amount)
  }
  return map
}

function sortedUniqueDates(expenseByDate: Map<string, number>, today: string): string[] {
  const dates = new Set<string>(expenseByDate.keys())
  dates.add(today)
  return Array.from(dates).sort()
}

export type TrendDay = {
  date: string
  totalExpense: number
  totalIncome: number
  safeLine: number
  isOverdraft: boolean
  expenseRatio: number
  incomeRatio: number
}

export type CashflowTrend = {
  days: TrendDay[]
  period: 'last7' | 'last30'
  summaryText: string
}

export function calculateCashflowTrend(
  records: WealthRecord[],
  dailySafeLine: number,
  period: 'last7' | 'last30',
  today: string
): CashflowTrend {
  const daysBack = period === 'last7' ? 6 : 29
  const { startDate, endDate } = { startDate: shiftDate(today, -daysBack), endDate: today }
  const filtered = records.filter((r) => r.date >= startDate && r.date <= endDate)
  const expenseByDate = buildDailyExpenseMap(filtered)
  const incomeByDate = buildDailyIncomeMap(filtered)
  const dates = buildDateRange(startDate, endDate)
  const maxValue = Math.max(
    dailySafeLine,
    ...dates.map((d) => Math.max(expenseByDate.get(d) ?? 0, incomeByDate.get(d) ?? 0))
  )

  const days: TrendDay[] = dates.map((date) => {
    const totalExpense = expenseByDate.get(date) ?? 0
    const totalIncome = incomeByDate.get(date) ?? 0
    return {
      date,
      totalExpense,
      totalIncome,
      safeLine: dailySafeLine,
      isOverdraft: totalExpense > dailySafeLine,
      expenseRatio: maxValue > 0 ? totalExpense / maxValue : 0,
      incomeRatio: maxValue > 0 ? totalIncome / maxValue : 0
    }
  })

  return {
    days,
    period,
    summaryText: buildTrendSummary(days, period)
  }
}

function buildTrendSummary(days: TrendDay[], period: 'last7' | 'last30'): string {
  const label = period === 'last7' ? '最近 7 天' : '最近 30 天'
  const overdraftCount = days.filter((d) => d.isOverdraft).length
  const totalDays = days.length

  if (overdraftCount === 0) {
    return `${label}现金流稳定，所有天数均在安全线以内。`
  }

  let consecutive = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].isOverdraft) {
      consecutive++
    } else {
      break
    }
  }

  if (consecutive >= 3) {
    return `${label}连续 ${consecutive} 天透支，透支压力升高，需要收缩支出。`
  }
  if (consecutive > 0) {
    return `${label}末尾 ${consecutive} 天透支，注意避免连续化。`
  }
  if (overdraftCount > totalDays / 2) {
    return `${label}透支 ${overdraftCount}/${totalDays} 天，透支频率偏高。`
  }
  return `${label}透支 ${overdraftCount}/${totalDays} 天，整体可控。`
}
