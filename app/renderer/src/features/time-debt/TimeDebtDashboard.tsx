import { useEffect, useMemo, useState } from 'react'
import {
  buildTimeDebtOverview,
  buildTimeDebtDiagnosis,
  calculateDurationMinutes,
  createTimeDebtLog,
  createTimeDebtParams,
  createWorkTimeStandard,
  defaultProjectCategories,
  timeDebtStatusLabels,
  type DailyTimeDebtStats,
  type TimeDebtDiagnosis,
  type TimeDebtLog,
  type TimeDebtOverview,
  type TimeDebtParams,
  type WorkTimeStandard
} from '@shared/timeDebt'
import {
  appendTimeDebtLog,
  appendWorkTimeStandard,
  deleteTimeDebtLog,
  loadTimeDebtLogs,
  loadTimeDebtParams,
  loadWorkTimeStandards,
  saveTimeDebtParams,
  timeDebtStorageKeys
} from './timeDebtStorage'
import { SmartOptionInput } from './SmartOptionInput'
import {
  loadTimeDebtOptions,
  saveTimeDebtOptions,
  timeDebtOptionsStorageKey,
  upsertTimeDebtOptions,
  type TimeDebtOptions
} from './timeDebtOptionsStorage'
import { TimeDebtDashboardPreview } from '@/features/dashboard-preview'

type TimeDebtView = 'overview' | 'logs' | 'dailyStats' | 'debtParams' | 'workStandard' | 'diagnosis'

type LogDraft = {
  title: string
  primaryCategory: string
  secondaryProject: string
  startTime: string
  endTime: string
  workload: string
  workloadUnit: string
  statusScore: string
  aiEnableRatio: string
  dimension: string
  resultNote: string
}

type StandardDraft = {
  date: string
  standardWorkHours: string
  note: string
}

type RunningTimer = {
  title: string
  primaryCategory: string
  secondaryProject: string
  workloadUnit: string
  startTime: string
  startTimestampMs: number
}

const today = new Date().toISOString().slice(0, 10)
const sampleDate = '2026-03-30'
const viewLabels: Record<TimeDebtView, string> = {
  overview: '总览',
  logs: '时间日志',
  dailyStats: '日度统计',
  debtParams: '负债参数',
  workStandard: '工作时间标准',
  diagnosis: '仪表盘诊断'
}

export function TimeDebtDashboard() {
  const [logs, setLogs] = useState<TimeDebtLog[]>(() => loadTimeDebtLogs())
  const [standards, setStandards] = useState<WorkTimeStandard[]>(() => loadWorkTimeStandards())
  const [params, setParams] = useState<TimeDebtParams>(() => loadTimeDebtParams())
  const [options, setOptions] = useState<TimeDebtOptions>(() => loadTimeDebtOptions())
  const [currentView, setCurrentView] = useState<TimeDebtView>('overview')
  const [logDraft, setLogDraft] = useState<LogDraft>(() => createSampleLogDraft())
  const [runningTimer, setRunningTimer] = useState<RunningTimer | null>(null)
  const [timerNow, setTimerNow] = useState(() => Date.now())
  const [standardDraft, setStandardDraft] = useState<StandardDraft>(() => ({
    date: today,
    standardWorkHours: '8',
    note: ''
  }))
  const [paramsDraft, setParamsDraft] = useState(() => ({
    annualIncome: String(params.annualIncome),
    effectiveWorkDays: String(params.effectiveWorkDays),
    averageWorkHoursPerDay: String(params.averageWorkHoursPerDay),
    idealHourlyWage: String(params.idealHourlyWage),
    note: params.note ?? ''
  }))

  const selectedDate = today
  const overview = useMemo(() => buildTimeDebtOverview(logs, selectedDate, standards, params), [logs, params, selectedDate, standards])
  const stats = overview.stats
  const diagnosis = useMemo(() => buildTimeDebtDiagnosis(stats), [stats])

  useEffect(() => {
    if (!runningTimer) {
      return undefined
    }
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [runningTimer])

  const persistLog = (draft: LogDraft): boolean => {
    if (!draft.title.trim() || !draft.startTime || !draft.endTime) {
      return false
    }
    const log = createTimeDebtLog(
      {
        title: draft.title,
        primaryCategory: draft.primaryCategory,
        secondaryProject: draft.secondaryProject,
        startTime: draft.startTime,
        endTime: draft.endTime,
        workload: optionalNumber(draft.workload),
        workloadUnit: draft.workloadUnit,
        statusScore: optionalNumber(draft.statusScore),
        aiEnableRatio: optionalNumber(draft.aiEnableRatio),
        dimension: draft.dimension,
        resultNote: draft.resultNote
      },
      params
    )
    setLogs(appendTimeDebtLog(log))
    const nextOptions = upsertTimeDebtOptions(options, {
      category: draft.primaryCategory,
      project: draft.secondaryProject,
      unit: draft.workloadUnit
    })
    setOptions(nextOptions)
    saveTimeDebtOptions(nextOptions)
    return true
  }

  const saveLog = () => {
    persistLog(logDraft)
  }

  const startTimer = () => {
    if (!logDraft.title.trim() || runningTimer) {
      return
    }
    const now = new Date()
    const startTime = formatLocalDateTimeInput(now)
    const workloadUnit = logDraft.workloadUnit || 'min'
    setRunningTimer({
      title: logDraft.title.trim(),
      primaryCategory: logDraft.primaryCategory.trim(),
      secondaryProject: logDraft.secondaryProject.trim(),
      workloadUnit,
      startTime,
      startTimestampMs: now.getTime()
    })
    setTimerNow(now.getTime())
    setLogDraft((current) => ({
      ...current,
      startTime,
      endTime: '',
      workloadUnit
    }))
  }

  const finishTimer = () => {
    if (!runningTimer) {
      return
    }
    const now = new Date()
    const minimumEndTimestamp = runningTimer.startTimestampMs + 60000
    const endDate = new Date(Math.max(now.getTime(), minimumEndTimestamp))
    const endTime = formatLocalDateTimeInput(endDate)
    const durationMinutes = Math.max(1, calculateDurationMinutes(runningTimer.startTime, endTime))
    const nextDraft = {
      ...logDraft,
      title: runningTimer.title,
      primaryCategory: runningTimer.primaryCategory,
      secondaryProject: runningTimer.secondaryProject,
      startTime: runningTimer.startTime,
      endTime,
      workload: logDraft.workload || String(durationMinutes),
      workloadUnit: runningTimer.workloadUnit || 'min'
    }
    if (persistLog(nextDraft)) {
      setLogDraft(nextDraft)
      setRunningTimer(null)
    }
  }

  const saveStandard = () => {
    const standardWorkHours = Number(standardDraft.standardWorkHours)
    if (!standardDraft.date || !Number.isFinite(standardWorkHours) || standardWorkHours <= 0) {
      return
    }
    setStandards(appendWorkTimeStandard(createWorkTimeStandard(standardDraft.date, standardWorkHours, standardDraft.note.trim() || undefined)))
  }

  const saveParams = () => {
    const next = createTimeDebtParams({
      year: new Date().getFullYear(),
      annualIncome: Number(paramsDraft.annualIncome),
      effectiveWorkDays: Number(paramsDraft.effectiveWorkDays),
      averageWorkHoursPerDay: Number(paramsDraft.averageWorkHoursPerDay),
      idealHourlyWage: Number(paramsDraft.idealHourlyWage),
      note: paramsDraft.note.trim() || undefined
    })
    setParams(next)
    saveTimeDebtParams(next)
  }

  const removeLog = (logId: string) => {
    setLogs(deleteTimeDebtLog(logId))
  }

  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--panel-border)] pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Time Debt</div>
            <h2 className="mt-2 text-2xl font-semibold">时间负债</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
              记录时间日志、工作时间标准和负债参数，用来判断今天是在还债、欠债、产生价值，还是制造未来压力。
            </p>
          </div>
          <StatusBadge overview={overview} />
        </header>

        <nav className="flex flex-wrap gap-2">
          {(Object.keys(viewLabels) as TimeDebtView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setCurrentView(view)}
              className={
                currentView === view
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'
                  : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {viewLabels[view]}
            </button>
          ))}
        </nav>

        {currentView === 'overview' ? (
          <>
            <TimeDebtDashboardPreview overview={overview} />
            <Overview overview={overview} onOpenLogs={() => setCurrentView('logs')} />
          </>
        ) : null}
        {currentView === 'logs' ? (
          <LogsView
            draft={logDraft}
            logs={logs}
            options={options}
            runningTimer={runningTimer}
            timerNow={timerNow}
            onChange={(patch) => setLogDraft((current) => ({ ...current, ...patch }))}
            onSave={saveLog}
            onDelete={removeLog}
            onStartTimer={startTimer}
            onFinishTimer={finishTimer}
            onCreateOption={(values) => {
              const nextOptions = upsertTimeDebtOptions(options, values)
              setOptions(nextOptions)
              saveTimeDebtOptions(nextOptions)
            }}
          />
        ) : null}
        {currentView === 'dailyStats' ? <DailyStatsView stats={stats} selectedDate={selectedDate} /> : null}
        {currentView === 'debtParams' ? (
          <DebtParamsView params={params} draft={paramsDraft} onChange={(patch) => setParamsDraft((current) => ({ ...current, ...patch }))} onSave={saveParams} />
        ) : null}
        {currentView === 'workStandard' ? (
          <WorkStandardView standards={standards} draft={standardDraft} onChange={(patch) => setStandardDraft((current) => ({ ...current, ...patch }))} onSave={saveStandard} />
        ) : null}
        {currentView === 'diagnosis' ? <DiagnosisView diagnosis={diagnosis} stats={stats} /> : null}
      </div>
    </main>
  )
}

function Overview({ overview, onOpenLogs }: { overview: TimeDebtOverview; onOpenLogs: () => void }) {
  const hasTodayLogs = overview.totalMinutes > 0
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="时间负债总览" eyebrow={overview.date}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Metric label="今日状态" value={overview.statusLabel} />
          <Metric label="总记录时间" value={formatMinutes(overview.totalMinutes)} />
          <Metric label="今日标准工时" value={formatMinutes(overview.standardWorkMinutes)} />
          <Metric label="今日实际工时" value={formatMinutes(overview.actualWorkMinutes)} />
          <Metric label="工时差额" value={formatSignedMinutes(overview.workDeltaMinutes)} tone={overview.workDeltaMinutes > 0 ? 'warn' : 'good'} />
          <Metric label="净时间价值" value={formatMoney(overview.netTimeValue)} tone={overview.netTimeValue >= 0 ? 'good' : 'bad'} />
        </div>
        <p className="mt-4 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4 text-sm leading-6 text-[color:var(--text-secondary)]">
          {overview.diagnosis} {overview.nextAction}
        </p>
        {!hasTodayLogs ? (
          <button type="button" onClick={onOpenLogs} className="mt-4 rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]">
            去新增时间日志
          </button>
        ) : null}
      </Panel>
      <Panel title="最近时间日志 3 条" eyebrow="Recent Logs">
        <LogList logs={overview.recentLogs.slice(0, 3)} />
      </Panel>
    </div>
  )
}

function LogsView({
  draft,
  logs,
  options,
  runningTimer,
  timerNow,
  onChange,
  onSave,
  onDelete,
  onStartTimer,
  onFinishTimer,
  onCreateOption
}: {
  draft: LogDraft
  logs: TimeDebtLog[]
  options: TimeDebtOptions
  runningTimer: RunningTimer | null
  timerNow: number
  onChange: (patch: Partial<LogDraft>) => void
  onSave: () => void
  onDelete: (logId: string) => void
  onStartTimer: () => void
  onFinishTimer: () => void
  onCreateOption: (values: { category?: string; project?: string; unit?: string }) => void
}) {
  const selectedCategory = defaultProjectCategories.find(
    (category) => category.primaryCategory === draft.primaryCategory && category.secondaryProject === draft.secondaryProject
  )
  const canStartTimer = Boolean(draft.title.trim()) && !runningTimer

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="新增时间日志" eyebrow="Work Logs">
        <div className="mb-4 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
          {runningTimer ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[color:var(--text-muted)]">当前计时中</div>
                <div className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{runningTimer.title}</div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[color:var(--text-secondary)]">
                  <span>开始时间：{formatDisplayDateTime(runningTimer.startTime)}</span>
                  <span>已进行：{formatElapsedTime(timerNow - runningTimer.startTimestampMs)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onFinishTimer}
                className="rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
              >
                结束计时并生成记录
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[color:var(--text-muted)]">当前计时：未开始</div>
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">先填写标题和分类，再用计时方式生成一条真实时间日志。</p>
              </div>
              <button
                type="button"
                onClick={onStartTimer}
                disabled={!canStartTimer}
                className="rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                开始计时
              </button>
            </div>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="标题" value={draft.title} onChange={(title) => onChange({ title })} />
          <SelectField
            label="分类字典"
            value={`${draft.primaryCategory}::${draft.secondaryProject}`}
            onChange={(value) => {
              const [primaryCategory, secondaryProject] = value.split('::')
              const category = defaultProjectCategories.find((item) => item.primaryCategory === primaryCategory && item.secondaryProject === secondaryProject)
              onChange({
                primaryCategory,
                secondaryProject,
                workloadUnit: category?.defaultWorkloadUnit ?? draft.workloadUnit,
                dimension: category?.dimension ?? draft.dimension
              })
            }}
            options={defaultProjectCategories.map((category) => `${category.primaryCategory}::${category.secondaryProject}`)}
          />
          <SmartOptionInput
            label="一级分类"
            value={draft.primaryCategory}
            options={options.categories}
            onChange={(primaryCategory) => onChange({ primaryCategory })}
            onCreateOption={(category) => onCreateOption({ category })}
          />
          <SmartOptionInput
            label="二级项目"
            value={draft.secondaryProject}
            options={options.projects}
            onChange={(secondaryProject) => onChange({ secondaryProject })}
            onCreateOption={(project) => onCreateOption({ project })}
          />
          <TextField
            label="开始时间"
            value={draft.startTime}
            onChange={(startTime) => onChange({ startTime })}
            onFocus={() => {
              if (!draft.startTime) {
                onChange({ startTime: formatLocalDateTimeInput(new Date()) })
              }
            }}
            type="datetime-local"
          />
          <TextField
            label="结束时间"
            value={draft.endTime}
            onChange={(endTime) => onChange({ endTime })}
            onFocus={() => {
              if (!draft.endTime) {
                onChange({ endTime: formatLocalDateTimeInput(new Date()) })
              }
            }}
            type="datetime-local"
          />
          <TextField label="工作量" value={draft.workload} onChange={(workload) => onChange({ workload })} type="number" />
          <SmartOptionInput
            label="工作量单位"
            value={draft.workloadUnit || selectedCategory?.defaultWorkloadUnit || ''}
            options={options.units}
            onChange={(workloadUnit) => onChange({ workloadUnit })}
            onCreateOption={(unit) => onCreateOption({ unit })}
          />
          <TextField label="状态分" value={draft.statusScore} onChange={(statusScore) => onChange({ statusScore })} type="number" />
          <TextField label="AI 赋能比例" value={draft.aiEnableRatio} onChange={(aiEnableRatio) => onChange({ aiEnableRatio })} type="number" />
          <TextField label="维度" value={draft.dimension} onChange={(dimension) => onChange({ dimension })} />
          <Field label="结果记录 / 备注">
            <textarea value={draft.resultNote} onChange={(event) => onChange({ resultNote: event.target.value })} rows={3} className={inputClass} />
          </Field>
        </div>
        <button type="button" onClick={onSave} className="mt-4 rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]">
          保存时间日志
        </button>
      </Panel>

      <Panel title="最近日志" eyebrow={`${logs.length} logs`}>
        <LogList logs={logs} onDelete={onDelete} />
      </Panel>
    </div>
  )
}

function DailyStatsView({ stats, selectedDate }: { stats: DailyTimeDebtStats; selectedDate: string }) {
  return (
    <Panel title="日度数据统计" eyebrow={selectedDate}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="日期" value={stats.date} />
        <Metric label="总记录数" value={String(stats.totalLogs)} />
        <Metric label="总时长" value={formatMinutes(stats.totalMinutes)} />
        <Metric label="工作时长" value={formatMinutes(stats.workMinutes)} />
        <Metric label="非工作时长" value={formatMinutes(stats.nonWorkMinutes)} />
        <Metric label="标准工时" value={formatMinutes(stats.standardWorkMinutes)} />
        <Metric label="工时差额" value={formatSignedMinutes(stats.workMinuteDelta)} />
        <Metric label="净时间价值" value={formatMoney(stats.netTimeValue)} />
        <Metric label="平均状态" value={stats.averageStatusScore?.toFixed(1) ?? '待补充'} />
        <Metric label="AI 平均赋能比例" value={typeof stats.averageAiEnableRatio === 'number' ? formatPercent(stats.averageAiEnableRatio) : '待补充'} />
      </div>
    </Panel>
  )
}

function DebtParamsView({
  params,
  draft,
  onChange,
  onSave
}: {
  params: TimeDebtParams
  draft: { annualIncome: string; effectiveWorkDays: string; averageWorkHoursPerDay: string; idealHourlyWage: string; note: string }
  onChange: (patch: Partial<typeof draft>) => void
  onSave: () => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel title="负债参数记录" eyebrow="Debt Params">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="年总收入" value={draft.annualIncome} onChange={(annualIncome) => onChange({ annualIncome })} type="number" />
          <TextField label="有效工作天数" value={draft.effectiveWorkDays} onChange={(effectiveWorkDays) => onChange({ effectiveWorkDays })} type="number" />
          <TextField label="日均工作时长" value={draft.averageWorkHoursPerDay} onChange={(averageWorkHoursPerDay) => onChange({ averageWorkHoursPerDay })} type="number" />
          <TextField label="理想时薪" value={draft.idealHourlyWage} onChange={(idealHourlyWage) => onChange({ idealHourlyWage })} type="number" />
          <Field label="备注">
            <textarea value={draft.note} onChange={(event) => onChange({ note: event.target.value })} rows={3} className={inputClass} />
          </Field>
        </div>
        <button type="button" onClick={onSave} className="mt-4 rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]">
          保存参数
        </button>
      </Panel>
      <Panel title="计算镜像层" eyebrow={String(params.year)}>
        <LineItem label="年工作时长" value={formatMinutes(params.annualWorkMinutes)} />
        <LineItem label="实际时间价值 / 分钟" value={formatMoney(params.realTimeValuePerMinute)} />
        <LineItem label="实际时间价值 / 小时" value={formatMoney(params.realTimeValuePerHour)} />
        <LineItem label="理想分薪 / 分钟" value={formatMoney(params.idealValuePerMinute)} />
      </Panel>
    </div>
  )
}

function WorkStandardView({
  standards,
  draft,
  onChange,
  onSave
}: {
  standards: WorkTimeStandard[]
  draft: StandardDraft
  onChange: (patch: Partial<StandardDraft>) => void
  onSave: () => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel title="工作时间标准" eyebrow="Work Time Standard">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="日期" value={draft.date} onChange={(date) => onChange({ date })} type="date" />
          <TextField label="标准工作时长" value={draft.standardWorkHours} onChange={(standardWorkHours) => onChange({ standardWorkHours })} type="number" />
          <Field label="备注">
            <textarea value={draft.note} onChange={(event) => onChange({ note: event.target.value })} rows={3} className={inputClass} />
          </Field>
        </div>
        <button type="button" onClick={onSave} className="mt-4 rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]">
          保存标准工时
        </button>
      </Panel>
      <Panel title="标准工时列表" eyebrow={`${standards.length} standards`}>
        {standards.length === 0 ? <Empty text="暂无自定义标准工时，默认按 8 小时计算。" /> : null}
        <div className="space-y-2">
          {standards.map((standard) => (
            <div key={standard.id} className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
              <LineItem label={standard.date} value={formatMinutes(standard.standardWorkMinutes)} />
              {standard.note ? <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{standard.note}</p> : null}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function DiagnosisView({ diagnosis, stats }: { diagnosis: TimeDebtDiagnosis; stats: DailyTimeDebtStats }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="仪表盘诊断" eyebrow="Dashboard / Diagnosis">
        <LineItem label="今日时间状态" value={timeDebtStatusLabels[diagnosis.status]} />
        <LineItem label="标准工时 vs 实际工时" value={`${formatMinutes(diagnosis.standardWorkMinutes)} / ${formatMinutes(diagnosis.actualWorkMinutes)}`} />
        <LineItem label="净时间价值" value={formatMoney(diagnosis.netTimeValue)} />
        <LineItem label="风险等级" value={diagnosis.riskLevel} />
        <p className="mt-4 text-sm leading-6 text-[color:var(--text-secondary)]">{diagnosis.summary}</p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{diagnosis.reason}</p>
        <p className="mt-3 text-sm font-medium text-[color:var(--text-primary)]">{diagnosis.suggestion}</p>
      </Panel>
      <Panel title="趋势占位" eyebrow="7 Days">
        <LineItem label="最近 7 天工作时长趋势" value="待接入图表" />
        <LineItem label="最近 7 天净时间价值趋势" value="待接入图表" />
        <LineItem label="今日总时长" value={formatMinutes(stats.totalMinutes)} />
        <LineItem label="今日总记录" value={String(stats.totalLogs)} />
      </Panel>
    </div>
  )
}

function StatusBadge({ overview }: { overview: TimeDebtOverview }) {
  const tone =
    overview.status === 'debt'
      ? 'border-rose-400/30 bg-rose-500/15 text-accent-rose'
      : overview.status === 'warning' || overview.status === 'empty'
        ? 'border-amber-400/25 bg-amber-400/10 text-accent-amber'
        : 'border-emerald-400/25 bg-emerald-400/10 text-accent-green'
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <div className="text-xs uppercase tracking-[0.18em] opacity-75">今日时间状态</div>
      <div className="mt-1 text-xl font-semibold">{overview.statusLabel}</div>
    </div>
  )
}

function LogList({ logs, onDelete }: { logs: TimeDebtLog[]; onDelete?: (logId: string) => void }) {
  if (logs.length === 0) {
    return <Empty text="暂无时间日志。" />
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{log.title}</div>
              <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                {log.primaryCategory} / {log.secondaryProject} / {formatMinutes(log.durationMinutes)}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
                <span>效率：{log.efficiencyText ?? '待补充'}</span>
                <span>状态加权：{formatNumber(log.statusWeightedMinutes ?? 0)}</span>
                <span>AI 化加权：{formatNumber(log.aiWeightedMinutes ?? 0)}</span>
                <span>价值：{log.valueJudgement ?? 'neutral'}</span>
              </div>
              {log.resultNote ? <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{log.resultNote}</p> : null}
            </div>
            {onDelete ? (
              <button type="button" onClick={() => onDelete(log.id)} className="rounded-xl border border-[color:var(--input-border)] px-2 py-1 text-xs text-[color:var(--text-muted)] transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-accent-rose">
                删除
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{eyebrow}</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const toneClass = {
    neutral: 'text-[color:var(--text-primary)]',
    good: 'text-accent-green',
    warn: 'text-accent-amber',
    bad: 'text-accent-rose'
  }[tone]
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  )
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--panel-border)] py-2 last:border-b-0">
      <span className="text-sm text-[color:var(--text-secondary)]">{label}</span>
      <span className="text-right text-sm font-medium text-[color:var(--text-primary)]">{value}</span>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-4 text-sm text-[color:var(--text-muted)]">{text}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-[color:var(--text-muted)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
  onFocus,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  type?: string
}) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} onFocus={onFocus} type={type} className={inputClass} />
    </Field>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

const inputClass =
  'w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]'

function createSampleLogDraft(): LogDraft {
  return {
    title: '优化单词突围完整词库，校对 1700 后缀',
    primaryCategory: '工作',
    secondaryProject: '单词突围考研版',
    startTime: `${sampleDate}T14:00`,
    endTime: `${sampleDate}T15:10`,
    workload: '295',
    workloadUnit: '个',
    statusScore: '7',
    aiEnableRatio: '0',
    dimension: '时间管理',
    resultNote: ''
  }
}

function optionalNumber(value: string): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function formatLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDisplayDateTime(value: string): string {
  if (!value) {
    return '待补充'
  }
  return value.replace('T', ' ')
}

function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${padDatePart(hours)}:${padDatePart(minutes)}:${padDatePart(seconds)}`
}

function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} min`
}

function formatSignedMinutes(minutes: number): string {
  return `${minutes >= 0 ? '+' : ''}${Math.round(minutes)} min`
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2
  }).format(value)
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2
  }).format(value)
}

export const timeDebtStorageLocation = {
  ...timeDebtStorageKeys,
  options: timeDebtOptionsStorageKey
}
