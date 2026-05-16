import { useEffect, useState } from 'react'
import type { WealthRecord, WealthRecordType } from '@shared/wealth'
import { loadActiveTimeDebtTimer, type ActiveTimeDebtTimer } from '../time-debt/timeDebtActiveTimerStorage'
import { finishQuickTimeDebtTimer, startQuickTimeDebtTimer } from '../time-debt/timeDebtQuickTimer'
import { loadTimeDebtLogs, timeDebtLogsChangeEvent } from '../time-debt/timeDebtStorage'
import {
  TimeDebtQuickRecordForm,
  formatElapsedTime,
  formatMinutes,
  normalizePrimaryCategory
} from '../time-debt/components/TimeDebtQuickRecordForm'
import {
  WealthQuickRecordForm,
  defaultForm as defaultWealthForm,
  eventTypes as wealthEventTypes,
  type FormState as WealthFormState
} from '../wealth/WealthQuickRecordForm'
import { appendWealthRecord } from '../wealth/wealthStorage'

type RecordType = 'time' | 'wealth'

const recordTypeOptions: { key: RecordType; label: string }[] = [
  { key: 'time', label: '记录时间' },
  { key: 'wealth', label: '记录财富' }
]

type RecentTaskOption = {
  title: string
  primaryCategory: string
  lastUsedAt: string
}

const recentTaskLimit = 3

const today = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})()

const floatUiStorageKey = 'growth-tree-os:unified-quick-float-ui:v1'

type FloatingUiState = {
  isOpen: boolean
  selectedType: RecordType
  lastRecordFeedback?: string
}

export function UnifiedQuickRecordFloat() {
  const [uiState, setUiState] = useState<FloatingUiState>(() => loadFloatingUiState())

  // Time Debt state
  const [taskTitle, setTaskTitle] = useState('')
  const [primaryCategory, setPrimaryCategory] = useState(normalizePrimaryCategory(undefined))
  const [activeTimer, setActiveTimer] = useState<ActiveTimeDebtTimer | null>(() => loadActiveTimeDebtTimer())
  const [timerNow, setTimerNow] = useState(() => Date.now())
  const [timeDebtMessage, setTimeDebtMessage] = useState('')
  const [recentTasks, setRecentTasks] = useState<RecentTaskOption[]>(() => loadRecentTaskOptions())

  // Wealth state
  const [wealthForm, setWealthForm] = useState<WealthFormState>(defaultWealthForm)
  const [wealthMessage, setWealthMessage] = useState('')
  const [wealthSuccess, setWealthSuccess] = useState('')

  const isOpen = uiState.isOpen
  const selectedType = uiState.selectedType
  const lastRecordFeedback = uiState.lastRecordFeedback ?? ''

  // Persist UI state
  useEffect(() => {
    saveFloatingUiState(uiState)
  }, [uiState])

  // Time Debt: timer tick + reload
  useEffect(() => {
    const reloadActiveTimer = () => setActiveTimer(loadActiveTimeDebtTimer())
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), activeTimer ? 1000 : 30000)
    window.addEventListener('time-debt-active-timer-change', reloadActiveTimer)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('time-debt-active-timer-change', reloadActiveTimer)
    }
  }, [activeTimer])

  // Time Debt: reload recent tasks on log changes
  useEffect(() => {
    const reloadRecentTasks = () => setRecentTasks(loadRecentTaskOptions())
    window.addEventListener(timeDebtLogsChangeEvent, reloadRecentTasks)
    return () => window.removeEventListener(timeDebtLogsChangeEvent, reloadRecentTasks)
  }, [])

  // Time Debt handlers
  const handleTimeDebtStart = () => {
    const result = startQuickTimeDebtTimer(taskTitle, primaryCategory)
    if (!result.ok) {
      setTimeDebtMessage(result.error)
      return
    }
    setActiveTimer(result.timer)
    setTaskTitle('')
    setTimeDebtMessage('')
    setUiState((current) => ({ ...current, lastRecordFeedback: undefined }))
    setTimerNow(Date.now())
  }

  const handleTimeDebtFinish = () => {
    const result = finishQuickTimeDebtTimer()
    if (!result.ok) {
      setTimeDebtMessage(result.error)
      setActiveTimer(null)
      return
    }
    setActiveTimer(null)
    setTimeDebtMessage('')
    setRecentTasks(loadRecentTaskOptions())
    setUiState((current) => ({
      ...current,
      lastRecordFeedback: `已记录：${result.log.title} · ${formatMinutes(result.log.durationMinutes)}`
    }))
    setTimerNow(Date.now())
  }

  // Wealth handlers
  const wealthPatch = (partial: Partial<WealthFormState>) => {
    setWealthForm((current) => ({ ...current, ...partial }))
    if (wealthMessage) setWealthMessage('')
  }

  const handleWealthSave = () => {
    const title = wealthForm.title.trim()
    const amount = Number(wealthForm.amount)

    if (!title) {
      setWealthMessage('名称不能为空')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setWealthMessage('金额必须大于 0')
      return
    }
    if (wealthForm.eventType === 'ongoing_cost' && !wealthForm.cycle) {
      setWealthMessage('持续出血必须选择周期')
      return
    }

    const timestamp = new Date().toISOString()
    let record: WealthRecord

    if (wealthForm.eventType === 'income') {
      const mappedType: WealthRecordType = wealthForm.incomeType === 'other' ? 'real_income' : (wealthForm.incomeType as WealthRecordType)
      record = {
        id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        type: mappedType,
        amount,
        title,
        source: wealthForm.incomeType === 'other' ? '其他收入' : undefined,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    } else if (wealthForm.eventType === 'expense') {
      record = {
        id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        type: 'real_expense',
        amount,
        title,
        category: wealthForm.expenseCategory,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    } else {
      record = {
        id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        type: 'ongoing_cost',
        amount,
        title,
        meta: { cycle: wealthForm.cycle },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    }

    appendWealthRecord(record)

    const typeLabel = wealthEventTypes.find((t) => t.key === wealthForm.eventType)?.label ?? ''
    const amountStr = `¥${Math.round(amount)}`
    setWealthSuccess(`已记录：${typeLabel} · ${title} · ${amountStr}`)
    setWealthForm((current) => ({ ...defaultWealthForm, eventType: current.eventType }))
    setWealthMessage('')
  }

  const resetWealthForm = () => {
    setWealthForm(defaultWealthForm)
    setWealthMessage('')
    setWealthSuccess('')
  }

  const selectType = (type: RecordType) => {
    setUiState((current) => ({ ...current, selectedType: type }))
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] flex-col items-end gap-3 text-[color:var(--text-primary)]">
      {isOpen ? (
        <section className="max-h-[min(620px,calc(100vh-96px))] w-[360px] max-w-full overflow-y-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-4 shadow-panel backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Quick Record</div>
              <h2 className="mt-1 text-base font-semibold">快速记录</h2>
              {selectedType === 'time' && activeTimer ? (
                <div className="mt-1 text-xs text-[color:var(--text-secondary)]">当前状态：计时中</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setUiState((current) => ({ ...current, isOpen: false }))}
              className="rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
            >
              收起
            </button>
          </div>

          {/* Type selector */}
          <div className="mt-4 flex gap-2">
            {recordTypeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => selectType(opt.key)}
                className={
                  selectedType === opt.key
                    ? 'flex-1 rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] py-2 text-sm font-semibold text-[color:var(--text-primary)]'
                    : 'flex-1 rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="mt-2">
            {selectedType === 'time' ? (
              <TimeDebtQuickRecordForm
                taskTitle={taskTitle}
                onTaskTitleChange={setTaskTitle}
                primaryCategory={primaryCategory}
                onPrimaryCategoryChange={setPrimaryCategory}
                activeTimer={activeTimer ? {
                  title: activeTimer.title,
                  primaryCategory: activeTimer.primaryCategory,
                  actualStart: activeTimer.actualStart,
                  startTimestampMs: activeTimer.startTimestampMs
                } : null}
                timerNow={timerNow}
                message={timeDebtMessage}
                onMessageClear={() => setTimeDebtMessage('')}
                recentTasks={recentTasks}
                onStart={handleTimeDebtStart}
                onStop={handleTimeDebtFinish}
                onSelectRecentTask={(task) => {
                  setTaskTitle(task.title)
                  setPrimaryCategory(task.primaryCategory)
                  setTimeDebtMessage('')
                }}
              />
            ) : (
              <WealthQuickRecordForm
                form={wealthForm}
                onFieldChange={wealthPatch}
                message={wealthMessage}
                onMessageClear={() => setWealthMessage('')}
                successFeedback={wealthSuccess}
                onSave={handleWealthSave}
                onReset={resetWealthForm}
              />
            )}
          </div>

          {/* Cross-type last record feedback */}
          {lastRecordFeedback && selectedType === 'time' ? (
            <div className="mt-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-[color:var(--text-secondary)]">
              {lastRecordFeedback}
            </div>
          ) : null}
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setUiState((current) => ({ ...current, isOpen: !current.isOpen }))
          if (!isOpen) setTimerNow(Date.now())
        }}
        className="max-w-[min(260px,calc(100vw-40px))] rounded-full border border-emerald-400/30 bg-emerald-400/95 px-5 py-3 text-sm font-semibold text-slate-950 shadow-panel transition hover:bg-emerald-300"
      >
        {activeTimer && selectedType === 'time'
          ? `计时中 · ${formatElapsedTime(timerNow - activeTimer.startTimestampMs)}`
          : '记录'}
      </button>
    </div>
  )
}

function loadFloatingUiState(): FloatingUiState {
  if (typeof window === 'undefined') {
    return { isOpen: false, selectedType: 'time' }
  }

  try {
    const raw = window.localStorage.getItem(floatUiStorageKey)
    if (!raw) {
      return { isOpen: false, selectedType: 'time' }
    }
    const parsed = JSON.parse(raw) as Partial<FloatingUiState>
    const selectedType = parsed.selectedType === 'wealth' ? 'wealth' : 'time'
    return {
      isOpen: Boolean(parsed.isOpen),
      selectedType,
      lastRecordFeedback: typeof parsed.lastRecordFeedback === 'string' ? parsed.lastRecordFeedback : undefined
    }
  } catch {
    return { isOpen: false, selectedType: 'time' }
  }
}

function saveFloatingUiState(state: FloatingUiState): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(floatUiStorageKey, JSON.stringify(state))
}

function loadRecentTaskOptions(): RecentTaskOption[] {
  const byTitle = new Map<string, RecentTaskOption>()
  for (const log of loadTimeDebtLogs()) {
    const title = log.title.trim()
    if (!title) {
      continue
    }
    const lastUsedAt = log.endTime || log.startTime
    const key = title.toLowerCase()
    const category = normalizePrimaryCategory(log.primaryCategory)
    const current = byTitle.get(key)
    if (!current || lastUsedAt.localeCompare(current.lastUsedAt) > 0) {
      byTitle.set(key, { title, primaryCategory: category, lastUsedAt })
    }
  }

  return Array.from(byTitle.values())
    .sort((left, right) => right.lastUsedAt.localeCompare(left.lastUsedAt))
    .slice(0, recentTaskLimit)
}
