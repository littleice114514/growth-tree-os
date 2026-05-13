import { useEffect, useState } from 'react'
import { loadActiveTimeDebtTimer, type ActiveTimeDebtTimer } from '../timeDebtActiveTimerStorage'
import { finishQuickTimeDebtTimer, startQuickTimeDebtTimer } from '../timeDebtQuickTimer'

export function TimeDebtQuickFloat() {
  const [isOpen, setIsOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [activeTimer, setActiveTimer] = useState<ActiveTimeDebtTimer | null>(() => loadActiveTimeDebtTimer())
  const [timerNow, setTimerNow] = useState(() => Date.now())
  const [message, setMessage] = useState('')

  useEffect(() => {
    const reloadActiveTimer = () => setActiveTimer(loadActiveTimeDebtTimer())
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), activeTimer ? 1000 : 30000)
    window.addEventListener('time-debt-active-timer-change', reloadActiveTimer)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('time-debt-active-timer-change', reloadActiveTimer)
    }
  }, [activeTimer])

  const handleStart = () => {
    const result = startQuickTimeDebtTimer(taskTitle)
    if (!result.ok) {
      setMessage(result.error)
      return
    }
    setActiveTimer(result.timer)
    setTaskTitle('')
    setMessage('')
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
    setMessage('已生成 Time Debt 记录')
    setTimerNow(Date.now())
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] flex-col items-end gap-3 text-[color:var(--text-primary)]">
      {isOpen ? (
        <section className="w-[320px] max-w-full rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-4 shadow-panel backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Time Debt</div>
              <h2 className="mt-1 text-base font-semibold">快速记录时间</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
            >
              收起
            </button>
          </div>

          {activeTimer ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-accent-green">计时中</div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">{formatElapsedTime(timerNow - activeTimer.startTimestampMs)}</div>
              <div className="mt-2 truncate text-sm font-semibold">{activeTimer.title}</div>
              <div className="mt-1 text-xs text-[color:var(--text-secondary)]">开始于 {formatTimeOnly(activeTimer.actualStart)}</div>
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
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-full border border-emerald-400/30 bg-emerald-400/95 px-5 py-3 text-sm font-semibold text-slate-950 shadow-panel transition hover:bg-emerald-300"
      >
        {activeTimer ? formatElapsedTime(timerNow - activeTimer.startTimestampMs) : '记录'}
      </button>
    </div>
  )
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

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}
