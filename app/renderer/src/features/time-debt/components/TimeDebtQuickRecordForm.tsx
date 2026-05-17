import { getPrimaryCategories, normalizeTimeDebtPrimaryCategory } from '../timeDebtTaskCatalog'

const primaryCategoryOptions = getPrimaryCategories()
const defaultPrimaryCategory = '学习'

type RecentTaskOption = {
  title: string
  primaryCategory: string
  lastUsedAt: string
}

type ActiveTimerDisplay = {
  title: string
  primaryCategory: string
  actualStart: string
  startTimestampMs: number
}

export type TimeDebtQuickRecordFormProps = {
  taskTitle: string
  onTaskTitleChange: (value: string) => void
  primaryCategory: string
  onPrimaryCategoryChange: (value: string) => void
  activeTimer: ActiveTimerDisplay | null
  timerNow: number
  message: string
  onMessageClear: () => void
  recentTasks: RecentTaskOption[]
  onStart: () => void
  onStop: () => void
  onSelectRecentTask: (task: RecentTaskOption) => void
}

export function TimeDebtQuickRecordForm({
  taskTitle,
  onTaskTitleChange,
  primaryCategory,
  onPrimaryCategoryChange,
  activeTimer,
  timerNow,
  message,
  onMessageClear,
  recentTasks,
  onStart,
  onStop,
  onSelectRecentTask
}: TimeDebtQuickRecordFormProps) {
  return (
    <div className="mt-4">
      {activeTimer ? (
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-accent-green">当前计时</div>
          <div className="mt-2 break-words text-sm font-semibold leading-5">正在记录：{activeTimer.title}</div>
          <div className="mt-2 grid gap-1 text-xs text-[color:var(--text-secondary)]">
            <div>分类：{normalizePrimaryCategory(activeTimer.primaryCategory)}</div>
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
            onClick={onStop}
            className="mt-3 w-full rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
          >
            结束计时
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-xs text-[color:var(--text-secondary)]">任务名称</span>
            <input
              value={taskTitle}
              onChange={(event) => {
                onTaskTitleChange(event.target.value)
                if (message) {
                  onMessageClear()
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onStart()
                }
              }}
              placeholder="这次在做什么"
              className="w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-xs text-[color:var(--text-secondary)]">一级分类</span>
            <select
              value={primaryCategory}
              onChange={(event) => {
                onPrimaryCategoryChange(normalizePrimaryCategory(event.target.value))
                if (message) {
                  onMessageClear()
                }
              }}
              className="w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]"
            >
              {primaryCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          {recentTasks.length > 0 ? (
            <div className="grid gap-2">
              <div className="text-xs text-[color:var(--text-secondary)]">最近任务</div>
              <div className="flex flex-wrap gap-2">
                {recentTasks.map((task) => (
                  <button
                    key={`${task.title}-${task.lastUsedAt}`}
                    type="button"
                    onClick={() => onSelectRecentTask(task)}
                    className="max-w-full truncate rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
                    title={`${task.title} / ${task.primaryCategory}`}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onStart}
            className="rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
          >
            开始计时
          </button>
        </div>
      )}

      {message ? <div className="mt-3 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2 text-xs text-[color:var(--text-secondary)]">{message}</div> : null}
    </div>
  )
}

export function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${padDatePart(hours)}:${padDatePart(minutes)}:${padDatePart(seconds)}`
}

export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} 分钟`
}

function formatTimeOnly(value: string): string {
  return value ? value.slice(11, 16) : '--:--'
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

export function normalizePrimaryCategory(value: string | undefined): string {
  return normalizeTimeDebtPrimaryCategory(value)
}
