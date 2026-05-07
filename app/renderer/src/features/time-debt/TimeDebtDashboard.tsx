import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  saveTimeDebtLogs,
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
  clearActiveTimeDebtTimer,
  createActiveTimeDebtTimer,
  loadActiveTimeDebtTimer,
  saveActiveTimeDebtTimer,
  timeDebtActiveTimerStorageKey
} from './timeDebtActiveTimerStorage'
import {
  archiveTimePlanReminderBySource,
  consumeTimeDebtNavigationIntent,
  createTimePlanReminder,
  timePlanReminderStorageKeys,
  updateTimePlanReminderBySource,
  upsertTimePlanReminder
} from '@/features/reminders/timePlanReminderStorage'
import { timeDebtFieldConfigs, timeDebtReservedFieldTypes, timeDebtSupportedFieldTypes } from './timeDebtFieldConfig'
import { CalendarViewShell } from './calendar/CalendarViewShell'
import type { CalendarBlock, CalendarViewMode } from './calendar/calendarTypes'
import { layoutOverlappingEvents } from './calendar/calendarOverlapLayoutUtils'

type TimeDebtView = 'today' | 'timeline' | 'insights'
type EntryMode = 'timer' | 'manual' | 'plan'
type SettingsTab = 'standard' | 'params'
type PlanReminderStatus = 'scheduled' | 'soon' | 'due' | 'missed'

type LogDraft = {
  title: string
  primaryCategory: string
  secondaryProject: string
  startTime: string
  endTime: string
  statusScore: string
  aiEnableRatio: string
  tags: string
  distractionSource: string
  dimension: string
  resultNote: string
}

type PlanDraft = {
  title: string
  primaryCategory: string
  secondaryProject: string
  plannedStartTime: string
  plannedEndTime: string
  tags: string
  note: string
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
  startTime: string
  startTimestampMs: number
  aiEnableRatio?: number
  tags?: string[]
  resultNote?: string
  planId?: string
  plannedStartTime?: string
  plannedEndTime?: string
  plannedDurationMinutes?: number
  suggestedEndTime?: string
}

type TaskHistoryOption = {
  title: string
  primaryCategory: string
  secondaryProject: string
  tags?: string[]
  aiEnableRatio?: number
  lastUsedAt: string
  useCount: number
}

const today = new Date().toISOString().slice(0, 10)
const viewLabels: Record<TimeDebtView, string> = {
  today: '执行台',
  timeline: '日历',
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
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('week')
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(today)
  const [customDayCount, setCustomDayCount] = useState(3)
  const [logDraft, setLogDraft] = useState<LogDraft>(() => createDefaultLogDraft())
  const [planDraft, setPlanDraft] = useState<PlanDraft>(() => createDefaultPlanDraft())
  const [runningTimer, setRunningTimer] = useState<RunningTimer | null>(() => activeTimerToRunningTimer(loadActiveTimeDebtTimer()))
  const [manualSourcePlanId, setManualSourcePlanId] = useState<string | null>(null)
  const [highlightedPlanId, setHighlightedPlanId] = useState<string | null>(null)
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
  const todayPlans = useMemo(
    () => plans.filter((plan) => plan.plannedStartTime.slice(0, 10) === selectedDate && plan.status !== 'completed' && plan.status !== 'abandoned'),
    [plans, selectedDate]
  )
  const todayLogs = useMemo(() => logs.filter((log) => log.startTime.slice(0, 10) === selectedDate), [logs, selectedDate])
  const calendarBlocks = useMemo(() => buildCalendarBlocks(logs, plans, runningTimer, timerNow), [logs, plans, runningTimer, timerNow])
  const taskHistoryOptions = useMemo(() => buildTaskHistoryOptions(logs, plans), [logs, plans])

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
        workload: undefined,
        workloadUnit: undefined,
        statusScore: optionalNumber(draft.statusScore),
        aiEnableRatio: optionalPercentNumber(draft.aiEnableRatio),
        tags: parseTagInput(draft.tags),
        distractionSource: draft.distractionSource,
        dimension: draft.dimension,
        resultNote: draft.resultNote
      },
      params
    )
    setLogs(appendTimeDebtLog(log))
    rememberOptions(draft.primaryCategory, draft.secondaryProject, parseTagInput(draft.tags), draft.distractionSource)
    return log
  }

  const rememberOptions = (category: string, project: string, tags?: string[], distraction?: string) => {
    const nextOptions = upsertTimeDebtOptions(options, { category, project, tags, distraction })
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
    if (sourcePlan && !canStartPlan(sourcePlan, now.getTime())) {
      setHighlightedPlanId(sourcePlan.id)
      return
    }
    const startTime = planId ? formatLocalDateTimeInput(now) : draft.startTime || formatLocalDateTimeInput(now)
    const plannedDurationMinutes = sourcePlan?.plannedDurationMinutes || (sourcePlan ? calculateDurationMinutes(sourcePlan.plannedStartTime, sourcePlan.plannedEndTime) : undefined)
    const suggestedEndTime = plannedDurationMinutes ? formatLocalDateTimeInput(new Date(now.getTime() + plannedDurationMinutes * 60000)) : undefined
    const aiEnableRatio = optionalPercentNumber(draft.aiEnableRatio)
    const tags = parseTagInput(draft.tags)
    const nextTimer = {
      title: draft.title.trim(),
      primaryCategory: draft.primaryCategory.trim(),
      secondaryProject: draft.secondaryProject.trim(),
      startTime,
      startTimestampMs: now.getTime(),
      aiEnableRatio,
      tags,
      resultNote: draft.resultNote.trim() || undefined,
      planId,
      plannedStartTime: sourcePlan?.plannedStartTime,
      plannedEndTime: sourcePlan?.plannedEndTime,
      plannedDurationMinutes,
      suggestedEndTime
    }
    setRunningTimer(nextTimer)
    saveActiveTimeDebtTimer(
      createActiveTimeDebtTimer({
        title: nextTimer.title,
        primaryCategory: nextTimer.primaryCategory,
        secondaryProject: nextTimer.secondaryProject,
        actualStart: nextTimer.startTime,
        startTimestampMs: nextTimer.startTimestampMs,
        sourcePlanId: planId,
        plannedStart: nextTimer.plannedStartTime,
        plannedEnd: nextTimer.plannedEndTime,
        plannedDuration: nextTimer.plannedDurationMinutes,
        suggestedEnd: nextTimer.suggestedEndTime,
        aiEnableRatio: nextTimer.aiEnableRatio,
        tags: nextTimer.tags,
        resultNote: nextTimer.resultNote
      })
    )
    setTimerNow(now.getTime())
    rememberOptions(draft.primaryCategory, draft.secondaryProject, tags)
    if (planId) {
      setPlans(updateTimeDebtPlan(planId, { status: 'active', actualStartTime: startTime, suggestedEndTime }))
      updateTimePlanReminderBySource(planId, { status: 'active' })
    }
    setEntryMode(null)
  }

  const finishTimer = (targetBlock?: CalendarBlock | null) => {
    if (!runningTimer) {
      if (targetBlock?.status === 'active' && targetBlock.plan) {
        finishActivePlan(targetBlock.plan)
      }
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
      aiEnableRatio: String(runningTimer.aiEnableRatio ?? 0),
      tags: formatTags(runningTimer.tags),
      resultNote: runningTimer.resultNote ?? (runningTimer.planId ? '由今日规划任务开始计时后生成。' : '')
    }
    const log = persistLog(nextDraft)
    if (log) {
      if (runningTimer.planId) {
        setPlans(
          updateTimeDebtPlan(runningTimer.planId, {
            status: 'completed',
            actualStartTime: runningTimer.startTime,
            actualEndTime: endTime,
            actualDurationMinutes: durationMinutes,
            completedLogId: log.id
          })
        )
        archiveTimePlanReminderBySource(runningTimer.planId, 'completed')
      }
      setRunningTimer(null)
      clearActiveTimeDebtTimer()
    }
  }

  const finishActivePlan = (plan: TimeDebtPlan) => {
    const actualStartTime = plan.actualStartTime || plan.plannedStartTime
    const now = new Date()
    const minimumEndTimestamp = new Date(actualStartTime).getTime() + 60000
    const endDate = new Date(Math.max(now.getTime(), Number.isFinite(minimumEndTimestamp) ? minimumEndTimestamp : now.getTime()))
    const actualEndTime = formatLocalDateTimeInput(endDate)
    const actualDurationMinutes = Math.max(1, calculateDurationMinutes(actualStartTime, actualEndTime))
    const log = createTimeDebtLog(
      {
        title: plan.title,
        primaryCategory: plan.primaryCategory,
        secondaryProject: plan.secondaryProject,
        startTime: actualStartTime,
        endTime: actualEndTime,
        tags: plan.tags,
        resultNote: plan.note || '由进行中的计划任务结束计时后生成。'
      },
      params
    )
    setLogs(appendTimeDebtLog(log))
    setPlans(
      updateTimeDebtPlan(plan.id, {
        status: 'completed',
        actualStartTime,
        actualEndTime,
        actualDurationMinutes,
        completedLogId: log.id
      })
    )
    archiveTimePlanReminderBySource(plan.id, 'completed')
    if (!runningTimer || runningTimer.planId === plan.id) {
      setRunningTimer(null)
      clearActiveTimeDebtTimer()
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
    const planTags = parseTagInput(planDraft.tags)
    const nextPlan = createTimeDebtPlan({ ...planDraft, tags: planTags })
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
    rememberOptions(planDraft.primaryCategory, planDraft.secondaryProject, planTags)
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

  const removeLog = (logId: string) => {
    setLogs(deleteTimeDebtLog(logId))
  }

  const moveCalendarBlock = useCallback(
    (blockId: string, nextStartTime: string, nextEndTime: string) => {
      const nextDuration = calculateDurationMinutes(nextStartTime, nextEndTime)
      if (nextDuration <= 0) {
        return
      }
      const logToMove = logs.find((log) => log.id === blockId)
      if (logToMove) {
        const nextLogs = logs.map((log) =>
          log.id === blockId
            ? {
                ...log,
                startTime: nextStartTime,
                endTime: nextEndTime,
                durationMinutes: nextDuration
              }
            : log
        )
        saveTimeDebtLogs(nextLogs)
        setLogs(nextLogs)
        return
      }

      const planToMove = plans.find((plan) => plan.id === blockId && plan.status === 'planned')
      if (!planToMove) {
        return
      }
      const nextPlans = updateTimeDebtPlan(blockId, {
        plannedStartTime: nextStartTime,
        plannedEndTime: nextEndTime,
        plannedDurationMinutes: nextDuration
      })
      updateTimePlanReminderBySource(blockId, {
        plannedStart: nextStartTime,
        plannedEnd: nextEndTime,
        plannedDuration: nextDuration
      })
      setPlans(nextPlans)
    },
    [logs, plans]
  )

  const resizeCalendarBlock = useCallback(
    (blockId: string, nextStartTime: string, nextEndTime: string) => {
      const nextDuration = calculateDurationMinutes(nextStartTime, nextEndTime)
      if (nextDuration < 15) {
        return
      }
      const logToResize = logs.find((log) => log.id === blockId)
      if (logToResize) {
        const nextLogs = logs.map((log) =>
          log.id === blockId
            ? {
                ...log,
                startTime: nextStartTime,
                endTime: nextEndTime,
                durationMinutes: nextDuration
              }
            : log
        )
        saveTimeDebtLogs(nextLogs)
        setLogs(nextLogs)
        return
      }

      const planToResize = plans.find((plan) => plan.id === blockId && plan.status === 'planned')
      if (!planToResize) {
        return
      }
      const nextPlans = updateTimeDebtPlan(blockId, {
        plannedStartTime: nextStartTime,
        plannedEndTime: nextEndTime,
        plannedDurationMinutes: nextDuration
      })
      updateTimePlanReminderBySource(blockId, {
        plannedStart: nextStartTime,
        plannedEnd: nextEndTime,
        plannedDuration: nextDuration
      })
      setPlans(nextPlans)
    },
    [logs, plans]
  )

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
      if (canStartPlan(sourcePlan, Date.now())) {
        startTimer(planToLogDraft(sourcePlan), sourcePlan.id)
      }
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
            plans={todayPlans}
            runningTimer={runningTimer}
            timerNow={timerNow}
            onOpenEntry={openEntry}
            onOpenCalendar={() => setCurrentView('timeline')}
            onStartPlan={(plan) => startTimer(planToLogDraft(plan), plan.id)}
            onConvertPlanToManual={convertPlanToManualLog}
            onAbandonPlan={abandonPlan}
            onFinishTimer={finishTimer}
          />
        ) : null}
        {currentView === 'timeline' ? (
          <CalendarViewShell
            mode={calendarViewMode}
            anchorDate={calendarAnchorDate}
            customDayCount={customDayCount}
            blocks={calendarBlocks}
            timerNow={timerNow}
            onModeChange={setCalendarViewMode}
            onAnchorDateChange={setCalendarAnchorDate}
            onCustomDayCountChange={setCustomDayCount}
            onOpenManual={() => openEntry('manual')}
            onDelete={removeLog}
            onStartPlan={(plan) => startTimer(planToLogDraft(plan), plan.id)}
            onConvertPlanToManual={convertPlanToManualLog}
            onAbandonPlan={abandonPlan}
            onFinishTimer={finishTimer}
            onMoveBlock={moveCalendarBlock}
            onResizeBlock={resizeCalendarBlock}
            onEditTimeRange={resizeCalendarBlock}
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
          taskHistoryOptions={taskHistoryOptions}
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
          onClose={() => setSettingsOpen(false)}
          onTabChange={setSettingsTab}
          onStandardChange={(patch) => setStandardDraft((current) => ({ ...current, ...patch }))}
          onParamsChange={(patch) => setParamsDraft((current) => ({ ...current, ...patch }))}
          onSaveStandard={saveStandard}
          onSaveParams={saveParams}
        />
      ) : null}
    </main>
  )
}

function TodayView({
  overview,
  diagnosis,
  plans,
  runningTimer,
  timerNow,
  onOpenEntry,
  onOpenCalendar,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer
}: {
  overview: TimeDebtOverview
  diagnosis: TimeDebtDiagnosis
  plans: TimeDebtPlan[]
  runningTimer: RunningTimer | null
  timerNow: number
  onOpenEntry: (mode: EntryMode, sourcePlan?: TimeDebtPlan) => void
  onOpenCalendar: () => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: (block?: CalendarBlock | null) => void
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
      <ExecutionSummaryPanel overview={overview} diagnosis={diagnosis} plans={plans} runningTimer={runningTimer} timerNow={timerNow} onOpenEntry={onOpenEntry} onOpenCalendar={onOpenCalendar} />
    </div>
  )
}

function ExecutionSummaryPanel({
  overview,
  diagnosis,
  plans,
  runningTimer,
  timerNow,
  onOpenEntry,
  onOpenCalendar
}: {
  overview: TimeDebtOverview
  diagnosis: TimeDebtDiagnosis
  plans: TimeDebtPlan[]
  runningTimer: RunningTimer | null
  timerNow: number
  onOpenEntry: (mode: EntryMode) => void
  onOpenCalendar: () => void
}) {
  const plannedCount = plans.filter((plan) => plan.status === 'planned').length
  const dueCount = plans.filter((plan) => plan.status === 'planned' && canStartPlan(plan, timerNow)).length
  const nextPlan = plans
    .filter((plan) => plan.status === 'planned')
    .sort((a, b) => a.plannedStartTime.localeCompare(b.plannedStartTime))[0]
  return (
    <section className="min-w-0 rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Execution</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">执行台摘要</h3>
        </div>
        <button type="button" onClick={onOpenCalendar} className={secondaryButtonClass}>
          查看日历
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="今日记录" value={`${overview.stats.totalLogs} 条`} />
        <Metric label="总记录时间" value={formatMinutes(overview.totalMinutes)} />
        <Metric label="待开始任务" value={`${plannedCount} 个`} />
        <Metric label="可开始" value={`${dueCount} 个`} tone={dueCount > 0 ? 'warn' : 'neutral'} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Next Action</div>
          <div className="mt-2 text-base font-semibold text-[color:var(--text-primary)]">
            {runningTimer ? runningTimer.title : nextPlan ? nextPlan.title : '安排下一段时间块'}
          </div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            {runningTimer
              ? `正在执行，已计时 ${formatElapsedTime(timerNow - runningTimer.startTimestampMs)}。`
              : nextPlan
                ? `${formatTimeOnly(nextPlan.plannedStartTime)} - ${formatTimeOnly(nextPlan.plannedEndTime)} / ${planReminderDetail(nextPlan, timerNow)}`
                : '执行台只保留行动入口和摘要，完整时间块请在日历页查看。'}
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Today Brief</div>
          <div className="mt-2 text-base font-semibold text-[color:var(--text-primary)]">{diagnosis.title}</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{diagnosis.summary}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
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
    </section>
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
  onFinishTimer: (block?: CalendarBlock | null) => void
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
          {timerNow - runningTimer.startTimestampMs >= 24 * 60 * 60 * 1000 ? (
            <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-5 text-[color:var(--text-secondary)]">
              <div className="font-semibold text-[color:var(--text-primary)]">这个计时已超过 24 小时，可能忘记结束。</div>
              <button type="button" onClick={() => onFinishTimer()} className={`mt-3 w-full ${primaryButtonClass}`}>
                立即结束计时
              </button>
            </div>
          ) : null}
          <button type="button" onClick={() => onFinishTimer()} className={`mt-4 w-full ${primaryButtonClass}`}>
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
  onConvertPlanToManual,
  onAbandonPlan
}: {
  plans: TimeDebtPlan[]
  timerNow: number
  onStartPlan: (plan: TimeDebtPlan) => void
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
                {canStartPlan(plan, timerNow) ? (
                  <button type="button" onClick={() => onStartPlan(plan)} className={tinyPrimaryButtonClass}>
                    {resolvePlanReminderStatus(plan, timerNow) === 'missed' ? '现在开始' : '开始计时'}
                  </button>
                ) : (
                  <button type="button" disabled className={`${tinyButtonClass} cursor-not-allowed opacity-50`}>
                    未到开始时间
                  </button>
                )}
                {resolvePlanReminderStatus(plan, timerNow) === 'missed' ? (
                  <>
                    <button type="button" onClick={() => onConvertPlanToManual(plan)} className={tinyButtonClass}>
                      转为补记
                    </button>
                    <button type="button" onClick={() => onAbandonPlan(plan.id)} className={tinyButtonClass}>
                      忽略
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
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const blocks = useMemo(() => buildCalendarBlocks(logs, plans, runningTimer, timerNow), [logs, plans, runningTimer, timerNow])
  useEffect(() => {
    if (highlightedPlanId) {
      setSelectedBlockId(highlightedPlanId)
    }
  }, [highlightedPlanId])
  useEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    const currentMinute = minutesFromDateTime(formatLocalDateTimeInput(new Date(timerNow)))
    const target = Math.max(0, (currentMinute / 1440) * element.scrollHeight - element.clientHeight * 0.35)
    element.scrollTop = target
  }, [])
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
      <div ref={scrollRef} className="max-h-[760px] overflow-auto rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
        <div className="relative h-[960px] min-w-[520px]">
          <TimeGrid />
          {blocks.map((block) => (
            <TimeBlock
              key={block.id}
              block={block}
              timerNow={timerNow}
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
          <div className="absolute left-[72px] right-3 border-t border-emerald-300/50" style={{ top: timeToTopPercent(formatLocalDateTimeInput(new Date(timerNow))) }}>
            <span className="absolute -top-3 left-2 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-2 py-0.5 text-[10px] text-accent-green">now</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function TimeGrid() {
  return (
    <>
      {Array.from({ length: 25 }, (_, hour) => (
        <div key={hour} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]" style={{ top: `${(hour / 24) * 100}%` }}>
          {hour < 24 ? <span className="absolute left-3 top-1 text-[11px] tabular-nums text-[color:var(--text-muted)]">{padDatePart(hour)}:00</span> : null}
        </div>
      ))}
      {Array.from({ length: 24 }, (_, hour) => (
        <div key={`${hour}-half`} className="absolute left-[72px] right-0 border-t border-dashed border-[color:var(--panel-border)] opacity-45" style={{ top: `${((hour + 0.5) / 24) * 100}%` }} />
      ))}
      <div className="absolute bottom-0 left-[72px] top-0 w-px bg-[var(--panel-border)]" />
    </>
  )
}

function TimeBlock({
  block,
  timerNow,
  selected,
  onSelect,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan
}: {
  block: CalendarBlock
  timerNow: number
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
    top: timeToTopPercent(block.startTime),
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
      className={`absolute overflow-visible rounded-xl border border-l-4 px-3 py-2 text-left transition hover:z-20 hover:ring-1 hover:ring-white/20 ${selected ? 'z-30 ring-2 ring-[color:var(--node-selected-border)]' : ''} ${blockClass}`}
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
      {selected ? <TimeBlockPopover block={block} timerNow={timerNow} onStartPlan={onStartPlan} onConvertPlanToManual={onConvertPlanToManual} onAbandonPlan={onAbandonPlan} /> : null}
    </div>
  )
}

function TimeBlockPopover({
  block,
  timerNow,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan
}: {
  block: CalendarBlock
  timerNow: number
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
}) {
  const canStart = block.plan ? canStartPlan(block.plan, timerNow) : false
  return (
    <div className="mt-2 rounded-xl border border-current/15 bg-black/10 p-2 text-[11px] leading-5 shadow-lg backdrop-blur">
      <div>{blockDetail(block)}</div>
      {block.plan && (block.status === 'planned' || block.status === 'missed') ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {canStart ? (
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
              {block.status === 'missed' ? '现在开始' : '开始计时'}
            </span>
          ) : (
            <span className={`${tinyButtonClass} cursor-not-allowed opacity-50`}>未到开始时间</span>
          )}
          {block.status === 'missed' ? (
            <>
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
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TimelineView({
  date,
  logs,
  plans,
  runningTimer,
  timerNow,
  onDateChange,
  onOpenManual,
  onDelete,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer
}: {
  date: string
  logs: TimeDebtLog[]
  plans: TimeDebtPlan[]
  runningTimer: RunningTimer | null
  timerNow: number
  onDateChange: (date: string) => void
  onOpenManual: () => void
  onDelete: (logId: string) => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: (block?: CalendarBlock | null) => void
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const weekStart = useMemo(() => startOfWeek(new Date(`${date}T00:00`)), [date])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])
  const weekBlocks = useMemo(() => {
    const rangedLogs = logs.filter((log) => dateTimeOverlapsRange(log.startTime, log.endTime, weekStart, weekEnd))
    const rangedPlans = plans.filter((plan) => dateTimeOverlapsRange(plan.plannedStartTime, plan.plannedEndTime, weekStart, weekEnd) || (plan.actualStartTime && dateTimeOverlapsRange(plan.actualStartTime, formatLocalDateTimeInput(new Date(timerNow)), weekStart, weekEnd)))
    return buildCalendarBlocks(rangedLogs, rangedPlans, runningTimer, timerNow).filter((block) => dateTimeOverlapsRange(block.startTime, block.endTime, weekStart, weekEnd))
  }, [logs, plans, runningTimer, timerNow, weekEnd, weekStart])
  const selectedBlock = weekBlocks.find((block) => block.id === selectedBlockId) ?? null
  const weekRangeText = `${formatDateSlash(weekStart)} - ${formatDateSlash(addDays(weekStart, 6))}`
  const todayKey = formatDateKey(new Date(timerNow))
  const includesToday = weekDays.some((day) => formatDateKey(day) === todayKey)
  useEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    const targetMinute = includesToday ? minutesFromDateTime(formatLocalDateTimeInput(new Date(timerNow))) : 8 * 60
    element.scrollTop = Math.max(0, (targetMinute / 1440) * element.scrollHeight - element.clientHeight * 0.35)
  }, [includesToday, timerNow, weekStart])
  return (
    <div className="grid min-h-[760px] gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Weekly Calendar</div>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">本周时间日志</h3>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{weekRangeText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onDateChange(formatDateKey(addDays(weekStart, -7)))} className={tinyButtonClass}>
              上一周
            </button>
            <button type="button" onClick={() => onDateChange(today)} className={tinyPrimaryButtonClass}>
              今天
            </button>
            <button type="button" onClick={() => onDateChange(formatDateKey(addDays(weekStart, 7)))} className={tinyButtonClass}>
              下一周
            </button>
            <button type="button" onClick={onOpenManual} className={primaryButtonClass}>
              新增日志
            </button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
          <Legend dotClass="border-dashed border-amber-400 bg-amber-400/10" label="Planned" />
          <Legend dotClass="border-emerald-400 bg-emerald-400/20" label="Active" />
          <Legend dotClass="border-cyan-400 bg-cyan-400/20" label="Completed" />
          <Legend dotClass="border-rose-400 bg-rose-400/10" label="Missed" />
        </div>
        <div ref={scrollRef} className="max-h-[760px] overflow-auto rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
          <div className="sticky top-0 z-40 grid min-w-[920px] grid-cols-[72px_repeat(7,minmax(112px,1fr))] border-b border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)]">
            <div className="border-r border-[color:var(--panel-border)] px-3 py-3 text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Time</div>
            {weekDays.map((day) => {
              const dayKey = formatDateKey(day)
              return (
                <div key={dayKey} className={`border-r border-[color:var(--panel-border)] px-3 py-3 ${dayKey === todayKey ? 'bg-emerald-400/10' : ''}`}>
                  <div className="text-[11px] text-[color:var(--text-muted)]">{weekDayLabel(day)}</div>
                  <div className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{formatMonthDay(day)}</div>
                </div>
              )
            })}
          </div>
          <div className="relative grid h-[1152px] min-w-[920px] grid-cols-[72px_repeat(7,minmax(112px,1fr))]">
            <WeeklyTimeGrid />
            {weekDays.map((day, dayIndex) => {
              const dayKey = formatDateKey(day)
              const dayBlocks = weekBlocks.filter((block) => block.dayKey === dayKey)
              return (
                <div key={dayKey} className={`relative border-r border-[color:var(--panel-border)] ${dayKey === todayKey ? 'bg-emerald-400/5' : ''}`} style={{ gridColumnStart: dayIndex + 2 }}>
                  {dayBlocks.map((block) => (
                    <WeeklyTimeBlock key={block.id} block={block} selected={selectedBlockId === block.id} onSelect={() => setSelectedBlockId(block.id)} />
                  ))}
                  {includesToday && dayKey === todayKey ? (
                    <div className="absolute left-0 right-0 z-30 border-t border-rose-300/80" style={{ top: timeToTopPercent(formatLocalDateTimeInput(new Date(timerNow))) }}>
                      <span className="absolute -top-3 left-1 rounded-full border border-rose-300/50 bg-rose-400/20 px-2 py-0.5 text-[10px] text-rose-100">now</span>
                    </div>
                  ) : null}
                </div>
              )
            })}
            {weekBlocks.length === 0 ? (
              <div className="absolute left-[92px] right-5 top-8 rounded-2xl border border-dashed border-[color:var(--panel-border)] p-5 text-sm text-[color:var(--text-muted)]">
                当前周还没有时间块。先补记、规划或开始计时。
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <WeeklyEventDetailPanel
        block={selectedBlock}
        timerNow={timerNow}
        onDelete={onDelete}
        onStartPlan={onStartPlan}
        onConvertPlanToManual={onConvertPlanToManual}
        onAbandonPlan={onAbandonPlan}
        onFinishTimer={onFinishTimer}
      />
    </div>
  )
}

function WeeklyTimeGrid() {
  return (
    <>
      <div className="relative border-r border-[color:var(--panel-border)]">
        {Array.from({ length: 25 }, (_, hour) => (
          <div key={hour} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]" style={{ top: `${(hour / 24) * 100}%` }}>
            {hour < 24 ? <span className="absolute left-3 top-1 text-[11px] tabular-nums text-[color:var(--text-muted)]">{padDatePart(hour)}:00</span> : null}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-[72px] right-0 top-0">
        {Array.from({ length: 25 }, (_, hour) => (
          <div key={hour} className="absolute left-0 right-0 border-t border-[color:var(--panel-border)]" style={{ top: `${(hour / 24) * 100}%` }} />
        ))}
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={`${hour}-half`} className="absolute left-0 right-0 border-t border-dashed border-[color:var(--panel-border)] opacity-40" style={{ top: `${((hour + 0.5) / 24) * 100}%` }} />
        ))}
      </div>
    </>
  )
}

function WeeklyTimeBlock({ block, selected, onSelect }: { block: CalendarBlock; selected: boolean; onSelect: () => void }) {
  const heightMinutes = Math.max(block.durationMinutes, 25)
  const widthFactor = (block.widthPercent ?? 100) / 100
  const leftFactor = (block.leftPercent ?? 0) / 100
  const style = {
    top: timeToTopPercent(block.startTime),
    height: `${(heightMinutes / 1440) * 100}%`,
    left: `calc(4px + (100% - 10px) * ${leftFactor})`,
    width: `calc((100% - 10px) * ${widthFactor})`
  }
  const blockClass =
    block.status === 'planned'
      ? 'border-dashed border-amber-400/45 bg-amber-400/10'
      : block.status === 'active'
        ? 'border-emerald-400/45 bg-emerald-400/18 shadow-[0_12px_28px_rgba(16,185,129,0.14)]'
        : block.status === 'missed'
          ? 'border-rose-400/35 bg-rose-400/10'
          : categoryBlockClass(block.primaryCategory)
  return (
    <button
      type="button"
      className={`absolute z-20 overflow-hidden rounded-lg border border-l-4 p-2 text-left text-[color:var(--text-primary)] transition hover:z-30 hover:ring-1 hover:ring-white/20 ${selected ? 'z-40 ring-2 ring-[color:var(--node-selected-border)]' : ''} ${blockClass}`}
      style={style}
      title={`${block.title} / ${block.meta}`}
      onClick={onSelect}
    >
      <div className="truncate text-xs font-semibold">{block.title}</div>
      <div className="mt-1 truncate text-[10px] tabular-nums opacity-80">{formatTimeOnly(block.startTime)} - {formatTimeOnly(block.endTime)}</div>
      <div className="mt-1 truncate text-[10px] opacity-75">{calendarStatusLabel(block.status)}</div>
      <div className="mt-1 truncate text-[10px] opacity-70">{block.primaryCategory} / {block.secondaryProject}</div>
    </button>
  )
}

function WeeklyEventDetailPanel({
  block,
  timerNow,
  onDelete,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer
}: {
  block: CalendarBlock | null
  timerNow: number
  onDelete: (logId: string) => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: (block?: CalendarBlock | null) => void
}) {
  if (!block) {
    return (
      <Panel title="时间块详情" eyebrow="Detail">
        <Empty text="点击周视图中的时间块查看详情。" />
        <FieldTypeSummary />
      </Panel>
    )
  }
  const canStart = block.plan ? canStartPlan(block.plan, timerNow) : false
  return (
    <Panel title="时间块详情" eyebrow={calendarStatusLabel(block.status)}>
      <div className="space-y-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Task</div>
          <div className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">{block.title}</div>
        </div>
        <DetailRow label="状态" value={calendarStatusLabel(block.status)} />
        <DetailRow label="一级分类" value={block.primaryCategory} />
        <DetailRow label="二级项目" value={block.secondaryProject} />
        <DetailRow label="开始时间" value={formatDateTimeReadable(block.startTime)} />
        <DetailRow label="结束时间" value={formatDateTimeReadable(block.endTime)} />
        <DetailRow label={block.status === 'active' ? '当前已计时' : '实际时长'} value={formatMinutes(block.durationMinutes)} />
        <DetailRow label="AI 赋能比例" value={typeof block.aiEnableRatio === 'number' ? formatPercent(block.aiEnableRatio) : '待补'} />
        <DetailRow label="状态分" value={typeof block.statusScore === 'number' ? String(block.statusScore) : '待补'} />
        <DetailRow label="标签" value={block.tags?.length ? block.tags.join(' / ') : '无'} />
        <DetailRow label="干扰源" value={block.distractionSource || '无'} />
        {block.note ? <p className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 leading-6 text-[color:var(--text-secondary)]">{block.note}</p> : null}
        {block.status === 'planned' && block.plan ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
            {planReminderDetail(block.plan, timerNow)}
          </div>
        ) : null}
        {block.status === 'missed' && block.plan ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
            {planReminderDetail(block.plan, timerNow)}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {block.plan && (block.status === 'planned' || block.status === 'missed') ? (
            <>
              <button type="button" disabled={!canStart} onClick={() => onStartPlan(block.plan as TimeDebtPlan)} className={`${canStart ? tinyPrimaryButtonClass : tinyButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}>
                {block.status === 'missed' ? '现在开始' : '开始计时'}
              </button>
              {block.status === 'missed' ? (
                <>
                  <button type="button" onClick={() => onConvertPlanToManual(block.plan as TimeDebtPlan)} className={tinyButtonClass}>
                    转为补记
                  </button>
                  <button type="button" onClick={() => onAbandonPlan((block.plan as TimeDebtPlan).id)} className={tinyButtonClass}>
                    忽略
                  </button>
                </>
              ) : null}
            </>
          ) : null}
          {block.status === 'active' ? (
            <button type="button" onClick={() => onFinishTimer(block)} className={primaryButtonClass}>
              结束计时
            </button>
          ) : null}
          {block.log ? (
            <button type="button" onClick={() => onDelete(block.log?.id ?? block.id)} className={tinyButtonClass}>
              删除日志
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[color:var(--panel-border)] pb-2 text-xs">
      <span className="text-[color:var(--text-muted)]">{label}</span>
      <span className="text-right text-[color:var(--text-primary)]">{value}</span>
    </div>
  )
}

function FieldTypeSummary() {
  return (
    <div className="mt-4 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
      字段层：{timeDebtSupportedFieldTypes.join(' / ')}。预留：{timeDebtReservedFieldTypes.join(' / ')}。
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
  taskHistoryOptions,
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
  taskHistoryOptions: TaskHistoryOption[]
  runningTimer: RunningTimer | null
  onClose: () => void
  onLogChange: (patch: Partial<LogDraft>) => void
  onPlanChange: (patch: Partial<PlanDraft>) => void
  onCreateOption: (values: { category?: string; project?: string; tags?: string[]; distraction?: string }) => void
  onStartTimer: () => void
  onSaveManual: () => void
  onSavePlan: () => void
}) {
  const title = mode === 'timer' ? '开始计时' : mode === 'manual' ? '补记时间' : '规划任务'
  return (
    <Modal title={title} eyebrow="Time Entry" onClose={onClose}>
      {mode === 'plan' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <TaskNameCombobox
            label={timeDebtFieldConfigs.title.label}
            value={planDraft.title}
            options={taskHistoryOptions}
            placeholder={timeDebtFieldConfigs.title.placeholder}
            onChange={(title) => onPlanChange({ title })}
            onSelect={(option) => onPlanChange({
              title: option.title,
              primaryCategory: option.primaryCategory,
              secondaryProject: option.secondaryProject,
              tags: formatTags(option.tags)
            })}
          />
          <CategoryFields
            primaryCategory={planDraft.primaryCategory}
            secondaryProject={planDraft.secondaryProject}
            options={options}
            onPrimaryChange={(primaryCategory) => onPlanChange({ primaryCategory })}
            onSecondaryChange={(secondaryProject) => onPlanChange({ secondaryProject })}
            onCreateOption={onCreateOption}
          />
          <TextField label={timeDebtFieldConfigs.plannedStartTime.label} value={planDraft.plannedStartTime} onChange={(plannedStartTime) => onPlanChange({ plannedStartTime })} type="datetime-local" />
          <TextField label={timeDebtFieldConfigs.plannedEndTime.label} value={planDraft.plannedEndTime} onChange={(plannedEndTime) => onPlanChange({ plannedEndTime })} type="datetime-local" />
          <SmartOptionInput
            label={timeDebtFieldConfigs.tags.label}
            value={planDraft.tags}
            options={options.tags}
            placeholder={timeDebtFieldConfigs.tags.placeholder}
            onChange={(tags) => onPlanChange({ tags })}
            onCreateOption={(tag) => onCreateOption({ tags: parseTagInput(tag) })}
          />
          <Field label={timeDebtFieldConfigs.note.label}>
            <textarea value={planDraft.note} onChange={(event) => onPlanChange({ note: event.target.value })} rows={3} className={inputClass} />
          </Field>
          <div className="md:col-span-2">
            <button type="button" onClick={onSavePlan} className={primaryButtonClass}>
              保存计划任务
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <TaskNameCombobox
            label={timeDebtFieldConfigs.title.label}
            value={logDraft.title}
            options={taskHistoryOptions}
            placeholder={timeDebtFieldConfigs.title.placeholder}
            onChange={(title) => onLogChange({ title })}
            onSelect={(option) => onLogChange({
              title: option.title,
              primaryCategory: option.primaryCategory,
              secondaryProject: option.secondaryProject,
              tags: formatTags(option.tags),
              aiEnableRatio: typeof option.aiEnableRatio === 'number' ? String(option.aiEnableRatio) : logDraft.aiEnableRatio
            })}
          />
          <CategoryFields
            primaryCategory={logDraft.primaryCategory}
            secondaryProject={logDraft.secondaryProject}
            options={options}
            onPrimaryChange={(primaryCategory) => onLogChange({ primaryCategory })}
            onSecondaryChange={(secondaryProject) => onLogChange({ secondaryProject })}
            onCreateOption={onCreateOption}
          />
          {mode === 'manual' ? (
            <>
              <TextField label={timeDebtFieldConfigs.startTime.label} value={logDraft.startTime} onChange={(startTime) => onLogChange({ startTime })} type="datetime-local" />
              <TextField label={timeDebtFieldConfigs.endTime.label} value={logDraft.endTime} onChange={(endTime) => onLogChange({ endTime })} type="datetime-local" />
              <TextField label={timeDebtFieldConfigs.statusScore.label} value={logDraft.statusScore} onChange={(statusScore) => onLogChange({ statusScore })} type="number" />
              <TextField label={timeDebtFieldConfigs.aiEnableRatio.label} value={logDraft.aiEnableRatio} onChange={(aiEnableRatio) => onLogChange({ aiEnableRatio: clampPercentInput(aiEnableRatio) })} type="number" />
              <SmartOptionInput
                label={timeDebtFieldConfigs.tags.label}
                value={logDraft.tags}
                options={options.tags}
                placeholder={timeDebtFieldConfigs.tags.placeholder}
                onChange={(tags) => onLogChange({ tags })}
                onCreateOption={(tag) => onCreateOption({ tags: parseTagInput(tag) })}
              />
              <SmartOptionInput
                label={timeDebtFieldConfigs.distractionSource.label}
                value={logDraft.distractionSource}
                options={options.distractions}
                placeholder={timeDebtFieldConfigs.distractionSource.placeholder}
                onChange={(distractionSource) => onLogChange({ distractionSource })}
                onCreateOption={(distraction) => onCreateOption({ distraction })}
              />
              <Field label={timeDebtFieldConfigs.note.label}>
                <textarea value={logDraft.resultNote} onChange={(event) => onLogChange({ resultNote: event.target.value })} rows={3} className={inputClass} />
              </Field>
            </>
          ) : (
            <>
              <TextField label={timeDebtFieldConfigs.startTime.label} value={logDraft.startTime} onChange={(startTime) => onLogChange({ startTime })} type="datetime-local" />
              <TextField label={timeDebtFieldConfigs.aiEnableRatio.label} value={logDraft.aiEnableRatio} onChange={(aiEnableRatio) => onLogChange({ aiEnableRatio: clampPercentInput(aiEnableRatio) })} type="number" />
              <SmartOptionInput
                label={timeDebtFieldConfigs.tags.label}
                value={logDraft.tags}
                options={options.tags}
                placeholder={timeDebtFieldConfigs.tags.placeholder}
                onChange={(tags) => onLogChange({ tags })}
                onCreateOption={(tag) => onCreateOption({ tags: parseTagInput(tag) })}
              />
              <Field label={timeDebtFieldConfigs.note.label}>
                <textarea value={logDraft.resultNote} onChange={(event) => onLogChange({ resultNote: event.target.value })} rows={3} className={inputClass} />
              </Field>
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
  onClose,
  onTabChange,
  onStandardChange,
  onParamsChange,
  onSaveStandard,
  onSaveParams
}: {
  activeTab: SettingsTab
  standards: WorkTimeStandard[]
  standardDraft: StandardDraft
  params: TimeDebtParams
  paramsDraft: { annualIncome: string; effectiveWorkDays: string; averageWorkHoursPerDay: string; idealHourlyWage: string; note: string }
  onClose: () => void
  onTabChange: (tab: SettingsTab) => void
  onStandardChange: (patch: Partial<StandardDraft>) => void
  onParamsChange: (patch: Partial<typeof paramsDraft>) => void
  onSaveStandard: () => void
  onSaveParams: () => void
}) {
  const tabs: Array<[SettingsTab, string]> = [
    ['standard', '工作时间标准'],
    ['params', '时间负债参数']
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
    </Modal>
  )
}

function Modal({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-black/35 px-4 py-[7vh]">
      <section className={`max-h-[85vh] w-full overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{eyebrow}</div>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className={`${tinyButtonClass} shrink-0`}>
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

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full border ${dotClass}`} />
      {label}
    </span>
  )
}

function CategoryFields({
  primaryCategory,
  secondaryProject,
  options,
  onPrimaryChange,
  onSecondaryChange,
  onCreateOption
}: {
  primaryCategory: string
  secondaryProject: string
  options: TimeDebtOptions
  onPrimaryChange: (value: string) => void
  onSecondaryChange: (value: string) => void
  onCreateOption: (values: { category?: string; project?: string; tags?: string[]; distraction?: string }) => void
}) {
  const categoryOptions = Array.from(new Set([...options.categories, ...defaultProjectCategories.map((item) => item.primaryCategory)]))
  const projectOptions = Array.from(new Set([...options.projects, ...defaultProjectCategories.map((item) => item.secondaryProject)]))
  return (
    <>
      <SmartOptionInput
        label="一级分类"
        value={primaryCategory}
        options={categoryOptions}
        placeholder="例如：工作"
        onChange={onPrimaryChange}
        onCreateOption={(category) => onCreateOption({ category })}
      />
      <SmartOptionInput
        label="二级项目"
        value={secondaryProject}
        options={projectOptions}
        placeholder="例如：growth-tree-os"
        onChange={onSecondaryChange}
        onCreateOption={(project) => onCreateOption({ project })}
      />
    </>
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
  type = 'text',
  placeholder
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className={inputClass} />
    </Field>
  )
}

function TaskNameCombobox({
  label,
  value,
  options,
  placeholder,
  onChange,
  onSelect
}: {
  label: string
  value: string
  options: TaskHistoryOption[]
  placeholder?: string
  onChange: (value: string) => void
  onSelect: (option: TaskHistoryOption) => void
}) {
  const [open, setOpen] = useState(false)
  const query = value.trim().toLowerCase()
  const matchedOptions = options
    .filter((option) => {
      if (!query) return true
      return [option.title, option.primaryCategory, option.secondaryProject, ...(option.tags ?? [])].some((item) => item.toLowerCase().includes(query))
    })
    .slice(0, 6)

  const selectOption = (option: TaskHistoryOption) => {
    onSelect(option)
    setOpen(false)
  }

  return (
    <Field label={label}>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          type="text"
          placeholder={placeholder}
          className={inputClass}
          role="combobox"
          aria-expanded={open}
        />
        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] max-h-64 overflow-auto rounded-2xl border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-2 shadow-panel">
            {matchedOptions.length > 0 ? (
              matchedOptions.map((option) => (
                <button
                  key={`${option.title}-${option.primaryCategory}-${option.secondaryProject}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[var(--control-bg)]"
                >
                  <div className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{option.title}</div>
                  <div className="mt-1 truncate text-[11px] text-[color:var(--text-muted)]">
                    {option.primaryCategory || '未分类'} · {option.secondaryProject || '未归属项目'}
                  </div>
                  <div className="mt-1 text-[10px] text-[color:var(--text-muted)]">
                    最近使用 {formatDateSlash(new Date(option.lastUsedAt))} / 使用 {option.useCount} 次
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[color:var(--panel-border)] px-3 py-3 text-xs text-[color:var(--text-muted)]">
                暂无历史任务，直接输入即可。
              </div>
            )}
          </div>
        ) : null}
      </div>
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
    meta: `${formatMinutes(log.durationMinutes)} / 已完成`,
    dayKey: log.startTime.slice(0, 10),
    tags: log.tags,
    distractionSource: log.distractionSource,
    aiEnableRatio: log.aiEnableRatio,
    statusScore: log.statusScore,
    note: log.resultNote,
    log
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
        dayKey: plan.plannedStartTime.slice(0, 10),
        tags: plan.tags,
        note: plan.note,
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
        dayKey: startTime.slice(0, 10),
        tags: plan.tags,
        note: plan.note,
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
          dayKey: runningTimer.startTime.slice(0, 10),
          tags: runningTimer.tags,
          aiEnableRatio: runningTimer.aiEnableRatio,
          note: runningTimer.resultNote,
          meta: runningTimer.plannedStartTime
            ? `进行中 / 原计划 ${formatTimeOnly(runningTimer.plannedStartTime)}-${formatTimeOnly(runningTimer.plannedEndTime ?? '')} / 建议结束 ${runningTimer.suggestedEndTime ? formatTimeOnly(runningTimer.suggestedEndTime) : '--:--'}`
            : '进行中'
        }
      ]
    : []
  return layoutOverlappingEvents([...planned, ...activePlans, ...completed, ...active].sort((a, b) => a.startTime.localeCompare(b.startTime)))
}

function buildTaskHistoryOptions(logs: TimeDebtLog[], plans: TimeDebtPlan[]): TaskHistoryOption[] {
  const byTitle = new Map<string, TaskHistoryOption>()
  const remember = (input: {
    title: string
    primaryCategory: string
    secondaryProject: string
    tags?: string[]
    aiEnableRatio?: number
    usedAt: string
  }) => {
    const title = input.title.trim()
    if (!title) return
    const key = title.toLowerCase()
    const current = byTitle.get(key)
    if (!current) {
      byTitle.set(key, {
        title,
        primaryCategory: input.primaryCategory,
        secondaryProject: input.secondaryProject,
        tags: input.tags,
        aiEnableRatio: input.aiEnableRatio,
        lastUsedAt: input.usedAt,
        useCount: 1
      })
      return
    }
    const isNewer = input.usedAt.localeCompare(current.lastUsedAt) > 0
    byTitle.set(key, {
      title: isNewer ? title : current.title,
      primaryCategory: isNewer ? input.primaryCategory : current.primaryCategory,
      secondaryProject: isNewer ? input.secondaryProject : current.secondaryProject,
      tags: isNewer ? input.tags : current.tags,
      aiEnableRatio: typeof input.aiEnableRatio === 'number' ? input.aiEnableRatio : current.aiEnableRatio,
      lastUsedAt: isNewer ? input.usedAt : current.lastUsedAt,
      useCount: current.useCount + 1
    })
  }

  for (const log of logs) {
    remember({
      title: log.title,
      primaryCategory: log.primaryCategory,
      secondaryProject: log.secondaryProject,
      tags: log.tags,
      aiEnableRatio: log.aiEnableRatio,
      usedAt: log.endTime || log.startTime
    })
  }
  for (const plan of plans) {
    remember({
      title: plan.title,
      primaryCategory: plan.primaryCategory,
      secondaryProject: plan.secondaryProject,
      tags: plan.tags,
      usedAt: plan.actualEndTime || plan.actualStartTime || plan.plannedStartTime
    })
  }

  return Array.from(byTitle.values()).sort((first, second) => {
    if (first.lastUsedAt !== second.lastUsedAt) return second.lastUsedAt.localeCompare(first.lastUsedAt)
    return second.useCount - first.useCount
  })
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
  const defaultRows = [
    { label: '工作', minutes: 0, color: 'bg-cyan-300/80' },
    { label: '学习', minutes: 0, color: 'bg-emerald-300/80' },
    { label: '运动', minutes: 0, color: 'bg-lime-300/75' },
    { label: '生活', minutes: 0, color: 'bg-sky-300/75' },
    { label: '娱乐', minutes: 0, color: 'bg-violet-300/70' },
    { label: '空转', minutes: 0, color: 'bg-slate-300/75' },
    { label: '其他', minutes: 0, color: 'bg-zinc-300/70' }
  ]
  const rowMap = new Map(defaultRows.map((row) => [row.label, { ...row }]))
  for (const log of logs) {
    const label = log.primaryCategory.trim() || '其他'
    const row = rowMap.get(label) ?? { label, minutes: 0, color: categoryRowColor(rowMap.size) }
    row.minutes += log.durationMinutes
    rowMap.set(label, row)
  }
  return Array.from(rowMap.values()).sort((first, second) => {
    if (first.minutes > 0 && second.minutes === 0) return -1
    if (first.minutes === 0 && second.minutes > 0) return 1
    if (first.minutes !== second.minutes) return second.minutes - first.minutes
    return defaultRows.findIndex((row) => row.label === first.label) - defaultRows.findIndex((row) => row.label === second.label)
  })
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
    statusScore: '',
    aiEnableRatio: '',
    tags: '',
    distractionSource: '',
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
    plannedEndTime: formatLocalDateTimeInput(end),
    tags: '',
    note: ''
  }
}

function planToDraft(plan: TimeDebtPlan): PlanDraft {
  return {
    title: plan.title,
    primaryCategory: plan.primaryCategory,
    secondaryProject: plan.secondaryProject,
    plannedStartTime: plan.plannedStartTime,
    plannedEndTime: plan.plannedEndTime,
    tags: formatTags(plan.tags),
    note: plan.note ?? ''
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
    tags: formatTags(plan.tags),
    resultNote: plan.note || '由今日计划任务启动。'
  }
}

function activeTimerToRunningTimer(timer: ReturnType<typeof loadActiveTimeDebtTimer>): RunningTimer | null {
  if (!timer) {
    return null
  }
  return {
    title: timer.title,
    primaryCategory: timer.primaryCategory,
    secondaryProject: timer.secondaryProject,
    startTime: timer.actualStart,
    startTimestampMs: timer.startTimestampMs,
    planId: timer.sourcePlanId,
    plannedStartTime: timer.plannedStart,
    plannedEndTime: timer.plannedEnd,
    plannedDurationMinutes: timer.plannedDuration,
    suggestedEndTime: timer.suggestedEnd,
    aiEnableRatio: timer.aiEnableRatio,
    tags: timer.tags,
    resultNote: timer.resultNote
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
    tags: formatTags(plan.tags),
    resultNote: plan.note || '由错过的计划任务转为补记。'
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

function canStartPlan(plan: TimeDebtPlan, nowMs: number): boolean {
  const status = resolvePlanReminderStatus(plan, nowMs)
  return status === 'due' || status === 'missed'
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

function timeToTopPercent(value: string): string {
  return `${(minutesFromDateTime(value) / 1440) * 100}%`
}

function optionalNumber(value: string): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && value.trim() ? numberValue : undefined
}

function optionalPercentNumber(value: string): number {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue) || !value.trim()) {
    return 0
  }
  return Math.min(100, Math.max(0, numberValue))
}

function clampPercentInput(value: string): string {
  if (!value.trim()) {
    return ''
  }
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) {
    return value
  }
  return String(Math.min(100, Math.max(0, numberValue)))
}

function parseTagInput(value: string): string[] {
  return Array.from(new Set(value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)))
}

function formatTags(tags: string[] | undefined): string {
  return tags?.join(', ') ?? ''
}

function formatLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function startOfWeek(date: Date): Date {
  const next = new Date(date)
  const day = next.getDay()
  next.setDate(next.getDate() - day)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  return `${year}-${month}-${day}`
}

function formatDateSlash(date: Date): string {
  return `${date.getFullYear()}/${padDatePart(date.getMonth() + 1)}/${padDatePart(date.getDate())}`
}

function formatMonthDay(date: Date): string {
  return `${padDatePart(date.getMonth() + 1)}/${padDatePart(date.getDate())}`
}

function weekDayLabel(date: Date): string {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

function dateTimeOverlapsRange(startTime: string, endTime: string, rangeStart: Date, rangeEnd: Date): boolean {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime || startTime).getTime()
  return Number.isFinite(start) && Number.isFinite(end) && start < rangeEnd.getTime() && Math.max(end, start + 60000) > rangeStart.getTime()
}

function formatDateTimeReadable(value: string): string {
  if (!value) {
    return '待补'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${formatDateSlash(date)} ${formatTimeOnly(value)}`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function calendarStatusLabel(status: CalendarBlock['status']): string {
  return {
    planned: '计划中',
    active: '进行中',
    completed: '已完成',
    missed: '已错过'
  }[status]
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
  const ratio = value > 1 ? value / 100 : value
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(ratio)
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

function categoryRowColor(index: number): string {
  const colors = [
    'bg-teal-300/75',
    'bg-fuchsia-300/70',
    'bg-orange-300/75',
    'bg-indigo-300/75',
    'bg-rose-300/70',
    'bg-yellow-300/75'
  ]
  return colors[index % colors.length]
}

function statusToneClass(status: TimeDebtOverview['status']): string {
  if (status === 'debt') return 'border-rose-400/30 bg-rose-500/15 text-accent-rose'
  if (status === 'warning' || status === 'empty') return 'border-amber-400/25 bg-amber-400/10 text-accent-amber'
  return 'border-emerald-400/25 bg-emerald-400/10 text-accent-green'
}

function statusPillClass(status: TimeDebtOverview['status']): string {
  return `shrink-0 rounded-full border px-3 py-1 text-xs ${statusToneClass(status)}`
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
  activeTimer: timeDebtActiveTimerStorageKey,
  timePlanReminders: timePlanReminderStorageKeys.reminders,
  navigationIntent: timePlanReminderStorageKeys.navigationIntent
}
