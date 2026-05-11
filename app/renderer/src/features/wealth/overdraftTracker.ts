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
