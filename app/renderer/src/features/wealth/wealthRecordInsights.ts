import { wealthRecordTypeLabels, type WealthRecord, type WealthRecordType } from '@shared/wealth'

const expenseTypes: WealthRecordType[] = ['real_expense', 'ongoing_cost', 'experience_cost']
const isExpenseType = (type: WealthRecordType) => expenseTypes.includes(type)

/**
 * Get the category label for an expense record.
 * real_expense / experience_cost use `category`, ongoing_cost uses `title`.
 */
export function getExpenseCategory(record: WealthRecord): string {
  if (record.type === 'ongoing_cost') return record.title ?? '未分类'
  return record.category ?? '未分类'
}

/* ── Search ── */

export function searchRecords(records: WealthRecord[], query: string): WealthRecord[] {
  const q = query.trim().toLowerCase()
  if (!q) return records

  return records.filter((r) => {
    const fields = [
      wealthRecordTypeLabels[r.type],
      r.category ?? '',
      r.title ?? '',
      r.source ?? '',
      r.note ?? '',
      r.meta?.trigger ?? '',
      r.date,
      String(r.amount)
    ]
    return fields.some((f) => f.toLowerCase().includes(q))
  })
}

/* ── Grouping ── */

export type GroupMode = 'date' | 'type' | 'category'

export type RecordGroup = {
  key: string
  label: string
  records: WealthRecord[]
}

export function groupRecords(records: WealthRecord[], mode: GroupMode): RecordGroup[] {
  const map = new Map<string, WealthRecord[]>()

  for (const r of records) {
    let key: string
    if (mode === 'date') {
      key = r.date
    } else if (mode === 'type') {
      key = wealthRecordTypeLabels[r.type]
    } else {
      key = isExpenseType(r.type) ? getExpenseCategory(r) : (r.source ?? r.title ?? '未分类')
    }

    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }

  const groups: RecordGroup[] = []
  for (const [key, recs] of map) {
    groups.push({ key, label: key, records: recs })
  }

  // Sort: date descending, others alphabetical
  if (mode === 'date') {
    groups.sort((a, b) => b.key.localeCompare(a.key))
  } else {
    groups.sort((a, b) => a.key.localeCompare(b.key))
  }

  return groups
}

/* ── Income Breakdown (for pie chart) ── */

const incomeTypes: WealthRecordType[] = ['real_income', 'passive_income', 'system_income', 'stable_finance']
const isIncomeType = (type: WealthRecordType) => incomeTypes.includes(type)

export function getIncomeSource(record: WealthRecord): string {
  if (record.source) return record.source
  return wealthRecordTypeLabels[record.type] ?? '其他收入'
}

export type IncomeSlice = {
  source: string
  amount: number
  ratio: number
  isStable: boolean
  isPassive: boolean
}

export type IncomeBreakdown = {
  slices: IncomeSlice[]
  total: number
  maxSource: string
  stableRatio: number
  passiveRatio: number
}

export function calculateIncomeBreakdown(
  records: WealthRecord[],
  period: InsightPeriod,
  referenceDate: string
): IncomeBreakdown {
  const { start, end } = getDateRange(period, referenceDate)

  const incomes = records.filter((r) => {
    if (r.date < start || r.date > end) return false
    if (isIncomeType(r.type)) return true
    if (r.type === 'asset_change' && r.meta?.direction === 'increase') return true
    return false
  })

  if (incomes.length === 0) {
    return { slices: [], total: 0, maxSource: '', stableRatio: 0, passiveRatio: 0 }
  }

  const sourceMap = new Map<string, { amount: number; isStable: boolean; isPassive: boolean }>()
  for (const r of incomes) {
    const src = getIncomeSource(r)
    const existing = sourceMap.get(src)
    const isStable = r.type === 'stable_finance'
    const isPassive = r.type === 'passive_income'
    if (existing) {
      existing.amount += r.amount
      existing.isStable = existing.isStable || isStable
      existing.isPassive = existing.isPassive || isPassive
    } else {
      sourceMap.set(src, { amount: r.amount, isStable, isPassive })
    }
  }

  const total = Array.from(sourceMap.values()).reduce((sum, v) => sum + v.amount, 0)
  const slices: IncomeSlice[] = []

  let stableTotal = 0
  let passiveTotal = 0

  for (const [source, { amount, isStable, isPassive }] of sourceMap) {
    slices.push({ source, amount, ratio: total > 0 ? amount / total : 0, isStable, isPassive })
    if (isStable) stableTotal += amount
    if (isPassive) passiveTotal += amount
  }

  slices.sort((a, b) => b.amount - a.amount)
  const maxSource = slices[0]?.source ?? ''

  return {
    slices,
    total,
    maxSource,
    stableRatio: total > 0 ? stableTotal / total : 0,
    passiveRatio: total > 0 ? passiveTotal / total : 0
  }
}

/* ── Expense Breakdown (for pie chart) ── */

export type ExpenseSlice = {
  category: string
  amount: number
  ratio: number
}

export type ExpenseBreakdown = {
  slices: ExpenseSlice[]
  total: number
}

export type InsightPeriod = 'today' | 'last7' | 'last30'

export const insightPeriodLabels: Record<InsightPeriod, string> = {
  today: '今天',
  last7: '近 7 天',
  last30: '近 30 天'
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDateRange(period: InsightPeriod, referenceDate: string): { start: string; end: string } {
  const end = referenceDate
  if (period === 'today') return { start: end, end }

  const days = period === 'last7' ? 6 : 29 // inclusive: today + N-1 previous days
  const d = new Date(end + 'T00:00:00')
  d.setDate(d.getDate() - days)
  const start = localDateKey(d)
  return { start, end }
}

export function calculateExpenseBreakdown(
  records: WealthRecord[],
  period: InsightPeriod,
  referenceDate: string
): ExpenseBreakdown {
  const { start, end } = getDateRange(period, referenceDate)

  const expenses = records.filter(
    (r) => isExpenseType(r.type) && r.date >= start && r.date <= end
  )

  if (expenses.length === 0) {
    return { slices: [], total: 0 }
  }

  const catMap = new Map<string, number>()
  for (const r of expenses) {
    const cat = getExpenseCategory(r)
    catMap.set(cat, (catMap.get(cat) ?? 0) + r.amount)
  }

  const total = Array.from(catMap.values()).reduce((sum, v) => sum + v, 0)
  const slices: ExpenseSlice[] = []

  for (const [category, amount] of catMap) {
    slices.push({ category, amount, ratio: total > 0 ? amount / total : 0 })
  }

  slices.sort((a, b) => b.amount - a.amount)
  return { slices, total }
}
