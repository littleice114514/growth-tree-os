import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/app/store'
import { useThemeMode } from '@/app/theme'
import type { WorkspaceView } from '@/types/ui'
import { loadActiveTimeDebtTimer, type ActiveTimeDebtTimer } from '@/features/time-debt/timeDebtActiveTimerStorage'

const workspaceViews: Array<[WorkspaceView, string]> = [
  ['timeDebt', '时间负债'],
  ['wealth', '财富'],
  ['reviews', '复盘记录'],
  ['reminders', '提醒'],
  ['weeklyReview', 'Review'],
  ['settings', '设置']
]

const workspaceTitles: Partial<Record<WorkspaceView, string>> = {
  wealth: '财富操作系统',
  timeDebt: '时间负债',
  reviews: '复盘记录',
  reminders: '提醒工作台',
  weeklyReview: 'Review',
  settings: '设置'
}

export function Toolbar() {
  const { themeMode, toggleTheme } = useThemeMode()
  const currentView = useWorkspaceStore((state) => state.currentView)
  const setCurrentView = useWorkspaceStore((state) => state.setCurrentView)
  const [activeTimer, setActiveTimer] = useState<ActiveTimeDebtTimer | null>(() => loadActiveTimeDebtTimer())
  const [timerNow, setTimerNow] = useState(() => Date.now())

  useEffect(() => {
    const reloadActiveTimer = () => setActiveTimer(loadActiveTimeDebtTimer())
    const intervalId = window.setInterval(() => setTimerNow(Date.now()), activeTimer ? 1000 : 30000)
    window.addEventListener('time-debt-active-timer-change', reloadActiveTimer)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('time-debt-active-timer-change', reloadActiveTimer)
    }
  }, [activeTimer])

  return (
    <header className="relative flex items-center justify-between rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="flex min-w-0 items-center gap-5">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">growth tree os</div>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[color:var(--text-primary)]">{workspaceTitles[currentView] ?? workspaceTitles.timeDebt}</h1>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-accent-green">
              Desktop / Local-first
            </span>
          </div>
        </div>
        <nav className="flex items-center rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] p-1">
          {workspaceViews.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => void setCurrentView(id)}
              className={
                currentView === id
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-1.5 text-sm text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'
                  : 'rounded-xl border border-transparent px-3 py-1.5 text-sm text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {activeTimer ? (
          <button
            type="button"
            onClick={() => void setCurrentView('timeDebt')}
            className="hidden max-w-[260px] rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-left text-xs text-accent-green transition hover:bg-emerald-400/15 xl:block"
            title="回到 Time Debt"
          >
            <span className="block truncate">正在计时：{activeTimer.title}</span>
            <span className="mt-0.5 block font-semibold tabular-nums">{formatElapsedTime(timerNow - activeTimer.startTimestampMs)}</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
          title={themeMode === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
        >
          {themeMode === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  )
}

function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${padDatePart(hours)}:${padDatePart(minutes)}:${padDatePart(seconds)}`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}
