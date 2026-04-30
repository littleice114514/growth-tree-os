import type { CalendarViewMode } from './calendarTypes'

const viewLabels: Record<CalendarViewMode, string> = {
  day: '日',
  week: '周',
  month: '月',
  customDays: '天数'
}

const buttonClass = 'rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:text-[color:var(--text-primary)]'
const activeClass = 'rounded-full border border-[color:var(--node-selected-border)] bg-[var(--node-selected-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-primary)]'

export function CalendarViewSwitcher({
  mode,
  customDayCount,
  onModeChange,
  onCustomDayCountChange
}: {
  mode: CalendarViewMode
  customDayCount: number
  onModeChange: (mode: CalendarViewMode) => void
  onCustomDayCountChange: (count: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(viewLabels) as CalendarViewMode[]).map((viewMode) => (
        <button key={viewMode} type="button" onClick={() => onModeChange(viewMode)} className={mode === viewMode ? activeClass : buttonClass}>
          {viewLabels[viewMode]}
        </button>
      ))}
      {mode === 'customDays' ? (
        <select
          value={customDayCount}
          onChange={(event) => onCustomDayCountChange(Number(event.target.value))}
          className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-primary)] outline-none"
        >
          {Array.from({ length: 8 }, (_, index) => index + 2).map((count) => (
            <option key={count} value={count}>{count} 天</option>
          ))}
        </select>
      ) : null}
    </div>
  )
}
