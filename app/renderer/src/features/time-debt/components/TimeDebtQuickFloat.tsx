import { useEffect, useState } from 'react'
import { loadActiveTimeDebtTimer, type ActiveTimeDebtTimer } from '../timeDebtActiveTimerStorage'
import { finishQuickTimeDebtTimer, startQuickTimeDebtTimer } from '../timeDebtQuickTimer'
import { loadTimeDebtLogs, timeDebtLogsChangeEvent } from '../timeDebtStorage'
import { TimeDebtQuickRecordForm, formatElapsedTime, formatMinutes, normalizePrimaryCategory } from './TimeDebtQuickRecordForm'

const floatingUiStorageKey = 'growth-tree-os:time-debt-floating-ui:v1'
const recentTaskLimit = 3

type FloatingUiState = {
  isOpen: boolean
  lastRecordFeedback?: string
}

type RecentTaskOption = {
  title: string
  primaryCategory: string
  lastUsedAt: string
}

export function TimeDebtQuickFloat() {
  const [uiState, setUiState] = useState<FloatingUiState>(() => loadFloatingUiState())
  const [taskTitle, setTaskTitle] = useState('')
  const [primaryCategory, setPrimaryCategory] = useState(normalizePrimaryCategory(undefined))
  const [activeTimer, setActiveTimer] = useState<ActiveTimeDebtTimer | null>(() => loadActiveTimeDebtTimer())
  const [timerNow, setTimerNow] = useState(() => Date.now())
  const [message, setMessage] = useState('')
  const [recentTasks, setRecentTasks] = useState<RecentTaskOption[]>(() => loadRecentTaskOptions())
  const isOpen = uiState.isOpen
  const lastRecordFeedback = uiState.lastRecordFeedback ?? ''

  useEffect(() => {
    const reloadActiveTimer = () => setActiveTimer(loadActiveTimeDebtTimer())
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), activeTimer ? 1000 : 30000)
    window.addEventListener('time-debt-active-timer-change', reloadActiveTimer)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('time-debt-active-timer-change', reloadActiveTimer)
    }
  }, [activeTimer])

  useEffect(() => {
    saveFloatingUiState(uiState)
  }, [uiState])

  useEffect(() => {
    const reloadRecentTasks = () => setRecentTasks(loadRecentTaskOptions())
    window.addEventListener(timeDebtLogsChangeEvent, reloadRecentTasks)
    return () => window.removeEventListener(timeDebtLogsChangeEvent, reloadRecentTasks)
  }, [])

  useEffect(() => {
    return window.growthTree.timeDebt.onOpenQuickFloat(() => {
      setUiState((current) => ({ ...current, isOpen: true }))
      setMessage('已通过快捷键打开')
      setTimerNow(Date.now())
    })
  }, [])

  const handleStart = () => {
    const result = startQuickTimeDebtTimer(taskTitle, primaryCategory)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setActiveTimer(result.timer)
    setTaskTitle('')
    setMessage('')
    setUiState((current) => ({ ...current, lastRecordFeedback: undefined }))
    setTimerNow(Date.now())
  }

  const handleFinish = () => {
    const result = finishQuickTimeDebtTimer()
    if (!result.ok) {
      setMessage(result.error)
      setActiveTimer(null)
      return
    }
    setActiveTimer(null)
    setMessage('')
    setRecentTasks(loadRecentTaskOptions())
    setUiState((current) => ({
      ...current,
      lastRecordFeedback: `已记录：${result.log.title} · ${formatMinutes(result.log.durationMinutes)}`
    }))
    setTimerNow(Date.now())
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] flex-col items-end gap-3 text-[color:var(--text-primary)]">
      {isOpen ? (
        <section className="max-h-[min(620px,calc(100vh-96px))] w-[340px] max-w-full overflow-y-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-4 shadow-panel backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Time Debt</div>
              <h2 className="mt-1 text-base font-semibold">时间控制台</h2>
              <div className="mt-1 text-xs text-[color:var(--text-secondary)]">{activeTimer ? '当前状态：计时中' : '当前状态：空闲'}</div>
            </div>
            <button
              type="button"
              onClick={() => setUiState((current) => ({ ...current, isOpen: false }))}
              className="rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
            >
              收起
            </button>
          </div>

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
            message={message}
            onMessageClear={() => setMessage('')}
            recentTasks={recentTasks}
            onStart={handleStart}
            onStop={handleFinish}
            onSelectRecentTask={(task) => {
              setTaskTitle(task.title)
              setPrimaryCategory(task.primaryCategory)
              setMessage('')
            }}
          />

          {lastRecordFeedback ? (
            <div className="mt-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-[color:var(--text-secondary)]">
              {lastRecordFeedback}
            </div>
          ) : null}
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setUiState((current) => ({ ...current, isOpen: !current.isOpen }))}
        className="max-w-[min(260px,calc(100vw-40px))] rounded-full border border-emerald-400/30 bg-emerald-400/95 px-5 py-3 text-sm font-semibold text-slate-950 shadow-panel transition hover:bg-emerald-300"
      >
        {activeTimer ? `计时中 · ${formatElapsedTime(timerNow - activeTimer.startTimestampMs)}` : '记录'}
      </button>
    </div>
  )
}

function loadFloatingUiState(): FloatingUiState {
  if (typeof window === 'undefined') {
    return { isOpen: false }
  }

  try {
    const raw = window.localStorage.getItem(floatingUiStorageKey)
    if (!raw) {
      return { isOpen: false }
    }
    const parsed = JSON.parse(raw) as Partial<FloatingUiState>
    return {
      isOpen: Boolean(parsed.isOpen),
      lastRecordFeedback: typeof parsed.lastRecordFeedback === 'string' ? parsed.lastRecordFeedback : undefined
    }
  } catch {
    return { isOpen: false }
  }
}

function saveFloatingUiState(state: FloatingUiState): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(floatingUiStorageKey, JSON.stringify(state))
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
    const primaryCategory = normalizePrimaryCategory(log.primaryCategory)
    const current = byTitle.get(key)
    if (!current || lastUsedAt.localeCompare(current.lastUsedAt) > 0) {
      byTitle.set(key, { title, primaryCategory, lastUsedAt })
    }
  }

  return Array.from(byTitle.values())
    .sort((left, right) => right.lastUsedAt.localeCompare(left.lastUsedAt))
    .slice(0, recentTaskLimit)
}
