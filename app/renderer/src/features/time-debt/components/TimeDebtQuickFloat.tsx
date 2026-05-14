import { useEffect, useState } from 'react'
import { loadActiveTimeDebtTimer, type ActiveTimeDebtTimer } from '../timeDebtActiveTimerStorage'
import { finishQuickTimeDebtTimer, startQuickTimeDebtTimer } from '../timeDebtQuickTimer'
import { loadTimeDebtLogs, timeDebtLogsChangeEvent } from '../timeDebtStorage'

const floatingUiStorageKey = 'growth-tree-os:time-debt-floating-ui:v1'
const recentTaskLimit = 3

type FloatingUiState = {
  isOpen: boolean
  lastRecordFeedback?: string
}

type RecentTaskOption = {
  title: string
  lastUsedAt: string
}

export function TimeDebtQuickFloat() {
  const [uiState, setUiState] = useState<FloatingUiState>(() => loadFloatingUiState())
  const [taskTitle, setTaskTitle] = useState('')
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

  const handleStart = () => {
    const result = startQuickTimeDebtTimer(taskTitle)
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

          {activeTimer ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-accent-green">当前计时</div>
              <div className="mt-2 break-words text-sm font-semibold leading-5">正在记录：{activeTimer.title}</div>
              <div className="mt-2 grid gap-1 text-xs text-[color:var(--text-secondary)]">
                <div>开始：{formatTimeOnly(activeTimer.actualStart)}</div>
                <div>
                  已用时：
                  <span className="ml-1 text-lg font-semibold tabular-nums text-[color:var(--text-primary)]">
                    {formatElapsedTime(timerNow - activeTimer.startTimestampMs)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="mt-3 w-full rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
              >
                结束计时
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="text-xs text-[color:var(--text-secondary)]">任务名称</span>
                <input
                  value={taskTitle}
                  onChange={(event) => {
                    setTaskTitle(event.target.value)
                    if (message) {
                      setMessage('')
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleStart()
                    }
                  }}
                  placeholder="这次在做什么"
                  className="w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]"
                />
              </label>
              {recentTasks.length > 0 ? (
                <div className="grid gap-2">
                  <div className="text-xs text-[color:var(--text-secondary)]">最近任务</div>
                  <div className="flex flex-wrap gap-2">
                    {recentTasks.map((task) => (
                      <button
                        key={`${task.title}-${task.lastUsedAt}`}
                        type="button"
                        onClick={() => {
                          setTaskTitle(task.title)
                          setMessage('')
                        }}
                        className="max-w-full truncate rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleStart}
                className="rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
              >
                开始计时
              </button>
            </div>
          )}

          {message ? <div className="mt-3 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2 text-xs text-[color:var(--text-secondary)]">{message}</div> : null}
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
    const current = byTitle.get(key)
    if (!current || lastUsedAt.localeCompare(current.lastUsedAt) > 0) {
      byTitle.set(key, { title, lastUsedAt })
    }
  }

  return Array.from(byTitle.values())
    .sort((left, right) => right.lastUsedAt.localeCompare(left.lastUsedAt))
    .slice(0, recentTaskLimit)
}

function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${padDatePart(hours)}:${padDatePart(minutes)}:${padDatePart(seconds)}`
}

function formatTimeOnly(value: string): string {
  return value ? value.slice(11, 16) : '--:--'
}

function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} 分钟`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}
