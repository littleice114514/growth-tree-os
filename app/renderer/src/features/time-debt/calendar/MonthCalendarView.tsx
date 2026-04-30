import type { CalendarBlock } from './calendarTypes'
import { formatDateKey, formatMonthDay, isSameMonth, parseDateKey, weekDayLabel } from './calendarDateUtils'
import { calendarStatusLabel, formatTimeOnly } from './CalendarEventBlock'

export function MonthCalendarView({
  days,
  anchorDateKey,
  blocks,
  todayKey,
  selectedBlockId,
  onSelectBlock,
  onSelectDay
}: {
  days: Date[]
  anchorDateKey: string
  blocks: CalendarBlock[]
  todayKey: string
  selectedBlockId: string | null
  onSelectBlock: (block: CalendarBlock) => void
  onSelectDay: (dateKey: string) => void
}) {
  const monthDate = parseDateKey(anchorDateKey)
  const weeks = chunkDays(days)
  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
      <div className="grid grid-cols-7 border-b border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)]">
        {days.slice(0, 7).map((day) => (
          <div key={weekDayLabel(day)} className="px-3 py-3 text-xs font-medium text-[color:var(--text-muted)]">{weekDayLabel(day)}</div>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(118px, 1fr))` }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-[color:var(--panel-border)]/45 last:border-b-0">
            {week.map((day) => {
              const dayKey = formatDateKey(day)
              const dayBlocks = blocks.filter((block) => block.dayKey === dayKey).sort((a, b) => a.startTime.localeCompare(b.startTime))
              const visibleBlocks = dayBlocks.slice(0, 3)
              const overflowCount = Math.max(0, dayBlocks.length - visibleBlocks.length)
              const inMonth = isSameMonth(day, monthDate)
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => onSelectDay(dayKey)}
                  className={`min-h-[118px] border-r border-[color:var(--panel-border)]/30 p-2 text-left align-top transition hover:bg-white/[0.03] last:border-r-0 ${inMonth ? '' : 'opacity-45'} ${dayKey === todayKey ? 'bg-sky-300/[0.05]' : ''}`}
                >
                  <div className={`mb-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${dayKey === todayKey ? 'bg-sky-300/15 text-sky-100 ring-1 ring-sky-300/25' : 'text-[color:var(--text-primary)]'}`}>
                    {formatMonthDay(day).slice(3)}
                  </div>
                  <div className="space-y-1">
                    {visibleBlocks.map((block) => (
                      <span
                        key={block.id}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation()
                          onSelectBlock(block)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.stopPropagation()
                            onSelectBlock(block)
                          }
                        }}
                        className={`block rounded-md border px-2 py-1 text-[10px] leading-4 ${selectedBlockId === block.id ? 'border-[color:var(--node-selected-border)] bg-[var(--node-selected-bg)]' : statusMonthClass(block.status)}`}
                        title={`${calendarStatusLabel(block.status)} / ${block.title}`}
                      >
                        <span className="mr-1 tabular-nums opacity-75">{formatTimeOnly(block.startTime)}</span>
                        <span className="font-medium">{block.title}</span>
                      </span>
                    ))}
                    {overflowCount > 0 ? <div className="px-1 text-[10px] text-[color:var(--text-muted)]">+{overflowCount}</div> : null}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function chunkDays(days: Date[]): Date[][] {
  const chunks: Date[][] = []
  for (let index = 0; index < days.length; index += 7) {
    chunks.push(days.slice(index, index + 7))
  }
  return chunks
}

function statusMonthClass(status: CalendarBlock['status']): string {
  return {
    planned: 'border-amber-400/25 bg-amber-400/10 text-[color:var(--text-primary)]',
    active: 'border-emerald-400/35 bg-emerald-400/15 text-[color:var(--text-primary)]',
    completed: 'border-cyan-300/25 bg-cyan-300/10 text-[color:var(--text-primary)]',
    missed: 'border-rose-400/25 bg-rose-400/10 text-[color:var(--text-primary)]'
  }[status]
}
