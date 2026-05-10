import type { CalendarBlock, CalendarDragPreview, CalendarResizeEdge, CalendarResizePreview, CalendarTimeScale } from './calendarTypes'
import { formatDateKey, formatMonthDay, weekDayLabel } from './calendarDateUtils'
import { CalendarGridLines, CalendarTimeAxis } from './CalendarTimeAxis'
import { CalendarEventBlock } from './CalendarEventBlock'
import { layoutOverlappingEvents } from './calendarOverlapLayoutUtils'
import { formatMinutesAsTime, minutesFromDate, positionCalendarBlock, timeToTop, visibleGridHeight } from './calendarTimePositionUtils'

export function CalendarGrid({
  days,
  blocks,
  todayKey,
  now,
  scale,
  selectedBlockId,
  dragPreview,
  resizePreview,
  onSelectBlock,
  onDragStart,
  onResizeStart,
  onClearSelection
}: {
  days: Date[]
  blocks: CalendarBlock[]
  todayKey: string
  now: Date
  scale: CalendarTimeScale
  selectedBlockId: string | null
  dragPreview: CalendarDragPreview
  resizePreview: CalendarResizePreview
  onSelectBlock: (block: CalendarBlock) => void
  onDragStart: (block: CalendarBlock, drag: { originClientX: number; originClientY: number; currentClientX: number; currentClientY: number; dayColumnWidth: number; dayIndex: number; columnCount: number }) => void
  onResizeStart: (block: CalendarBlock, edge: CalendarResizeEdge, originClientY: number) => void
  onClearSelection: () => void
}) {
  const dayTemplate = `72px repeat(${days.length}, minmax(112px, 1fr))`
  const gridHeight = visibleGridHeight(scale)
  const positionedBlocks = layoutOverlappingEvents(blocks)
  const todayIndex = days.findIndex((day) => formatDateKey(day) === todayKey)
  return (
    <div className="max-h-[760px] overflow-auto rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]">
      <div className="sticky top-0 z-40 grid border-b border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)]" style={{ minWidth: Math.max(520, 72 + days.length * 126), gridTemplateColumns: dayTemplate }}>
        <div className="px-3 py-3 text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Time</div>
        {days.map((day) => {
          const dayKey = formatDateKey(day)
          return (
            <div key={dayKey} className={`border-l border-[color:var(--panel-border)]/45 px-3 py-3 ${dayKey === todayKey ? 'bg-sky-300/[0.06]' : ''}`}>
              <div className="text-[11px] text-[color:var(--text-muted)]">{weekDayLabel(day)}</div>
              <div className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">{formatMonthDay(day)}</div>
            </div>
          )
        })}
      </div>
      {blocks.length === 0 ? (
        <div className="border-b border-[color:var(--panel-border)]/35 bg-[var(--panel-bg-strong)]/70 px-4 py-2 text-xs text-[color:var(--text-muted)]">
          当前范围暂无时间块
        </div>
      ) : null}
      <div className="relative grid" style={{ height: gridHeight, minWidth: Math.max(520, 72 + days.length * 126), gridTemplateColumns: dayTemplate }}>
        <CalendarTimeAxis scale={scale} />
        {days.map((day, dayIndex) => {
          const dayKey = formatDateKey(day)
          const dayBlocks = positionedBlocks.filter((block) => block.dayKey === dayKey)
          return (
            <div
              key={dayKey}
              data-calendar-day-column="true"
              className={`relative border-l border-[color:var(--panel-border)]/30 ${dayKey === todayKey ? 'bg-sky-300/[0.035]' : ''}`}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  onClearSelection()
                }
              }}
            >
              <CalendarGridLines scale={scale} />
              {dayBlocks.map((block) => {
                const positioned = positionCalendarBlock(block, dayKey, scale)
                return positioned ? (
                  <CalendarEventBlock
                    key={positioned.id}
                    block={positioned}
                    selected={selectedBlockId === positioned.id}
                    dragPreview={dragPreview}
                    resizePreview={resizePreview}
                    dayIndex={dayIndex}
                    columnCount={days.length}
                    onSelect={onSelectBlock}
                    onDragStart={onDragStart}
                    onResizeStart={onResizeStart}
                  />
                ) : null
              })}
              {dragPreview?.dayKey === dayKey ? (
                <div
                  className="pointer-events-none absolute z-50 rounded-lg border border-sky-300/80 bg-sky-300/20 shadow-[0_0_0_1px_rgba(125,211,252,0.35)]"
                  style={{
                    top: timeToTop(dragPreview.startMinutes, scale),
                    height: Math.max((dragPreview.endMinutes - dragPreview.startMinutes) * scale.pixelsPerMinute, scale.minEventHeight),
                    left: 4,
                    right: 4
                  }}
                >
                  <span className="absolute left-2 top-1 truncate text-[10px] tabular-nums text-sky-50">{formatMinutesAsTime(dragPreview.startMinutes)} - {formatMinutesAsTime(dragPreview.endMinutes)}</span>
                </div>
              ) : null}
              {resizePreview?.dayKey === dayKey ? (
                <div
                  className="pointer-events-none absolute z-50 rounded-lg border border-rose-300/80 bg-rose-300/18 shadow-[0_0_0_1px_rgba(253,164,175,0.3)]"
                  style={{
                    top: timeToTop(resizePreview.startMinutes, scale),
                    height: Math.max((resizePreview.endMinutes - resizePreview.startMinutes) * scale.pixelsPerMinute, scale.minEventHeight),
                    left: 4,
                    right: 4
                  }}
                >
                  <span className="absolute left-2 top-1 truncate text-[10px] tabular-nums text-rose-50">{formatMinutesAsTime(resizePreview.startMinutes)} - {formatMinutesAsTime(resizePreview.endMinutes)}</span>
                </div>
              ) : null}
            </div>
          )
        })}
        {todayIndex >= 0 ? <CalendarCurrentTimeLine now={now} scale={scale} dayCount={days.length} todayIndex={todayIndex} /> : null}
      </div>
    </div>
  )
}

function CalendarCurrentTimeLine({
  now,
  scale,
  dayCount,
  todayIndex
}: {
  now: Date
  scale: Parameters<typeof timeToTop>[1]
  dayCount: number
  todayIndex: number
}) {
  const top = timeToTop(minutesFromDate(now), scale)
  const dayWidthExpression = `(100% - 72px) / ${Math.max(dayCount, 1)}`
  return (
    <div className="pointer-events-none absolute left-0 right-0 z-[60]" style={{ top }}>
      <div className="absolute left-1 w-[66px] -translate-y-1/2 rounded-sm bg-[var(--panel-bg-strong)]/90 pr-1.5 text-right text-[10px] font-medium tabular-nums text-rose-300">
        {formatCurrentTime(now)}
      </div>
      <div className="absolute left-[72px] right-0 border-t border-rose-400/75" />
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 shadow-[0_0_0_2px_rgba(251,113,133,0.16)]"
        style={{ left: `calc(72px + (${dayWidthExpression}) * ${todayIndex} + (${dayWidthExpression}) / 2)` }}
      />
    </div>
  )
}

function formatCurrentTime(now: Date): string {
  const minutes = now.getMinutes()
  const rawHour = now.getHours()
  const suffix = rawHour >= 12 ? 'PM' : 'AM'
  const hour = rawHour % 12 || 12
  return `${hour}:${String(minutes).padStart(2, '0')}${suffix}`
}
