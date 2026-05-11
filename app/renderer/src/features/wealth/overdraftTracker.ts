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

function shiftDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00')
  const last = new Date(end + 'T00:00:00')
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10))
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

function sortedUniqueDates(expenseByDate: Map<string, number>, today: string): string[] {
  const dates = new Set<string>(expenseByDate.keys())
  dates.add(today)
  return Array.from(dates).sort()
}
