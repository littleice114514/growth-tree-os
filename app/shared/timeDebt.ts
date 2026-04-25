export type TimeDebtValueJudgement = 'green' | 'red' | 'neutral'
export type TimeDebtDiagnosisStatus = 'surplus' | 'balanced' | 'overdraft' | 'recovery_needed' | 'undefined'
export type TimeDebtRiskLevel = 'low' | 'medium' | 'high'

export type TimeDebtLog = {
  id: string
  title: string
  primaryCategory: string
  secondaryProject: string
  startTime: string
  endTime: string
  durationMinutes: number
  workload?: number
  workloadUnit?: string
  efficiencyMinutesPerUnit?: number
  efficiencyText?: string
  resultNote?: string
  aiEnableRatio?: number
  statusScore?: number
  dimension?: string
  idealTimeDebt?: number
  realTimeNourishment?: number
  valueJudgement?: TimeDebtValueJudgement
  statusWeightedMinutes?: number
  aiWeightedMinutes?: number
  createdAt: string
  updatedAt: string
}

export type WorkTimeStandard = {
  id: string
  date: string
  standardWorkHours: number
  standardWorkMinutes: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type ProjectCategory = {
  id: string
  dimension: string
  primaryCategory: string
  secondaryProject: string
  defaultWorkloadUnit?: string
  isWorkType: boolean
  enabled: boolean
  sortOrder?: number
  createdAt: string
  updatedAt: string
}

export type TimeDebtParams = {
  id: string
  year: number
  annualIncome: number
  effectiveWorkDays: number
  averageWorkHoursPerDay: number
  annualWorkMinutes: number
  realTimeValuePerMinute: number
  realTimeValuePerHour: number
  idealHourlyWage: number
  idealValuePerMinute: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type DailyTimeDebtStats = {
  date: string
  totalLogs: number
  totalMinutes: number
  workMinutes: number
  nonWorkMinutes: number
  standardWorkMinutes: number
  workMinuteDelta: number
  totalWorkload?: number
  averageEfficiency?: number
  totalIdealTimeDebt: number
  totalRealTimeNourishment: number
  netTimeValue: number
  averageStatusScore?: number
  averageAiEnableRatio?: number
  createdAt: string
  updatedAt: string
}

export type TimeDebtDiagnosis = {
  date: string
  status: TimeDebtDiagnosisStatus
  title: string
  summary: string
  reason: string
  suggestion: string
  standardWorkMinutes: number
  actualWorkMinutes: number
  workMinuteDelta: number
  netTimeValue: number
  riskLevel: TimeDebtRiskLevel
}

export type TimeDebtLogDraft = {
  title: string
  primaryCategory: string
  secondaryProject: string
  startTime: string
  endTime: string
  workload?: number
  workloadUnit?: string
  resultNote?: string
  aiEnableRatio?: number
  statusScore?: number
  dimension?: string
}

export type TimeDebtParamsInput = {
  id?: string
  year: number
  annualIncome: number
  effectiveWorkDays: number
  averageWorkHoursPerDay: number
  idealHourlyWage: number
  note?: string
}

export const timeDebtStatusLabels: Record<TimeDebtDiagnosisStatus, string> = {
  surplus: '时间盈余',
  balanced: '基本平衡',
  overdraft: '时间透支',
  recovery_needed: '需要恢复',
  undefined: '数据不足'
}

export const defaultProjectCategories: ProjectCategory[] = [
  createCategory('cat-work-word', '时间管理', '工作', '单词突围考研版', '个', true, 1),
  createCategory('cat-work-dev', '时间管理', '工作', 'growth-tree-os', '项', true, 2),
  createCategory('cat-study', '成长', '学习', '知识输入', '页', false, 3),
  createCategory('cat-recovery', '恢复', '恢复', '睡眠 / 休息', '分钟', false, 4),
  createCategory('cat-life', '生活', '生活', '日常事务', '项', false, 5)
]

export const defaultTimeDebtParams = createTimeDebtParams({
  year: new Date().getFullYear(),
  annualIncome: 120000,
  effectiveWorkDays: 240,
  averageWorkHoursPerDay: 8,
  idealHourlyWage: 120,
  note: 'Time Debt V1 默认参数，可在页面中调整。'
})

export function createTimeDebtParams(input: TimeDebtParamsInput): TimeDebtParams {
  const timestamp = new Date().toISOString()
  const annualWorkMinutes = input.effectiveWorkDays * input.averageWorkHoursPerDay * 60
  const realTimeValuePerMinute = input.annualIncome / Math.max(annualWorkMinutes, 1)
  const realTimeValuePerHour = realTimeValuePerMinute * 60
  const idealValuePerMinute = input.idealHourlyWage / 60

  return {
    id: input.id ?? `time-debt-params-${input.year}`,
    year: input.year,
    annualIncome: input.annualIncome,
    effectiveWorkDays: input.effectiveWorkDays,
    averageWorkHoursPerDay: input.averageWorkHoursPerDay,
    annualWorkMinutes,
    realTimeValuePerMinute,
    realTimeValuePerHour,
    idealHourlyWage: input.idealHourlyWage,
    idealValuePerMinute,
    note: input.note,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export function createWorkTimeStandard(date: string, standardWorkHours: number, note?: string): WorkTimeStandard {
  const timestamp = new Date().toISOString()
  return {
    id: `standard-${date}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    standardWorkHours,
    standardWorkMinutes: Math.round(standardWorkHours * 60),
    note,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export function createTimeDebtLog(
  draft: TimeDebtLogDraft,
  params: TimeDebtParams = defaultTimeDebtParams
): TimeDebtLog {
  const timestamp = new Date().toISOString()
  return enrichTimeDebtLog(
    {
      id: `time-debt-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: draft.title.trim(),
      primaryCategory: draft.primaryCategory.trim(),
      secondaryProject: draft.secondaryProject.trim(),
      startTime: draft.startTime,
      endTime: draft.endTime,
      durationMinutes: 0,
      workload: draft.workload,
      workloadUnit: draft.workloadUnit?.trim() || undefined,
      resultNote: draft.resultNote?.trim() || undefined,
      aiEnableRatio: draft.aiEnableRatio,
      statusScore: draft.statusScore,
      dimension: draft.dimension?.trim() || undefined,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    params
  )
}

export function enrichTimeDebtLog(log: TimeDebtLog, params: TimeDebtParams = defaultTimeDebtParams): TimeDebtLog {
  const durationMinutes = calculateDurationMinutes(log.startTime, log.endTime)
  const efficiencyMinutesPerUnit =
    typeof log.workload === 'number' && log.workload > 0 ? durationMinutes / log.workload : undefined
  const idealTimeDebt = params.idealValuePerMinute * durationMinutes
  const realTimeNourishment = params.realTimeValuePerMinute * durationMinutes
  const valueJudgement = resolveValueJudgement(log.primaryCategory, realTimeNourishment, idealTimeDebt)
  const statusWeightedMinutes = durationMinutes * (log.statusScore ?? 0)
  const aiWeightedMinutes = durationMinutes * normalizeRatio(log.aiEnableRatio)

  return {
    ...log,
    durationMinutes,
    efficiencyMinutesPerUnit,
    efficiencyText:
      typeof efficiencyMinutesPerUnit === 'number'
        ? `${efficiencyMinutesPerUnit.toFixed(2)} min / ${log.workloadUnit ?? '单位'}`
        : undefined,
    idealTimeDebt,
    realTimeNourishment,
    valueJudgement,
    statusWeightedMinutes,
    aiWeightedMinutes
  }
}

export function buildDailyTimeDebtStats(
  logs: TimeDebtLog[],
  date: string,
  standards: WorkTimeStandard[] = [],
  params: TimeDebtParams = defaultTimeDebtParams
): DailyTimeDebtStats {
  const timestamp = new Date().toISOString()
  const dayLogs = logs.filter((log) => getDateFromDateTime(log.startTime) === date).map((log) => enrichTimeDebtLog(log, params))
  const standardWorkMinutes = resolveStandardWorkMinutes(standards, date)
  const totalMinutes = sum(dayLogs.map((log) => log.durationMinutes))
  const workLogs = dayLogs.filter(isWorkLog)
  const workMinutes = sum(workLogs.map((log) => log.durationMinutes))
  const totalWorkload = sum(dayLogs.map((log) => log.workload ?? 0))
  const efficiencyLogs = dayLogs.filter((log) => typeof log.efficiencyMinutesPerUnit === 'number')
  const statusLogs = dayLogs.filter((log) => typeof log.statusScore === 'number')
  const aiLogs = dayLogs.filter((log) => typeof log.aiEnableRatio === 'number')
  const totalIdealTimeDebt = sum(dayLogs.map((log) => log.idealTimeDebt ?? 0))
  const totalRealTimeNourishment = sum(dayLogs.map((log) => log.realTimeNourishment ?? 0))

  return {
    date,
    totalLogs: dayLogs.length,
    totalMinutes,
    workMinutes,
    nonWorkMinutes: totalMinutes - workMinutes,
    standardWorkMinutes,
    workMinuteDelta: workMinutes - standardWorkMinutes,
    totalWorkload: totalWorkload > 0 ? totalWorkload : undefined,
    averageEfficiency:
      efficiencyLogs.length > 0 ? sum(efficiencyLogs.map((log) => log.efficiencyMinutesPerUnit ?? 0)) / efficiencyLogs.length : undefined,
    totalIdealTimeDebt,
    totalRealTimeNourishment,
    netTimeValue: totalRealTimeNourishment - totalIdealTimeDebt,
    averageStatusScore:
      statusLogs.length > 0 ? sum(statusLogs.map((log) => log.statusScore ?? 0)) / statusLogs.length : undefined,
    averageAiEnableRatio: aiLogs.length > 0 ? sum(aiLogs.map((log) => normalizeRatio(log.aiEnableRatio))) / aiLogs.length : undefined,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export function buildTimeDebtDiagnosis(stats: DailyTimeDebtStats): TimeDebtDiagnosis {
  if (stats.totalLogs === 0) {
    return {
      date: stats.date,
      status: 'undefined',
      title: '数据不足',
      summary: '今天还没有时间日志，暂时无法判断是在还债、欠债还是恢复。',
      reason: 'Time Debt V1 依赖时间日志和标准工时作为事实输入。',
      suggestion: '先补一条关键时间日志，再查看日度统计和仪表盘诊断。',
      standardWorkMinutes: stats.standardWorkMinutes,
      actualWorkMinutes: stats.workMinutes,
      workMinuteDelta: stats.workMinuteDelta,
      netTimeValue: stats.netTimeValue,
      riskLevel: 'medium'
    }
  }

  const closeToStandard = Math.abs(stats.workMinuteDelta) <= 30
  const closeToZero = Math.abs(stats.netTimeValue) <= 10
  const status =
    stats.workMinutes >= stats.standardWorkMinutes && stats.netTimeValue >= 0
      ? 'surplus'
      : closeToStandard && closeToZero
        ? 'balanced'
        : stats.workMinutes > stats.standardWorkMinutes && stats.netTimeValue < 0
          ? 'overdraft'
          : stats.workMinutes < stats.standardWorkMinutes * 0.5
            ? 'recovery_needed'
            : 'undefined'

  return {
    date: stats.date,
    status,
    title: timeDebtStatusLabels[status],
    summary: buildDiagnosisSummary(status, stats),
    reason: buildDiagnosisReason(status, stats),
    suggestion: buildDiagnosisSuggestion(status),
    standardWorkMinutes: stats.standardWorkMinutes,
    actualWorkMinutes: stats.workMinutes,
    workMinuteDelta: stats.workMinuteDelta,
    netTimeValue: stats.netTimeValue,
    riskLevel: status === 'overdraft' ? 'high' : status === 'undefined' || status === 'recovery_needed' ? 'medium' : 'low'
  }
}

export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }
  return Math.round((end - start) / 60000)
}

export function getDateFromDateTime(dateTime: string): string {
  return dateTime.slice(0, 10)
}

export function resolveStandardWorkMinutes(standards: WorkTimeStandard[], date: string): number {
  const standard = standards.find((item) => item.date === date)
  return standard?.standardWorkMinutes ?? 480
}

function createCategory(
  id: string,
  dimension: string,
  primaryCategory: string,
  secondaryProject: string,
  defaultWorkloadUnit: string,
  isWorkType: boolean,
  sortOrder: number
): ProjectCategory {
  const timestamp = new Date().toISOString()
  return {
    id,
    dimension,
    primaryCategory,
    secondaryProject,
    defaultWorkloadUnit,
    isWorkType,
    enabled: true,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

function resolveValueJudgement(
  primaryCategory: string,
  realTimeNourishment: number,
  idealTimeDebt: number
): TimeDebtValueJudgement {
  if (primaryCategory !== '工作') {
    return 'neutral'
  }
  return realTimeNourishment >= idealTimeDebt ? 'green' : 'red'
}

function isWorkLog(log: TimeDebtLog): boolean {
  return log.primaryCategory === '工作'
}

function normalizeRatio(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }
  return value > 1 ? value / 100 : value
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function buildDiagnosisSummary(status: TimeDebtDiagnosisStatus, stats: DailyTimeDebtStats): string {
  if (status === 'surplus') {
    return '今天工作时长达到标准，并且净时间价值为正。'
  }
  if (status === 'balanced') {
    return '今天接近标准工时，净时间价值也接近平衡。'
  }
  if (status === 'overdraft') {
    return '今天工作时长超过标准，但净时间价值为负，存在时间透支。'
  }
  if (status === 'recovery_needed') {
    return '今天工作时长明显低于标准，可能需要恢复或补充记录。'
  }
  return `今天已有 ${stats.totalLogs} 条日志，但还不足以稳定判断。`
}

function buildDiagnosisReason(status: TimeDebtDiagnosisStatus, stats: DailyTimeDebtStats): string {
  return `标准工时 ${stats.standardWorkMinutes} min，实际工作 ${stats.workMinutes} min，工时差额 ${stats.workMinuteDelta} min，净时间价值 ${stats.netTimeValue.toFixed(2)}。`
}

function buildDiagnosisSuggestion(status: TimeDebtDiagnosisStatus): string {
  if (status === 'surplus') {
    return '保留今天最有价值的一条日志，作为后续复盘证据。'
  }
  if (status === 'balanced') {
    return '继续保持标准工时，并检查是否有可 AI 化的重复工作。'
  }
  if (status === 'overdraft') {
    return '优先检查低价值高耗时任务，避免用更长时间制造未来压力。'
  }
  if (status === 'recovery_needed') {
    return '先判断是恢复日还是漏记日志，再决定是否补工作债。'
  }
  return '先补充关键日志和标准工时，再进行诊断。'
}
