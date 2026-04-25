export type WealthStatus =
  | 'growth'
  | 'balanced'
  | 'light_overdraft'
  | 'future_money_burning'
  | 'system_risk'

export type WealthRecordType =
  | 'real_income'
  | 'passive_income'
  | 'system_income'
  | 'stable_finance'
  | 'real_expense'
  | 'ongoing_cost'
  | 'experience_cost'
  | 'asset_change'

export type WealthRecord = {
  id: string
  date: string
  type: WealthRecordType
  amount: number
  title?: string
  category?: string
  source?: string
  note?: string
  meta?: {
    cycle?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    isRigid?: boolean
    cancelDifficulty?: number
    stabilityScore?: number
    laborDependencyScore?: number
    systemType?: 'content' | 'software' | 'automation' | 'project' | 'other' | string
    financeType?: 'interest' | 'dividend' | 'fund' | 'crypto' | 'stock' | 'other' | string
    necessity?: 'necessary' | 'optional'
    trigger?: string
    isDopamineLeak?: boolean
    assetType?: 'cash' | 'saving' | 'investment' | 'crypto' | 'device' | 'other' | string
    direction?: 'increase' | 'decrease'
  }
  createdAt: string
  updatedAt: string
}

type WealthRecordCycle = NonNullable<WealthRecord['meta']>['cycle']

export type WealthBaseConfig = {
  date: string
  openingBalance: number
  dailySafeLine: number
  monthlyRemainingDisposable?: number
  remainingDaysInMonth?: number
  savingPoolBefore: number
  realityStandard: number
  deservedStandard: number
  consecutiveOverdraftDays?: number
}

export type WealthRecordSummary = {
  records: WealthRecord[]
  todaysRecords: WealthRecord[]
  totalIncome: number
  totalExpense: number
  realIncome: number
  passiveIncome: number
  systemIncome: number
  stableFinance: number
  realExpense: number
  ongoingCost: number
  experienceCost: number
  assetDelta: number
  monthlyOngoingPressure: number
  supportCoverage: number
  laborDependency: number
  monthlyGap: number
  freedomDelta: number
  assetBuckets: Record<string, number>
}

export type DailyWealthSnapshot = {
  date: string

  openingBalance: number
  closingBalance: number
  accountDelta: number

  realIncomeToday: number
  passiveIncomeToday: number
  systemIncomeToday: number
  stableFinanceToday: number

  realExpensesToday: number
  ongoingCostToday: number
  experienceCostToday: number
  emergencyCostToday: number

  dailySafeLine: number
  dynamicDailyAllowance: number
  todayOverspend: number

  savingPoolBefore: number
  savingPoolAfter: number
  futureMoneyUsed: number

  investableSurplus: number

  realityStandard: number
  deservedStandard: number
  monthlyGap: number
  laborDependency: number
  supportCoverage: number

  freedomDelta: number
  wealthScore: number

  status: WealthStatus
  diagnosis: string
  priorityAction: string
}

export type DailyWealthSnapshotInput = Omit<
  DailyWealthSnapshot,
  | 'accountDelta'
  | 'dynamicDailyAllowance'
  | 'todayOverspend'
  | 'savingPoolAfter'
  | 'futureMoneyUsed'
  | 'investableSurplus'
  | 'freedomDelta'
  | 'wealthScore'
  | 'status'
  | 'diagnosis'
  | 'priorityAction'
> & {
  monthlyRemainingDisposable?: number
  remainingDaysInMonth?: number
  consecutiveOverdraftDays?: number
}

export const wealthStatusLabels: Record<WealthStatus, string> = {
  growth: '增长日',
  balanced: '平衡日',
  light_overdraft: '轻微透支',
  future_money_burning: '未来钱燃烧',
  system_risk: '系统风险'
}

export const wealthRecordTypeLabels: Record<WealthRecordType, string> = {
  real_income: '现实收入',
  passive_income: '睡后收入',
  system_income: '系统收入',
  stable_finance: '稳定理财',
  real_expense: '真实支出',
  ongoing_cost: '持续出血',
  experience_cost: '体验出血',
  asset_change: '资产变化'
}

export const wealthRecordTypeDescriptions: Record<WealthRecordType, string> = {
  real_income: '这笔收入来自现实劳动，例如兼职、工资、接单、临时收入。',
  passive_income: '这笔收入是否不依赖你当下实时劳动？如果是，它会提高自由度。',
  system_income: '记录内容、自动化、软件、项目、系统带来的收入。',
  stable_finance: '记录利息、分红、定投收益、稳定回流。本轮只做手动记录。',
  real_expense: '记录日常必要支出，会影响每日额度和超支判断。',
  ongoing_cost: '这不是一次性花钱，而是一个会持续吸血的承诺。',
  experience_cost: '这笔消费是恢复性的，还是失控性的？',
  asset_change: '手动记录现金、储蓄、投资、数字资产、设备等资产变化。'
}

export function calculateDailyWealthSnapshot(input: DailyWealthSnapshotInput): DailyWealthSnapshot {
  const totalIncome =
    input.realIncomeToday + input.passiveIncomeToday + input.systemIncomeToday + input.stableFinanceToday
  const totalExpenses =
    input.realExpensesToday + input.ongoingCostToday + input.experienceCostToday + input.emergencyCostToday
  const accountDelta = input.closingBalance - input.openingBalance
  const dynamicDailyAllowance = resolveDynamicDailyAllowance(input)
  const flexibleCost = input.experienceCostToday + input.emergencyCostToday
  const todayOverspend = Math.max(0, flexibleCost - dynamicDailyAllowance)
  const futureMoneyUsed = Math.max(0, todayOverspend - input.savingPoolBefore)
  const savingPoolAfter = Math.max(0, input.savingPoolBefore - todayOverspend)
  const investableSurplus = Math.max(0, totalIncome - totalExpenses - futureMoneyUsed)
  const freedomDelta =
    input.passiveIncomeToday +
    input.systemIncomeToday +
    input.stableFinanceToday +
    investableSurplus -
    input.ongoingCostToday -
    futureMoneyUsed
  const status = resolveWealthStatus({
    dynamicDailyAllowance,
    futureMoneyUsed,
    investableSurplus,
    ongoingCostToday: input.ongoingCostToday,
    dailySafeLine: input.dailySafeLine,
    consecutiveOverdraftDays: input.consecutiveOverdraftDays ?? 0
  })
  const wealthScore = calculateWealthScore({
    status,
    freedomDelta,
    dynamicDailyAllowance,
    futureMoneyUsed,
    investableSurplus,
    supportCoverage: input.supportCoverage
  })

  return {
    ...input,
    accountDelta,
    dynamicDailyAllowance,
    todayOverspend,
    savingPoolAfter,
    futureMoneyUsed,
    investableSurplus,
    freedomDelta,
    wealthScore,
    status,
    diagnosis: buildDiagnosis(status, accountDelta, investableSurplus, futureMoneyUsed, freedomDelta),
    priorityAction: buildPriorityAction(status, todayOverspend, futureMoneyUsed, savingPoolAfter)
  }
}

export function summarizeWealthRecords(records: WealthRecord[], date: string, config: WealthBaseConfig): WealthRecordSummary {
  const todaysRecords = records.filter((record) => record.date === date)
  const totalByType = (type: WealthRecordType) =>
    todaysRecords.filter((record) => record.type === type).reduce((sum, record) => sum + record.amount, 0)

  const realIncome = totalByType('real_income')
  const passiveIncome = totalByType('passive_income')
  const systemIncome = totalByType('system_income')
  const stableFinance = totalByType('stable_finance')
  const realExpense = totalByType('real_expense')
  const ongoingCost = totalByType('ongoing_cost')
  const experienceCost = totalByType('experience_cost')
  const assetDelta = todaysRecords
    .filter((record) => record.type === 'asset_change')
    .reduce((sum, record) => sum + (record.meta?.direction === 'decrease' ? -record.amount : record.amount), 0)
  const totalIncome = realIncome + passiveIncome + systemIncome + stableFinance
  const totalExpense = realExpense + ongoingCost + experienceCost
  const supportCoverage = (passiveIncome + systemIncome + stableFinance) / Math.max(realExpense + ongoingCost, 1)
  const laborDependency = realIncome / Math.max(totalIncome, 1)
  const monthlyGap = config.realityStandard - config.deservedStandard
  const freedomDelta = passiveIncome + systemIncome + stableFinance - ongoingCost - experienceCost
  const monthlyOngoingPressure = todaysRecords
    .filter((record) => record.type === 'ongoing_cost')
    .reduce((sum, record) => sum + toMonthlyAmount(record.amount, record.meta?.cycle), 0)
  const assetBuckets = buildAssetBuckets(records)

  return {
    records,
    todaysRecords,
    totalIncome,
    totalExpense,
    realIncome,
    passiveIncome,
    systemIncome,
    stableFinance,
    realExpense,
    ongoingCost,
    experienceCost,
    assetDelta,
    monthlyOngoingPressure,
    supportCoverage,
    laborDependency,
    monthlyGap,
    freedomDelta,
    assetBuckets
  }
}

export function buildDailyWealthInputFromRecords(
  records: WealthRecord[],
  config: WealthBaseConfig
): DailyWealthSnapshotInput {
  const summary = summarizeWealthRecords(records, config.date, config)
  const closingBalance = config.openingBalance + summary.assetDelta + summary.totalIncome - summary.totalExpense

  return {
    date: config.date,
    openingBalance: config.openingBalance,
    closingBalance,
    realIncomeToday: summary.realIncome,
    passiveIncomeToday: summary.passiveIncome,
    systemIncomeToday: summary.systemIncome,
    stableFinanceToday: summary.stableFinance,
    realExpensesToday: summary.realExpense,
    ongoingCostToday: summary.ongoingCost,
    experienceCostToday: summary.experienceCost,
    emergencyCostToday: 0,
    dailySafeLine: config.dailySafeLine,
    monthlyRemainingDisposable: config.monthlyRemainingDisposable,
    remainingDaysInMonth: config.remainingDaysInMonth,
    savingPoolBefore: config.savingPoolBefore,
    realityStandard: config.realityStandard,
    deservedStandard: config.deservedStandard,
    monthlyGap: summary.monthlyGap,
    laborDependency: summary.laborDependency,
    supportCoverage: summary.supportCoverage,
    consecutiveOverdraftDays: config.consecutiveOverdraftDays
  }
}

function toMonthlyAmount(amount: number, cycle: WealthRecordCycle): number {
  if (cycle === 'daily') {
    return amount * 30
  }
  if (cycle === 'weekly') {
    return amount * 4
  }
  if (cycle === 'yearly') {
    return amount / 12
  }
  return amount
}

function buildAssetBuckets(records: WealthRecord[]): Record<string, number> {
  return records
    .filter((record) => record.type === 'asset_change')
    .reduce<Record<string, number>>((buckets, record) => {
      const assetType = record.meta?.assetType ?? 'other'
      const signedAmount = record.meta?.direction === 'decrease' ? -record.amount : record.amount
      buckets[assetType] = (buckets[assetType] ?? 0) + signedAmount
      return buckets
    }, {})
}

function resolveDynamicDailyAllowance(input: DailyWealthSnapshotInput): number {
  if (
    typeof input.monthlyRemainingDisposable === 'number' &&
    typeof input.remainingDaysInMonth === 'number' &&
    input.remainingDaysInMonth > 0
  ) {
    return Math.max(0, input.monthlyRemainingDisposable / input.remainingDaysInMonth)
  }

  return input.dailySafeLine
}

function resolveWealthStatus(input: {
  dynamicDailyAllowance: number
  futureMoneyUsed: number
  investableSurplus: number
  ongoingCostToday: number
  dailySafeLine: number
  consecutiveOverdraftDays: number
}): WealthStatus {
  const ongoingCostRiskLine = Math.max(input.dailySafeLine, input.dynamicDailyAllowance) * 1.15

  if (input.consecutiveOverdraftDays >= 3 || input.ongoingCostToday > ongoingCostRiskLine) {
    return 'system_risk'
  }

  if (input.futureMoneyUsed === 0 && input.investableSurplus > 0) {
    return 'growth'
  }

  if (input.futureMoneyUsed === 0 && input.investableSurplus === 0) {
    return 'balanced'
  }

  if (input.futureMoneyUsed <= input.dynamicDailyAllowance * 0.5) {
    return 'light_overdraft'
  }

  return 'future_money_burning'
}

function calculateWealthScore(input: {
  status: WealthStatus
  freedomDelta: number
  dynamicDailyAllowance: number
  futureMoneyUsed: number
  investableSurplus: number
  supportCoverage: number
}): number {
  const statusBase: Record<WealthStatus, number> = {
    growth: 84,
    balanced: 70,
    light_overdraft: 58,
    future_money_burning: 42,
    system_risk: 28
  }
  const allowance = Math.max(1, input.dynamicDailyAllowance)
  const freedomBonus = Math.max(-12, Math.min(12, (input.freedomDelta / allowance) * 8))
  const investableBonus = Math.min(8, (input.investableSurplus / allowance) * 4)
  const burnPenalty = Math.min(18, (input.futureMoneyUsed / allowance) * 8)
  const supportBonus = Math.max(0, Math.min(6, input.supportCoverage * 6))

  return Math.round(Math.max(0, Math.min(100, statusBase[input.status] + freedomBonus + investableBonus + supportBonus - burnPenalty)))
}

function buildDiagnosis(
  status: WealthStatus,
  accountDelta: number,
  investableSurplus: number,
  futureMoneyUsed: number,
  freedomDelta: number
): string {
  if (status === 'system_risk') {
    return '持续成本或连续透支已经压住系统，需要先止血再谈增长。'
  }
  if (status === 'future_money_burning') {
    return `今天已经动用未来钱 ${formatCurrencyCompact(futureMoneyUsed)}，自由度正在被提前消耗。`
  }
  if (status === 'light_overdraft') {
    return '今天有轻微透支，但仍处在可补回区间，重点是不要让它变成连续模式。'
  }
  if (status === 'growth') {
    return `账户变化 ${formatCurrencyCompact(accountDelta)}，可投资结余 ${formatCurrencyCompact(investableSurplus)}，今天在增加自由度。`
  }

  return `今天基本守住平衡，自由度净变化 ${formatCurrencyCompact(freedomDelta)}。`
}

function buildPriorityAction(
  status: WealthStatus,
  todayOverspend: number,
  futureMoneyUsed: number,
  savingPoolAfter: number
): string {
  if (status === 'system_risk') {
    return '先列出一项可砍持续成本，并在下次 Review 中确认是否执行。'
  }
  if (status === 'future_money_burning') {
    return `优先补回未来钱 ${formatCurrencyCompact(futureMoneyUsed)}，暂停非必要体验消费。`
  }
  if (status === 'light_overdraft') {
    return `把 ${formatCurrencyCompact(todayOverspend)} 透支记入明日额度，避免连续透支。`
  }
  if (status === 'growth') {
    return '把今日可投资结余转入投资池，保留一条可复盘证据。'
  }

  return savingPoolAfter > 0 ? '继续守住动态额度，不额外动用节省池。' : '先恢复节省池，再扩大可投资结余。'
}

function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0
  }).format(value)
}
