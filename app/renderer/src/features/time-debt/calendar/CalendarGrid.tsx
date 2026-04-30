import type { CalendarBlock, CalendarDragPreview, CalendarTimeScale } from './calendarTypes'
import { formatDateKey, formatMonthDay, weekDayLabel } from './calendarDateUtils'
import { CalendarGridLines, CalendarTimeAxis } from './CalendarTimeAxis'
import { CalendarEventBlock } from './CalendarEventBlock'
import { layoutOverlappingEvents } from './calendarOverlapLayoutUtils'
import { minutesFromDate, positionCalendarBlock, timeToTop, visibleGridHeight } from './calendarTimePositionUtils'

export function CalendarGrid({
  days,
  blocks,
  todayKey,
  now,
  scale,
  selectedBlockId,
  dragPreview,
  onSelectBlock,
  onDragStart
}: {
  days: Date[]
  blocks: CalendarBlock[]
  todayKey: string
  now: Date
  scale: CalendarTimeScale
  selectedBlockId: string | null
  dragPreview: CalendarDragPreview
  onSelectBlock: (block: CalendarBlock) => void
  onDragStart: (block: CalendarBlock, clientY: number) => void
}) {
  const dayTemplate = `72px repeat(${days.length}, minmax(112px, 1fr))`
  const gridHeight = visibleGridHeight(scale)
  const positionedBlocks = layoutOverlappingEvents(blocks)
  return (
    <div className="max-h-[760px] overflow-auto rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
      <div className="sticky top-0 z-40 grid border-b border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)]" style={{ minWidth: Math.max(520, 72 + days.length * 126), gridTemplateColumns: dayTemplate }}>
        <div className="px-3 py-3 text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Time</div>
        {days.map((day) => {
          const dayKey = formatDateKey(day)
          return (
            <div key={dayKey} className={`border-l border-[color:var(--panel-border)]/45 px-3 py-3 ${dayKey === todayKey ? 'bg-emerald-400/10' : ''}`}>
              <div className="text-[11px] text-[color:var(--text-muted)]">{weekDayLabel(day)}</div>
              <div className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{formatMonthDay(day)}</div>
            </div>
          )
        })}
      </div>
      <div className="relative grid" style={{ height: gridHeight, minWidth: Math.max(520, 72 + days.length * 126), gridTemplateColumns: dayTemplate }}>
        <CalendarTimeAxis scale={scale} />
        {days.map((day) => {
          const dayKey = formatDateKey(day)
          const dayBlocks = positionedBlocks.filter((block) => block.dayKey === dayKey)
          return (
            <div key={dayKey} className={`relative border-l border-[color:var(--panel-border)]/35 ${dayKey === todayKey ? 'bg-emerald-400/5' : ''}`}>
              <CalendarGridLines scale={scale} />
              {dayBlocks.map((block) => {
                const positioned = positionCalendarBlock(block, dayKey, scale)
                return positioned ? (
                  <CalendarEventBlock
                    key={positioned.id}
                    block={positioned}
                    selected={selectedBlockId === positioned.id}
                    dragPreview={dragPreview}
                    onSelect={onSelectBlock}
                    onDragStart={onDragStart}
                  />
                ) : null
              })}
              {dayKey === todayKey ? (
                <div className="absolute left-0 right-0 z-30 border-t border-rose-300/80" style={{ top: timeToTop(minutesFromDate(now), scale) }}>
                  <span className="absolute -top-3 left-1 rounded-full border border-rose-300/50 bg-rose-400/20 px-2 py-0.5 text-[10px] tabular-nums text-rose-100">
                    {formatNow(now)}
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
        {blocks.length === 0 ? (
          <div className="absolute left-[92px] right-5 top-8 rounded-2xl border border-dashed border-[color:var(--panel-border)] p-5 text-sm text-[color:var(--text-muted)]">
            当前范围还没有时间块。先补记、规划或开始计时。
          </div>
        ) : null}
      </div>
    </div>
  )
}

function formatNow(now: Date): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}
