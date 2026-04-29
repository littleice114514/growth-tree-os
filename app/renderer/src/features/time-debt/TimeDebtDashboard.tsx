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
import {
  appendTimeDebtPlan,
  createTimeDebtPlan,
  loadTimeDebtPlans,
  timeDebtPlansStorageKey,
  updateTimeDebtPlan,
  type TimeDebtPlan
} from './timeDebtPlansStorage'
import {
  archiveTimePlanReminderBySource,
  consumeTimeDebtNavigationIntent,
  createTimePlanReminder,
  timePlanReminderStorageKeys,
  updateTimePlanReminderBySource,
  upsertTimePlanReminder
} from '@/features/reminders/timePlanReminderStorage'

type TimeDebtView = 'today' | 'timeline' | 'insights'
type EntryMode = 'timer' | 'manual' | 'plan'
type SettingsTab = 'standard' | 'params' | 'options'
type PlanReminderStatus = 'scheduled' | 'soon' | 'due' | 'missed'

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

type PlanDraft = {
  title: string
  primaryCategory: string
  secondaryProject: string
  plannedStartTime: string
  plannedEndTime: string
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
  planId?: string
  plannedStartTime?: string
  plannedEndTime?: string
  plannedDurationMinutes?: number
  suggestedEndTime?: string
}

type CalendarBlock = {
  id: string
  title: string
  primaryCategory: string
  secondaryProject: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: 'planned' | 'active' | 'completed' | 'missed'
  meta: string
  plan?: TimeDebtPlan
  leftPercent?: number
  widthPercent?: number
}

const today = new Date().toISOString().slice(0, 10)
const viewLabels: Record<TimeDebtView, string> = {
  today: '今日台',
  timeline: '时间轴',
  insights: '洞察'
}

export function TimeDebtDashboard() {
  const [logs, setLogs] = useState<TimeDebtLog[]>(() => loadTimeDebtLogs())
  const [plans, setPlans] = useState<TimeDebtPlan[]>(() => loadTimeDebtPlans())
  const [standards, setStandards] = useState<WorkTimeStandard[]>(() => loadWorkTimeStandards())
  const [params, setParams] = useState<TimeDebtParams>(() => loadTimeDebtParams())
  const [options, setOptions] = useState<TimeDebtOptions>(() => loadTimeDebtOptions())
  const [currentView, setCurrentView] = useState<TimeDebtView>('today')
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('standard')
  const [timelineDate, setTimelineDate] = useState(today)
  const [logDraft, setLogDraft] = useState<LogDraft>(() => createDefaultLogDraft())
  const [planDraft, setPlanDraft] = useState<PlanDraft>(() => createDefaultPlanDraft())
  const [runningTimer, setRunningTimer] = useState<RunningTimer | null>(null)
  const [manualSourcePlanId, setManualSourcePlanId] = useState<string | null>(null)
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | null>(null)
  const [timerNow, setTimerNow] = useState(() => Date.now())
  const [optionDraft, setOptionDraft] = useState({ category: '', project: '', unit: '' })
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
  const todayPlans = useMemo(
    () => plans.filter((plan) => plan.plannedStartTime.slice(0, 10) === selectedDate && plan.status !== 'completed' && plan.status !== 'abandoned'),
    [plans, selectedDate]
  )
  const todayLogs = useMemo(() => logs.filter((log) => log.startTime.slice(0, 10) === selectedDate), [logs, selectedDate])

  useEffect(() => {
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), runningTimer ? 1000 : 30000)
    return () => window.clearInterval(intervalId)
  }, [runningTimer])

  const persistLog = (draft: LogDraft): TimeDebtLog | null => {
    if (!draft.title.trim() || !draft.startTime || !draft.endTime || calculateDurationMinutes(draft.startTime, draft.endTime) <= 0) {
      return null
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
    rememberOptions(draft.primaryCategory, draft.secondaryProject, draft.workloadUnit)
    return log
  }

  const rememberOptions = (category: string, project: string, unit?: string) => {
    const nextOptions = upsertTimeDebtOptions(options, { category, project, unit })
    setOptions(nextOptions)
    saveTimeDebtOptions(nextOptions)
  }

  const openEntry = (mode: EntryMode, sourcePlan?: TimeDebtPlan) => {
    setManualSourcePlanId(mode === 'manual' && sourcePlan ? sourcePlan.id : null)
    if (mode === 'plan') {
      setPlanDraft(sourcePlan ? planToDraft(sourcePlan) : createDefaultPlanDraft())
    } else {
      setLogDraft(sourcePlan ? planToLogDraft(sourcePlan) : createDefaultLogDraft())
    }
    setEntryMode(mode)
  }

  const saveManualLog = () => {
    const log = persistLog(logDraft)
    if (log) {
      if (manualSourcePlanId) {
        setPlans(
          updateTimeDebtPlan(manualSourcePlanId, {
            status: 'completed',
            actualStartTime: log.startTime,
            actualEndTime: log.endTime,
            actualDurationMinutes: log.durationMinutes,
            completedLogId: log.id
          })
        )
        archiveTimePlanReminderBySource(manualSourcePlanId, 'completed')
        setManualSourcePlanId(null)
      }
      setEntryMode(null)
      setLogDraft(createDefaultLogDraft())
    }
  }

  const startTimer = (draft: LogDraft, planId?: string) => {
    if (!draft.title.trim() || runningTimer) {
      return
    }
    const now = new Date()
    const sourcePlan = planId ? plans.find((plan) => plan.id === planId) : undefined
    const startTime = planId ? formatLocalDateTimeInput(now) : draft.startTime || formatLocalDateTimeInput(now)
    const plannedDurationMinutes = sourcePlan?.plannedDurationMinutes || (sourcePlan ? calculateDurationMinutes(sourcePlan.plannedStartTime, sourcePlan.plannedEndTime) : undefined)
    const suggestedEndTime = plannedDurationMinutes ? formatLocalDateTimeInput(new Date(now.getTime() + plannedDurationMinutes * 60000)) : undefined
    const workloadUnit = draft.workloadUnit || 'min'
    setRunningTimer({
      title: draft.title.trim(),
      primaryCategory: draft.primaryCategory.trim(),
      secondaryProject: draft.secondaryProject.trim(),
      workloadUnit,
      startTime,
      startTimestampMs: now.getTime(),
      planId,
      plannedStartTime: sourcePlan?.plannedStartTime,
      plannedEndTime: sourcePlan?.plannedEndTime,
      plannedDurationMinutes,
      suggestedEndTime
    })
    setTimerNow(now.getTime())
    rememberOptions(draft.primaryCategory, draft.secondaryProject, workloadUnit)
    if (planId) {
      setPlans(updateTimeDebtPlan(planId, { status: 'active', actualStartTime: startTime, suggestedEndTime }))
      updateTimePlanReminderBySource(planId, { status: 'active' })
    }
    setEntryMode(null)
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
      ...createDefaultLogDraft(),
      title: runningTimer.title,
      primaryCategory: runningTimer.primaryCategory,
      secondaryProject: runningTimer.secondaryProject,
      startTime: runningTimer.startTime,
      endTime,
      workload: String(durationMinutes),
      workloadUnit: runningTimer.workloadUnit || 'min',
      resultNote: runningTimer.planId ? '由今日规划任务开始计时后生成。' : ''
    }
    const log = persistLog(nextDraft)
    if (log) {
      if (runningTimer.planId) {
        setPlans(
          updateTimeDebtPlan(runningTimer.planId, {
            status: 'completed',
            actualEndTime: endTime,
            actualDurationMinutes: durationMinutes,
            completedLogId: log.id
          })
        )
        archiveTimePlanReminderBySource(runningTimer.planId, 'completed')
      }
      setRunningTimer(null)
    }
  }

  const abandonPlan = (planId: string) => {
    setPlans(updateTimeDebtPlan(planId, { status: 'abandoned' }))
    archiveTimePlanReminderBySource(planId, 'dismissed')
  }

  const convertPlanToManualLog = (plan: TimeDebtPlan) => {
    setLogDraft(planToManualDraft(plan))
    setManualSourcePlanId(plan.id)
    setEntryMode('manual')
  }

  const savePlan = () => {
    if (!planDraft.title.trim() || !planDraft.plannedStartTime || !planDraft.plannedEndTime || calculateDurationMinutes(planDraft.plannedStartTime, planDraft.plannedEndTime) <= 0) {
      return
    }
    const nextPlan = createTimeDebtPlan(planDraft)
    setPlans(appendTimeDebtPlan(nextPlan))
    upsertTimePlanReminder(
      createTimePlanReminder({
        sourceId: nextPlan.id,
        title: nextPlan.title,
        plannedStart: nextPlan.plannedStartTime,
        plannedEnd: nextPlan.plannedEndTime,
        plannedDuration: nextPlan.plannedDurationMinutes,
        primaryCategory: nextPlan.primaryCategory,
        secondaryProject: nextPlan.secondaryProject
      })
    )
    rememberOptions(planDraft.primaryCategory, planDraft.secondaryProject)
    setPlanDraft(createDefaultPlanDraft())
    setEntryMode(null)
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

  const saveOptionDraft = () => {
    const nextOptions = upsertTimeDebtOptions(options, {
      category: optionDraft.category,
      project: optionDraft.project,
      unit: optionDraft.unit
    })
    setOptions(nextOptions)
    saveTimeDebtOptions(nextOptions)
    setOptionDraft({ category: '', project: '', unit: '' })
  }

  const removeLog = (logId: string) => {
    setLogs(deleteTimeDebtLog(logId))
  }

  useEffect(() => {
    const intent = consumeTimeDebtNavigationIntent()
    if (!intent) {
      return
    }
    const sourcePlan = plans.find((plan) => plan.id === intent.sourceId)
    if (!sourcePlan) {
      return
    }
    setCurrentView('today')
    setHighlightedPlanId(sourcePlan.id)
    if (intent.mode === 'start') {
      startTimer(planToLogDraft(sourcePlan), sourcePlan.id)
      return
    }
    if (intent.mode === 'manual') {
      convertPlanToManualLog(sourcePlan)
    }
  }, [])

  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--panel-border)] pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Time Debt</div>
            <h2 className="mt-2 text-2xl font-semibold">今日时间操作中心</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
              把记录、规划、计时、统计和诊断收拢到当天，先帮你判断现在该干嘛，今天干得怎么样，接下来怎么安排。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge overview={overview} />
            <button type="button" onClick={() => setSettingsOpen(true)} className={secondaryButtonClass}>
              时间标准设置
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {(Object.keys(viewLabels) as TimeDebtView[]).map((view) => (
            <button key={view} type="button" onClick={() => setCurrentView(view)} className={currentView === view ? activeTabClass : tabClass}>
              {viewLabels[view]}
            </button>
          ))}
        </nav>

        {currentView === 'today' ? (
          <TodayView
            overview={overview}
            diagnosis={diagnosis}
            logs={todayLogs}
            plans={todayPlans}
            runningTimer={runningTimer}
            timerNow={timerNow}
            highlightedPlanId={highlightedPlanId}
            onOpenEntry={openEntry}
            onStartPlan={(plan) => startTimer(planToLogDraft(plan), plan.id)}
            onConvertPlanToManual={convertPlanToManualLog}
            onAbandonPlan={abandonPlan}
            onFinishTimer={finishTimer}
          />
        ) : null}
        {currentView === 'timeline' ? (
          <TimelineView
            date={timelineDate}
            logs={logs}
            onDateChange={setTimelineDate}
            onOpenManual={() => openEntry('manual')}
            onDelete={removeLog}
          />
        ) : null}
        {currentView === 'insights' ? <InsightsView overview={overview} stats={stats} diagnosis={diagnosis} logs={todayLogs} /> : null}
      </div>

      {entryMode ? (
        <EntryModal
          mode={entryMode}
          logDraft={logDraft}
          planDraft={planDraft}
          options={options}
          runningTimer={runningTimer}
          onClose={() => {
            setEntryMode(null)
            setManualSourcePlanId(null)
          }}
          onLogChange={(patch) => setLogDraft((current) => ({ ...current, ...patch }))}
          onPlanChange={(patch) => setPlanDraft((current) => ({ ...current, ...patch }))}
          onCreateOption={(values) => {
            const nextOptions = upsertTimeDebtOptions(options, values)
            setOptions(nextOptions)
            saveTimeDebtOptions(nextOptions)
          }}
          onStartTimer={() => startTimer(logDraft)}
          onSaveManual={saveManualLog}
          onSavePlan={savePlan}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsModal
          activeTab={settingsTab}
          standards={standards}
          standardDraft={standardDraft}
          params={params}
          paramsDraft={paramsDraft}
          options={options}
          optionDraft={optionDraft}
          onClose={() => setSettingsOpen(false)}
          onTabChange={setSettingsTab}
          onStandardChange={(patch) => setStandardDraft((current) => ({ ...current, ...patch }))}
          onParamsChange={(patch) => setParamsDraft((current) => ({ ...current, ...patch }))}
          onOptionDraftChange={(patch) => setOptionDraft((current) => ({ ...current, ...patch }))}
          onSaveStandard={saveStandard}
          onSaveParams={saveParams}
          onSaveOption={saveOptionDraft}
        />
      ) : null}
    </main>
  )
}

function TodayView({
  overview,
  diagnosis,
  logs,
  plans,
  runningTimer,
  timerNow,
  highlightedPlanId,
  onOpenEntry,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer
}: {
  overview: TimeDebtOverview
  diagnosis: TimeDebtDiagnosis
  logs: TimeDebtLog[]
  plans: TimeDebtPlan[]
  runningTimer: RunningTimer | null
  timerNow: number
  highlightedPlanId: string | null
  onOpenEntry: (mode: EntryMode, sourcePlan?: TimeDebtPlan) => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: () => void
}) {
  return (
    <div className="grid min-h-[720px] gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <HealthStatusCard overview={overview} />
        <ActiveTimerWidget runningTimer={runningTimer} timerNow={timerNow} onOpenEntry={onOpenEntry} onFinishTimer={onFinishTimer} />
        <UpNextList
          plans={plans}
          timerNow={timerNow}
          onStartPlan={onStartPlan}
          onOpenPlan={(plan) => onOpenEntry('timer', plan)}
          onConvertPlanToManual={onConvertPlanToManual}
          onAbandonPlan={onAbandonPlan}
        />
        <Panel title="今日诊断微摘要" eyebrow="Time Doctor">
          <p className="text-sm leading-6 text-[color:var(--text-secondary)]">{diagnosis.summary}</p>
          <p className="mt-3 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 text-sm font-medium leading-6 text-[color:var(--text-primary)]">
            {diagnosis.suggestion}
          </p>
        </Panel>
      </div>
      <DailyCalendarView
        logs={logs}
        plans={plans}
        runningTimer={runningTimer}
        timerNow={timerNow}
        highlightedPlanId={highlightedPlanId}
        onStartPlan={onStartPlan}
        onConvertPlanToManual={onConvertPlanToManual}
        onAbandonPlan={onAbandonPlan}
      />
    </div>
  )
}

function HealthStatusCard({ overview }: { overview: TimeDebtOverview }) {
  return (
    <Panel title="今日状态" eyebrow={overview.date}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-[color:var(--text-primary)]">{overview.statusLabel}</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{overview.diagnosis}</p>
        </div>
        <div className={statusPillClass(overview.status)}>{overview.status === 'healthy' ? '健康' : overview.status === 'debt' ? '负债' : '关注'}</div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="净时间价值" value={formatMoney(overview.netTimeValue)} tone={overview.netTimeValue >= 0 ? 'good' : 'bad'} />
        <Metric label="工时差额" value={formatSignedMinutes(overview.workDeltaMinutes)} tone={overview.workDeltaMinutes >= 0 ? 'good' : 'warn'} />
        <Metric label="今日日志" value={`${overview.stats.totalLogs} 条`} />
        <Metric label="总记录时间" value={formatMinutes(overview.totalMinutes)} />
      </div>
    </Panel>
  )
}

function ActiveTimerWidget({
  runningTimer,
  timerNow,
  onOpenEntry,
  onFinishTimer
}: {
  runningTimer: RunningTimer | null
  timerNow: number
  onOpenEntry: (mode: EntryMode) => void
  onFinishTimer: () => void
}) {
  return (
    <Panel title="当前焦点" eyebrow="Now">
      {runningTimer ? (
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent-green">进行中</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--text-primary)]">{formatElapsedTime(timerNow - runningTimer.startTimestampMs)}</div>
          <div className="mt-3 text-base font-semibold text-[color:var(--text-primary)]">{runningTimer.title}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
            <span>{runningTimer.primaryCategory}</span>
            <span>/</span>
            <span>{runningTimer.secondaryProject}</span>
            <span>/</span>
            <span>实际开始 {formatTimeOnly(runningTimer.startTime)}</span>
          </div>
          {runningTimer.plannedStartTime && runningTimer.plannedEndTime ? (
            <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
              <div>原计划：{formatTimeOnly(runningTimer.plannedStartTime)} - {formatTimeOnly(runningTimer.plannedEndTime)}</div>
              <div>建议结束：{runningTimer.suggestedEndTime ? formatTimeOnly(runningTimer.suggestedEndTime) : '按实际结束计算'}</div>
            </div>
          ) : null}
          <button type="button" onClick={onFinishTimer} className={`mt-4 w-full ${primaryButtonClass}`}>
            结束计时并生成日志
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          <button type="button" onClick={() => onOpenEntry('timer')} className={primaryButtonClass}>
            开始计时
          </button>
          <button type="button" onClick={() => onOpenEntry('manual')} className={secondaryButtonClass}>
            补记时间
          </button>
          <button type="button" onClick={() => onOpenEntry('plan')} className={secondaryButtonClass}>
            规划任务
          </button>
        </div>
      )}
    </Panel>
  )
}

function UpNextList({
  plans,
  timerNow,
  onStartPlan,
  onOpenPlan,
  onConvertPlanToManual,
  onAbandonPlan
}: {
  plans: TimeDebtPlan[]
  timerNow: number
  onStartPlan: (plan: TimeDebtPlan) => void
  onOpenPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
}) {
  const planned = plans
    .filter((plan) => plan.status === 'planned')
    .sort((a, b) => reminderRank(resolvePlanReminderStatus(a, timerNow)) - reminderRank(resolvePlanReminderStatus(b, timerNow)) || a.plannedStartTime.localeCompare(b.plannedStartTime))
  return (
    <Panel title="今日待开始任务" eyebrow={`${planned.length} planned`}>
      {planned.length === 0 ? <Empty text="今天还没有待开始任务。先安排一个最小可执行的下一段时间块。" /> : null}
      <div className="space-y-3">
        {planned.slice(0, 5).map((plan) => (
          <div key={plan.id} className={`rounded-2xl border p-3 ${planReminderCardClass(resolvePlanReminderStatus(plan, timerNow))}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{plan.title}</div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${planReminderPillClass(resolvePlanReminderStatus(plan, timerNow))}`}>
                    {planReminder(plan, timerNow)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[color:var(--text-secondary)]">
                  {formatTimeOnly(plan.plannedStartTime)} - {formatTimeOnly(plan.plannedEndTime)} / {plan.primaryCategory}
                </div>
                <div className="mt-2 text-xs text-[color:var(--text-muted)]">{planReminderDetail(plan, timerNow)}</div>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <button type="button" onClick={() => onOpenPlan(plan)} className={tinyButtonClass}>
                  编辑后开始
                </button>
                <button type="button" onClick={() => onStartPlan(plan)} className={tinyPrimaryButtonClass}>
                  {resolvePlanReminderStatus(plan, timerNow) === 'missed' ? '现在开始' : '开始计时'}
                </button>
                {resolvePlanReminderStatus(plan, timerNow) === 'missed' ? (
                  <>
                    <button type="button" onClick={() => onConvertPlanToManual(plan)} className={tinyButtonClass}>
                      转为补记
                    </button>
                    <button type="button" onClick={() => onAbandonPlan(plan.id)} className={tinyButtonClass}>
                      放弃
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function DailyCalendarView({
  logs,
  plans,
  runningTimer,
  timerNow,
  highlightedPlanId,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan
}: {
  logs: TimeDebtLog[]
  plans: TimeDebtPlan[]
  runningTimer: RunningTimer | null
  timerNow: number
  highlightedPlanId: string | null
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(highlightedPlanId)
  const blocks = useMemo(() => buildCalendarBlocks(logs, plans, runningTimer, timerNow), [logs, plans, runningTimer, timerNow])
  useEffect(() => {
    if (highlightedPlanId) {
      setSelectedBlockId(highlightedPlanId)
    }
  }, [highlightedPlanId])
  return (
    <section className="min-w-0 rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Daily Calendar</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">今日时间日志表</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
          <Legend dotClass="border-dashed border-amber-400 bg-amber-400/10" label="Planned" />
          <Legend dotClass="border-emerald-400 bg-emerald-400/20" label="Active" />
          <Legend dotClass="border-cyan-400 bg-cyan-400/20" label="Completed" />
          <Legend dotClass="border-rose-400 bg-rose-400/10" label="Missed" />
        </div>
      </div>
      <div className="relative h-[1440px] overflow-hidden rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
        {Array.from({ length: 25 }, (_, hour) => (
          <div key={hour} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]" style={{ top: `${(hour / 24) * 100}%` }}>
            {hour < 24 ? <span className="absolute left-3 top-1 text-[11px] tabular-nums text-[color:var(--text-muted)]">{padDatePart(hour)}:00</span> : null}
          </div>
        ))}
        <div className="absolute bottom-0 left-[72px] top-0 w-px bg-[var(--panel-border)]" />
        {blocks.map((block) => (
          <CalendarBlockCard
            key={block.id}
            block={block}
            selected={selectedBlockId === block.id}
            onSelect={() => setSelectedBlockId((current) => (current === block.id ? null : block.id))}
            onStartPlan={onStartPlan}
            onConvertPlanToManual={onConvertPlanToManual}
            onAbandonPlan={onAbandonPlan}
          />
        ))}
        {blocks.length === 0 ? (
          <div className="absolute left-[92px] right-5 top-8 rounded-2xl border border-dashed border-[color:var(--panel-border)] p-5 text-sm text-[color:var(--text-muted)]">
            今天还没有时间块。先从左侧补记、规划或开始计时。
          </div>
        ) : null}
      </div>
    </section>
  )
}

function CalendarBlockCard({
  block,
  selected,
  onSelect,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan
}: {
  block: CalendarBlock
  selected: boolean
  onSelect: () => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
}) {
  const startMinute = minutesFromDateTime(block.startTime)
  const heightMinutes = Math.max(block.durationMinutes, 25)
  const widthFactor = (block.widthPercent ?? 100) / 100
  const leftFactor = (block.leftPercent ?? 0) / 100
  const style = {
    top: `${(startMinute / 1440) * 100}%`,
    height: `${(heightMinutes / 1440) * 100}%`,
    left: `calc(92px + (100% - 112px) * ${leftFactor})`,
    width: `calc((100% - 112px) * ${widthFactor})`
  }
  const blockClass =
    block.status === 'planned'
      ? 'border-dashed border-amber-400/45 bg-amber-400/10 text-[color:var(--text-primary)]'
      : block.status === 'active'
        ? 'border-emerald-400/45 bg-emerald-400/18 text-[color:var(--text-primary)] shadow-[0_12px_28px_rgba(16,185,129,0.14)]'
        : block.status === 'missed'
          ? 'border-rose-400/35 bg-rose-400/10 text-[color:var(--text-primary)]'
          : `${categoryBlockClass(block.primaryCategory)} text-[color:var(--text-primary)]`
  return (
    <div
      role="button"
      tabIndex={0}
      className={`absolute overflow-hidden rounded-2xl border px-3 py-2 text-left transition hover:z-20 hover:ring-1 hover:ring-white/20 ${selected ? 'z-30 ring-2 ring-[color:var(--node-selected-border)]' : ''} ${blockClass}`}
      style={style}
      title={`${block.title} / ${block.meta}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{block.title}</div>
          <div className="mt-1 truncate text-xs opacity-80">
            {formatTimeOnly(block.startTime)} - {formatTimeOnly(block.endTime)} / {block.primaryCategory} / {block.secondaryProject}
          </div>
          <div className="mt-1 text-[11px] opacity-70">{block.meta}</div>
        </div>
        {block.status === 'planned' && block.plan ? (
          <span className="rounded-full border border-amber-400/30 px-2 py-1 text-[10px] uppercase text-accent-amber">planned</span>
        ) : block.status === 'missed' ? (
          <span className="rounded-full border border-rose-400/30 px-2 py-1 text-[10px] uppercase text-accent-rose">missed</span>
        ) : (
          <span className="rounded-full border border-current/20 px-2 py-1 text-[10px] uppercase opacity-75">{block.status}</span>
        )}
      </div>
      {selected ? (
        <div className="mt-2 rounded-xl border border-current/15 bg-black/10 p-2 text-[11px] leading-5">
          <div>{blockDetail(block)}</div>
          {block.plan && (block.status === 'planned' || block.status === 'missed') ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  onStartPlan(block.plan as TimeDebtPlan)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    onStartPlan(block.plan as TimeDebtPlan)
                  }
                }}
                className={tinyPrimaryButtonClass}
              >
                开始计时
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  onConvertPlanToManual(block.plan as TimeDebtPlan)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    onConvertPlanToManual(block.plan as TimeDebtPlan)
                  }
                }}
                className={tinyButtonClass}
              >
                转为补记
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  onAbandonPlan((block.plan as TimeDebtPlan).id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    onAbandonPlan((block.plan as TimeDebtPlan).id)
                  }
                }}
                className={tinyButtonClass}
              >
                忽略
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TimelineView({
  date,
  logs,
  onDateChange,
  onOpenManual,
  onDelete
}: {
  date: string
  logs: TimeDebtLog[]
  onDateChange: (date: string) => void
  onOpenManual: () => void
  onDelete: (logId: string) => void
}) {
  const dayLogs = logs.filter((log) => log.startTime.slice(0, 10) === date).sort((a, b) => a.startTime.localeCompare(b.startTime))
  return (
    <div className="grid gap-4 xl:grid-cols-[0.72fr_0.28fr]">
      <Panel title="时间账本" eyebrow={date}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TextField label="日期筛选" value={date} onChange={onDateChange} type="date" />
          <button type="button" onClick={onOpenManual} className={primaryButtonClass}>
            新增日志
          </button>
        </div>
        <div className="space-y-3">
          {dayLogs.length === 0 ? <Empty text="这一天还没有时间日志。" /> : null}
          {dayLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs tabular-nums text-[color:var(--text-muted)]">
                    {formatTimeOnly(log.startTime)} - {formatTimeOnly(log.endTime)}
                  </div>
                  <div className="mt-1 truncate text-base font-semibold text-[color:var(--text-primary)]">{log.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
                    <span>{log.primaryCategory}</span>
                    <span>/</span>
                    <span>{log.secondaryProject}</span>
                    <span>/</span>
                    <span>{formatMinutes(log.durationMinutes)}</span>
                    <span>/</span>
                    <span>状态 {typeof log.statusScore === 'number' ? log.statusScore : '待补'}</span>
                  </div>
                  {log.resultNote ? <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{log.resultNote}</p> : null}
                </div>
                <button type="button" onClick={() => onDelete(log.id)} className={tinyButtonClass}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="当日摘要" eyebrow="Ledger">
        <Metric label="日志数量" value={`${dayLogs.length} 条`} />
        <div className="mt-3">
          <Metric label="总记录时长" value={formatMinutes(sum(dayLogs.map((log) => log.durationMinutes)))} />
        </div>
        <p className="mt-4 text-sm leading-6 text-[color:var(--text-secondary)]">时间轴第一版保留日志增删能力，视觉上按时间账本阅读，为后续周/月视图留下入口。</p>
      </Panel>
    </div>
  )
}

function InsightsView({
  overview,
  stats,
  diagnosis,
  logs
}: {
  overview: TimeDebtOverview
  stats: DailyTimeDebtStats
  diagnosis: TimeDebtDiagnosis
  logs: TimeDebtLog[]
}) {
  const categoryRows = buildCategoryRows(logs)
  const maxCategoryMinutes = Math.max(...categoryRows.map((row) => row.minutes), 1)
  return (
    <div className="grid gap-4 xl:grid-cols-[0.58fr_0.42fr]">
      <Panel title="今日时间统计" eyebrow={stats.date}>
        <div className="space-y-3">
          {categoryRows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-4 text-xs">
                <span className="text-[color:var(--text-secondary)]">{row.label}</span>
                <span className="tabular-nums text-[color:var(--text-muted)]">{formatMinutes(row.minutes)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--control-bg)]">
                <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.max(4, (row.minutes / maxCategoryMinutes) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="标准工时" value={formatMinutes(stats.standardWorkMinutes)} />
          <Metric label="实际工时" value={formatMinutes(stats.workMinutes)} />
          <Metric label="工时差额" value={formatSignedMinutes(stats.workMinuteDelta)} tone={stats.workMinuteDelta >= 0 ? 'good' : 'warn'} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="总记录数" value={`${stats.totalLogs}`} />
          <Metric label="总时长" value={formatMinutes(stats.totalMinutes)} />
          <Metric label="平均状态" value={stats.averageStatusScore?.toFixed(1) ?? '待补'} />
          <Metric label="AI 赋能" value={typeof stats.averageAiEnableRatio === 'number' ? formatPercent(stats.averageAiEnableRatio) : '待补'} />
          <Metric label="净时间价值" value={formatMoney(stats.netTimeValue)} tone={stats.netTimeValue >= 0 ? 'good' : 'bad'} />
        </div>
      </Panel>
      <Panel title="时间健康医生" eyebrow={timeDebtStatusLabels[diagnosis.status]}>
        <DoctorCard title="结论" value={diagnosis.title} detail={diagnosis.summary} tone={diagnosisTone(diagnosis)} />
        <DoctorCard title="原因" value={formatDiagnosisReason(overview, diagnosis)} detail={diagnosis.reason} />
        <DoctorCard title="行动建议" value={diagnosis.suggestion} detail={`风险等级：${diagnosis.riskLevel} / 净时间价值：${formatMoney(diagnosis.netTimeValue)}`} />
      </Panel>
    </div>
  )
}

function EntryModal({
  mode,
  logDraft,
  planDraft,
  options,
  runningTimer,
  onClose,
  onLogChange,
  onPlanChange,
  onCreateOption,
  onStartTimer,
  onSaveManual,
  onSavePlan
}: {
  mode: EntryMode
  logDraft: LogDraft
  planDraft: PlanDraft
  options: TimeDebtOptions
  runningTimer: RunningTimer | null
  onClose: () => void
  onLogChange: (patch: Partial<LogDraft>) => void
  onPlanChange: (patch: Partial<PlanDraft>) => void
  onCreateOption: (values: { category?: string; project?: string; unit?: string }) => void
  onStartTimer: () => void
  onSaveManual: () => void
  onSavePlan: () => void
}) {
  const title = mode === 'timer' ? '开始计时' : mode === 'manual' ? '补记时间' : '规划任务'
  return (
    <Modal title={title} eyebrow="Time Entry" onClose={onClose}>
      {mode === 'plan' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="任务名" value={planDraft.title} onChange={(title) => onPlanChange({ title })} />
          <CategorySelect
            value={`${planDraft.primaryCategory}::${planDraft.secondaryProject}`}
            onChange={(primaryCategory, secondaryProject) => onPlanChange({ primaryCategory, secondaryProject })}
          />
          <SmartOptionInput label="一级分类" value={planDraft.primaryCategory} options={options.categories} onChange={(primaryCategory) => onPlanChange({ primaryCategory })} onCreateOption={(category) => onCreateOption({ category })} />
          <SmartOptionInput label="二级项目" value={planDraft.secondaryProject} options={options.projects} onChange={(secondaryProject) => onPlanChange({ secondaryProject })} onCreateOption={(project) => onCreateOption({ project })} />
          <TextField label="计划开始" value={planDraft.plannedStartTime} onChange={(plannedStartTime) => onPlanChange({ plannedStartTime })} type="datetime-local" />
          <TextField label="计划结束" value={planDraft.plannedEndTime} onChange={(plannedEndTime) => onPlanChange({ plannedEndTime })} type="datetime-local" />
          <div className="md:col-span-2">
            <button type="button" onClick={onSavePlan} className={primaryButtonClass}>
              保存计划任务
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="任务名" value={logDraft.title} onChange={(title) => onLogChange({ title })} />
          <CategorySelect
            value={`${logDraft.primaryCategory}::${logDraft.secondaryProject}`}
            onChange={(primaryCategory, secondaryProject, category) =>
              onLogChange({
                primaryCategory,
                secondaryProject,
                workloadUnit: category?.defaultWorkloadUnit ?? logDraft.workloadUnit,
                dimension: category?.dimension ?? logDraft.dimension
              })
            }
          />
          <SmartOptionInput label="一级分类" value={logDraft.primaryCategory} options={options.categories} onChange={(primaryCategory) => onLogChange({ primaryCategory })} onCreateOption={(category) => onCreateOption({ category })} />
          <SmartOptionInput label="二级项目" value={logDraft.secondaryProject} options={options.projects} onChange={(secondaryProject) => onLogChange({ secondaryProject })} onCreateOption={(project) => onCreateOption({ project })} />
          {mode === 'manual' ? (
            <>
              <TextField label="开始时间" value={logDraft.startTime} onChange={(startTime) => onLogChange({ startTime })} type="datetime-local" />
              <TextField label="结束时间" value={logDraft.endTime} onChange={(endTime) => onLogChange({ endTime })} type="datetime-local" />
              <TextField label="工作量" value={logDraft.workload} onChange={(workload) => onLogChange({ workload })} type="number" />
              <SmartOptionInput label="工作量单位" value={logDraft.workloadUnit} options={options.units} onChange={(workloadUnit) => onLogChange({ workloadUnit })} onCreateOption={(unit) => onCreateOption({ unit })} />
              <TextField label="状态分" value={logDraft.statusScore} onChange={(statusScore) => onLogChange({ statusScore })} type="number" />
              <TextField label="AI 赋能比例" value={logDraft.aiEnableRatio} onChange={(aiEnableRatio) => onLogChange({ aiEnableRatio })} type="number" />
              <Field label="结果记录 / 备注">
                <textarea value={logDraft.resultNote} onChange={(event) => onLogChange({ resultNote: event.target.value })} rows={3} className={inputClass} />
              </Field>
            </>
          ) : (
            <>
              <TextField label="开始时间" value={logDraft.startTime} onChange={(startTime) => onLogChange({ startTime })} type="datetime-local" />
              <SmartOptionInput label="工作量单位" value={logDraft.workloadUnit} options={options.units} onChange={(workloadUnit) => onLogChange({ workloadUnit })} onCreateOption={(unit) => onCreateOption({ unit })} />
              <p className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                确认后会进入计时中状态，并在今日时间日志表生成 Active 时间块。
              </p>
            </>
          )}
          <div className="md:col-span-2">
            <button type="button" disabled={mode === 'timer' && Boolean(runningTimer)} onClick={mode === 'timer' ? onStartTimer : onSaveManual} className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-45`}>
              {mode === 'timer' ? '确认并开始计时' : '保存补记日志'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function SettingsModal({
  activeTab,
  standards,
  standardDraft,
  params,
  paramsDraft,
  options,
  optionDraft,
  onClose,
  onTabChange,
  onStandardChange,
  onParamsChange,
  onOptionDraftChange,
  onSaveStandard,
  onSaveParams,
  onSaveOption
}: {
  activeTab: SettingsTab
  standards: WorkTimeStandard[]
  standardDraft: StandardDraft
  params: TimeDebtParams
  paramsDraft: { annualIncome: string; effectiveWorkDays: string; averageWorkHoursPerDay: string; idealHourlyWage: string; note: string }
  options: TimeDebtOptions
  optionDraft: { category: string; project: string; unit: string }
  onClose: () => void
  onTabChange: (tab: SettingsTab) => void
  onStandardChange: (patch: Partial<StandardDraft>) => void
  onParamsChange: (patch: Partial<typeof paramsDraft>) => void
  onOptionDraftChange: (patch: Partial<typeof optionDraft>) => void
  onSaveStandard: () => void
  onSaveParams: () => void
  onSaveOption: () => void
}) {
  const tabs: Array<[SettingsTab, string]> = [
    ['standard', '工作时间标准'],
    ['params', '时间负债参数'],
    ['options', '分类配置']
  ]
  return (
    <Modal title="时间标准设置" eyebrow="Rules" onClose={onClose} wide>
      <nav className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([tab, label]) => (
          <button key={tab} type="button" onClick={() => onTabChange(tab)} className={activeTab === tab ? activeTabClass : tabClass}>
            {label}
          </button>
        ))}
      </nav>
      {activeTab === 'standard' ? (
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="工作时间标准" eyebrow="Work Standard">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="日期" value={standardDraft.date} onChange={(date) => onStandardChange({ date })} type="date" />
              <TextField label="标准工作时长" value={standardDraft.standardWorkHours} onChange={(standardWorkHours) => onStandardChange({ standardWorkHours })} type="number" />
              <Field label="备注">
                <textarea value={standardDraft.note} onChange={(event) => onStandardChange({ note: event.target.value })} rows={3} className={inputClass} />
              </Field>
            </div>
            <button type="button" onClick={onSaveStandard} className={`mt-4 ${primaryButtonClass}`}>
              保存标准工时
            </button>
          </Panel>
          <Panel title="标准列表" eyebrow={`${standards.length} standards`}>
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
      ) : null}
      {activeTab === 'params' ? (
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="时间负债参数" eyebrow="Debt Params">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="年总收入" value={paramsDraft.annualIncome} onChange={(annualIncome) => onParamsChange({ annualIncome })} type="number" />
              <TextField label="有效工作天数" value={paramsDraft.effectiveWorkDays} onChange={(effectiveWorkDays) => onParamsChange({ effectiveWorkDays })} type="number" />
              <TextField label="日均工作时长" value={paramsDraft.averageWorkHoursPerDay} onChange={(averageWorkHoursPerDay) => onParamsChange({ averageWorkHoursPerDay })} type="number" />
              <TextField label="理想时薪" value={paramsDraft.idealHourlyWage} onChange={(idealHourlyWage) => onParamsChange({ idealHourlyWage })} type="number" />
              <Field label="备注">
                <textarea value={paramsDraft.note} onChange={(event) => onParamsChange({ note: event.target.value })} rows={3} className={inputClass} />
              </Field>
            </div>
            <button type="button" onClick={onSaveParams} className={`mt-4 ${primaryButtonClass}`}>
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
      ) : null}
      {activeTab === 'options' ? (
        <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <Panel title="新增常用配置" eyebrow="分类配置">
            <div className="grid gap-4">
              <TextField label="一级分类" value={optionDraft.category} onChange={(category) => onOptionDraftChange({ category })} />
              <TextField label="二级项目" value={optionDraft.project} onChange={(project) => onOptionDraftChange({ project })} />
              <TextField label="工作量单位" value={optionDraft.unit} onChange={(unit) => onOptionDraftChange({ unit })} />
            </div>
            <button type="button" onClick={onSaveOption} className={`mt-4 ${primaryButtonClass}`}>
              保存配置
            </button>
          </Panel>
          <Panel title="当前分类配置" eyebrow="Options">
            <OptionCloud title="一级分类" options={options.categories} />
            <OptionCloud title="二级项目" options={options.projects} />
            <OptionCloud title="工作量单位" options={options.units} />
          </Panel>
        </div>
      ) : null}
    </Modal>
  )
}

function Modal({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <section className={`max-h-[88vh] w-full overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{eyebrow}</div>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className={tinyButtonClass}>
            关闭
          </button>
        </div>
        {children}
      </section>
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

function DoctorCard({ title, value, detail, tone = 'neutral' }: { title: string; value: string; detail: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const toneClass = {
    neutral: 'border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]',
    good: 'border-emerald-400/25 bg-emerald-400/10',
    warn: 'border-amber-400/25 bg-amber-400/10',
    bad: 'border-rose-400/25 bg-rose-400/10'
  }[tone]
  return (
    <div className={`mb-3 rounded-2xl border p-4 last:mb-0 ${toneClass}`}>
      <div className="text-xs text-[color:var(--text-muted)]">{title}</div>
      <div className="mt-2 text-base font-semibold text-[color:var(--text-primary)]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{detail}</p>
    </div>
  )
}

function OptionCloud({ title, options }: { title: string; options: string[] }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 text-xs text-[color:var(--text-muted)]">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <span key={option} className="rounded-full border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-1 text-xs text-[color:var(--text-secondary)]">
            {option}
          </span>
        ))}
      </div>
    </div>
  )
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full border ${dotClass}`} />
      {label}
    </span>
  )
}

function CategorySelect({
  value,
  onChange
}: {
  value: string
  onChange: (primaryCategory: string, secondaryProject: string, category?: (typeof defaultProjectCategories)[number]) => void
}) {
  return (
    <SelectField
      label="一级分类 / 二级项目"
      value={value}
      onChange={(nextValue) => {
        const [primaryCategory, secondaryProject] = nextValue.split('::')
        const category = defaultProjectCategories.find((item) => item.primaryCategory === primaryCategory && item.secondaryProject === secondaryProject)
        onChange(primaryCategory, secondaryProject, category)
      }}
      options={defaultProjectCategories.map((category) => `${category.primaryCategory}::${category.secondaryProject}`)}
    />
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
  type = 'text'
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} className={inputClass} />
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

function StatusBadge({ overview }: { overview: TimeDebtOverview }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${statusToneClass(overview.status)}`}>
      <div className="text-xs uppercase tracking-[0.18em] opacity-75">今日时间状态</div>
      <div className="mt-1 text-xl font-semibold">{overview.statusLabel}</div>
    </div>
  )
}

function buildCalendarBlocks(logs: TimeDebtLog[], plans: TimeDebtPlan[], runningTimer: RunningTimer | null, timerNow: number): CalendarBlock[] {
  const completed: CalendarBlock[] = logs.map((log) => ({
    id: log.id,
    title: log.title,
    primaryCategory: log.primaryCategory,
    secondaryProject: log.secondaryProject,
    startTime: log.startTime,
    endTime: log.endTime,
    durationMinutes: Math.max(log.durationMinutes, calculateDurationMinutes(log.startTime, log.endTime)),
    status: 'completed',
    meta: `${formatMinutes(log.durationMinutes)} / ${log.workload ? `${log.workload}${log.workloadUnit ?? ''}` : '已完成'}`
  }))
  const planned: CalendarBlock[] = plans
    .filter((plan) => plan.status === 'planned')
    .map((plan) => {
      const reminderStatus = resolvePlanReminderStatus(plan, timerNow)
      return {
        id: plan.id,
        title: plan.title,
        primaryCategory: plan.primaryCategory,
        secondaryProject: plan.secondaryProject,
        startTime: plan.plannedStartTime,
        endTime: plan.plannedEndTime,
        durationMinutes: calculateDurationMinutes(plan.plannedStartTime, plan.plannedEndTime),
        status: reminderStatus === 'missed' ? 'missed' : 'planned',
        meta: `${planReminder(plan, timerNow)} / 计划 ${formatTimeOnly(plan.plannedStartTime)}-${formatTimeOnly(plan.plannedEndTime)}`,
        plan
      } satisfies CalendarBlock
    })
  const activePlans: CalendarBlock[] = plans
    .filter((plan) => plan.status === 'active' && plan.id !== runningTimer?.planId)
    .map((plan) => {
      const startTime = plan.actualStartTime || plan.plannedStartTime
      return {
        id: `${plan.id}-active`,
        title: plan.title,
        primaryCategory: plan.primaryCategory,
        secondaryProject: plan.secondaryProject,
        startTime,
        endTime: formatLocalDateTimeInput(new Date(timerNow)),
        durationMinutes: Math.max(1, calculateDurationMinutes(startTime, formatLocalDateTimeInput(new Date(timerNow)))),
        status: 'active',
        meta: `进行中 / 原计划 ${formatTimeOnly(plan.plannedStartTime)}-${formatTimeOnly(plan.plannedEndTime)} / 实际开始 ${formatTimeOnly(startTime)}`,
        plan
      } satisfies CalendarBlock
    })
  const active: CalendarBlock[] = runningTimer
    ? [
        {
          id: `active-${runningTimer.startTime}`,
          title: runningTimer.title,
          primaryCategory: runningTimer.primaryCategory,
          secondaryProject: runningTimer.secondaryProject,
          startTime: runningTimer.startTime,
          endTime: formatLocalDateTimeInput(new Date(timerNow)),
          durationMinutes: Math.max(1, Math.round((timerNow - runningTimer.startTimestampMs) / 60000)),
          status: 'active',
          meta: runningTimer.plannedStartTime
            ? `进行中 / 原计划 ${formatTimeOnly(runningTimer.plannedStartTime)}-${formatTimeOnly(runningTimer.plannedEndTime ?? '')} / 建议结束 ${runningTimer.suggestedEndTime ? formatTimeOnly(runningTimer.suggestedEndTime) : '--:--'}`
            : '进行中'
        }
      ]
    : []
  return applyOverlapLayout([...planned, ...activePlans, ...completed, ...active].sort((a, b) => a.startTime.localeCompare(b.startTime)))
}

function applyOverlapLayout(blocks: CalendarBlock[]): CalendarBlock[] {
  const positioned = blocks.map((block) => ({ ...block, leftPercent: 0, widthPercent: 100 }))
  for (let index = 0; index < positioned.length; index += 1) {
    const block = positioned[index]
    const overlappingIndexes = positioned
      .map((candidate, candidateIndex) => (blocksOverlap(block, candidate) ? candidateIndex : -1))
      .filter((candidateIndex) => candidateIndex >= 0)
    if (overlappingIndexes.length <= 1) {
      continue
    }
    const columnCount = Math.min(overlappingIndexes.length, 4)
    const widthPercent = Math.max(22, 96 / columnCount)
    const columnIndex = overlappingIndexes.indexOf(index) % columnCount
    positioned[index] = {
      ...block,
      leftPercent: columnIndex * (100 / columnCount),
      widthPercent
    }
  }
  return positioned
}

function blocksOverlap(first: CalendarBlock, second: CalendarBlock): boolean {
  const firstStart = minutesFromDateTime(first.startTime)
  const firstEnd = firstStart + Math.max(first.durationMinutes, 1)
  const secondStart = minutesFromDateTime(second.startTime)
  const secondEnd = secondStart + Math.max(second.durationMinutes, 1)
  return firstStart < secondEnd && secondStart < firstEnd
}

function blockDetail(block: CalendarBlock): string {
  if (block.status === 'active') {
    return `实际开始 ${formatTimeOnly(block.startTime)}，当前已记录 ${formatMinutes(block.durationMinutes)}。`
  }
  if (block.status === 'completed') {
    return `实际时间 ${formatTimeOnly(block.startTime)} - ${formatTimeOnly(block.endTime)}，实际时长 ${formatMinutes(block.durationMinutes)}。`
  }
  if (block.status === 'missed') {
    return `原计划 ${formatTimeOnly(block.startTime)} - ${formatTimeOnly(block.endTime)}，已错过，可转为补记或忽略。`
  }
  return `原计划 ${formatTimeOnly(block.startTime)} - ${formatTimeOnly(block.endTime)}，开始后会保留计划时间并写入真实开始。`
}

function buildCategoryRows(logs: TimeDebtLog[]): Array<{ label: string; minutes: number; color: string }> {
  const rows = [
    { label: '工作', minutes: 0, color: 'bg-cyan-300/80' },
    { label: '学习', minutes: 0, color: 'bg-emerald-300/80' },
    { label: '运动', minutes: 0, color: 'bg-lime-300/75' },
    { label: '生活', minutes: 0, color: 'bg-sky-300/75' },
    { label: '娱乐', minutes: 0, color: 'bg-violet-300/70' },
    { label: '空转', minutes: 0, color: 'bg-slate-300/75' },
    { label: '其他', minutes: 0, color: 'bg-zinc-300/70' }
  ]
  for (const log of logs) {
    const bucket = resolveCategoryLabel(log)
    const row = rows.find((item) => item.label === bucket) ?? rows[rows.length - 1]
    row.minutes += log.durationMinutes
  }
  return rows
}

function resolveCategoryLabel(log: TimeDebtLog): string {
  const text = `${log.primaryCategory} ${log.secondaryProject} ${log.title}`.toLowerCase()
  if (containsAny(text, ['工作'])) return '工作'
  if (containsAny(text, ['学习'])) return '学习'
  if (containsAny(text, ['运动', 'exercise', 'sport'])) return '运动'
  if (containsAny(text, ['生活', '恢复', '睡眠', '休息'])) return '生活'
  if (containsAny(text, ['娱乐', '游戏', '视频'])) return '娱乐'
  if (containsAny(text, ['空转', 'idle', '失控', '刷'])) return '空转'
  return '其他'
}

function createDefaultLogDraft(): LogDraft {
  const start = new Date()
  const end = new Date(start.getTime() + 30 * 60000)
  return {
    title: '',
    primaryCategory: '工作',
    secondaryProject: 'growth-tree-os',
    startTime: formatLocalDateTimeInput(start),
    endTime: formatLocalDateTimeInput(end),
    workload: '',
    workloadUnit: 'min',
    statusScore: '',
    aiEnableRatio: '',
    dimension: '时间管理',
    resultNote: ''
  }
}

function createDefaultPlanDraft(): PlanDraft {
  const start = new Date()
  start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30, 0, 0)
  const end = new Date(start.getTime() + 60 * 60000)
  return {
    title: '',
    primaryCategory: '工作',
    secondaryProject: 'growth-tree-os',
    plannedStartTime: formatLocalDateTimeInput(start),
    plannedEndTime: formatLocalDateTimeInput(end)
  }
}

function planToDraft(plan: TimeDebtPlan): PlanDraft {
  return {
    title: plan.title,
    primaryCategory: plan.primaryCategory,
    secondaryProject: plan.secondaryProject,
    plannedStartTime: plan.plannedStartTime,
    plannedEndTime: plan.plannedEndTime
  }
}

function planToLogDraft(plan: TimeDebtPlan): LogDraft {
  return {
    ...createDefaultLogDraft(),
    title: plan.title,
    primaryCategory: plan.primaryCategory,
    secondaryProject: plan.secondaryProject,
    startTime: formatLocalDateTimeInput(new Date()),
    endTime: '',
    resultNote: '由今日计划任务启动。'
  }
}

function planToManualDraft(plan: TimeDebtPlan): LogDraft {
  return {
    ...createDefaultLogDraft(),
    title: plan.title,
    primaryCategory: plan.primaryCategory,
    secondaryProject: plan.secondaryProject,
    startTime: plan.plannedStartTime,
    endTime: plan.plannedEndTime,
    workload: String(plan.plannedDurationMinutes || calculateDurationMinutes(plan.plannedStartTime, plan.plannedEndTime)),
    resultNote: '由错过的计划任务转为补记。'
  }
}

function resolvePlanReminderStatus(plan: TimeDebtPlan, nowMs: number): PlanReminderStatus {
  const start = new Date(plan.plannedStartTime).getTime()
  const end = new Date(plan.plannedEndTime).getTime()
  const delta = Math.round((start - nowMs) / 60000)
  if (nowMs > end) return 'missed'
  if (nowMs >= start) return 'due'
  if (delta <= 10) return 'soon'
  return 'scheduled'
}

function planReminder(plan: TimeDebtPlan, nowMs: number): string {
  const status = resolvePlanReminderStatus(plan, nowMs)
  if (status === 'missed') return '已错过'
  if (status === 'due') return '已到点'
  if (status === 'soon') return '即将开始'
  return '计划中'
}

function planReminderDetail(plan: TimeDebtPlan, nowMs: number): string {
  const status = resolvePlanReminderStatus(plan, nowMs)
  const start = new Date(plan.plannedStartTime).getTime()
  const end = new Date(plan.plannedEndTime).getTime()
  if (status === 'missed') return `计划已过 ${formatRelativeMinutes(nowMs - end)}，可现在开始、转为补记或放弃。`
  if (status === 'due') return '计划时间已到，点击开始计时后会记录真实开始时间。'
  if (status === 'soon') return `距离开始还有 ${formatRelativeMinutes(start - nowMs)}。`
  return `距离开始还有 ${formatRelativeMinutes(start - nowMs)}。`
}

function reminderRank(status: PlanReminderStatus): number {
  return {
    due: 0,
    soon: 1,
    missed: 2,
    scheduled: 3
  }[status]
}

function planReminderCardClass(status: PlanReminderStatus): string {
  return {
    scheduled: 'border-dashed border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]',
    soon: 'border-amber-400/25 bg-amber-400/10',
    due: 'border-emerald-400/35 bg-emerald-400/12 shadow-[0_14px_30px_rgba(16,185,129,0.10)]',
    missed: 'border-rose-400/25 bg-rose-400/10'
  }[status]
}

function planReminderPillClass(status: PlanReminderStatus): string {
  return {
    scheduled: 'border-[color:var(--panel-border)] text-[color:var(--text-muted)]',
    soon: 'border-amber-400/30 text-accent-amber',
    due: 'border-emerald-400/35 text-accent-green',
    missed: 'border-rose-400/30 text-accent-rose'
  }[status]
}

function formatRelativeMinutes(milliseconds: number): string {
  const totalMinutes = Math.max(1, Math.round(Math.abs(milliseconds) / 60000))
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`
  }
  return `${totalMinutes} 分钟`
}

function minutesFromDateTime(value: string): number {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 0
  }
  return date.getHours() * 60 + date.getMinutes()
}

function optionalNumber(value: string): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && value.trim() ? numberValue : undefined
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

function formatTimeOnly(value: string): string {
  if (!value) {
    return '--:--'
  }
  return value.slice(11, 16)
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

function formatDiagnosisReason(overview: TimeDebtOverview, diagnosis: TimeDebtDiagnosis): string {
  if (overview.stats.totalLogs === 0) {
    return '今日记录不足'
  }
  if (diagnosis.netTimeValue < 0) {
    return '净时间价值为负'
  }
  if (diagnosis.workMinuteDelta < 0) {
    return '实际工时低于标准'
  }
  return '时间结构相对稳定'
}

function diagnosisTone(diagnosis: TimeDebtDiagnosis): 'good' | 'warn' | 'bad' {
  if (diagnosis.riskLevel === 'high') return 'bad'
  if (diagnosis.riskLevel === 'medium') return 'warn'
  return 'good'
}

function categoryBlockClass(category: string): string {
  if (category.includes('工作')) return 'border-cyan-400/30 bg-cyan-400/12'
  if (category.includes('学习')) return 'border-emerald-400/30 bg-emerald-400/12'
  if (category.includes('运动')) return 'border-lime-400/30 bg-lime-400/12'
  if (category.includes('生活') || category.includes('恢复')) return 'border-sky-400/30 bg-sky-400/12'
  if (category.includes('空转')) return 'border-slate-400/30 bg-slate-400/12'
  return 'border-violet-400/25 bg-violet-400/10'
}

function statusToneClass(status: TimeDebtOverview['status']): string {
  if (status === 'debt') return 'border-rose-400/30 bg-rose-500/15 text-accent-rose'
  if (status === 'warning' || status === 'empty') return 'border-amber-400/25 bg-amber-400/10 text-accent-amber'
  return 'border-emerald-400/25 bg-emerald-400/10 text-accent-green'
}

function statusPillClass(status: TimeDebtOverview['status']): string {
  return `shrink-0 rounded-full border px-3 py-1 text-xs ${statusToneClass(status)}`
}

function containsAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern))
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

const inputClass =
  'w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]'

const primaryButtonClass =
  'rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]'
const secondaryButtonClass =
  'rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
const tinyButtonClass =
  'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
const tinyPrimaryButtonClass =
  'rounded-xl bg-[var(--button-bg)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]'
const tabClass =
  'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
const activeTabClass =
  'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'

export const timeDebtStorageLocation = {
  ...timeDebtStorageKeys,
  options: timeDebtOptionsStorageKey,
  plans: timeDebtPlansStorageKey,
  timePlanReminders: timePlanReminderStorageKeys.reminders,
  navigationIntent: timePlanReminderStorageKeys.navigationIntent
}
