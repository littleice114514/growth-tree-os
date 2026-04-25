export type WealthStatus =
  | 'growth'
  | 'balanced'
  | 'light_overdraft'
  | 'future_money_burning'
  | 'system_risk'

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
