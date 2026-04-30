import type { CalendarBlock, CalendarDragPreview, PositionedCalendarBlock } from './calendarTypes'
import { formatMinutesAsTime, timeToTop } from './calendarTimePositionUtils'

export function CalendarEventBlock({
  block,
  selected,
  dragPreview,
  onSelect,
  onDragStart
}: {
  block: PositionedCalendarBlock
  selected: boolean
  dragPreview: CalendarDragPreview
  onSelect: (block: CalendarBlock) => void
  onDragStart: (block: CalendarBlock, clientY: number) => void
}) {
  const style = {
    top: block.top,
    height: block.height,
    left: `calc(4px + (100% - 8px) * ${block.leftPercent / 100})`,
    width: `calc((100% - 8px) * ${block.widthPercent / 100})`
  }
  const blockClass =
    block.status === 'planned'
      ? 'border-dashed border-amber-400/45 bg-amber-400/10'
      : block.status === 'active'
        ? 'border-emerald-400/45 bg-emerald-400/18 shadow-[0_12px_28px_rgba(16,185,129,0.14)]'
        : block.status === 'missed'
          ? 'border-rose-400/35 bg-rose-400/10'
          : categoryBlockClass(block.primaryCategory)

  return (
    <>
      <button
        type="button"
        className={`absolute z-20 cursor-grab overflow-hidden rounded-lg border border-l-4 p-2 text-left text-[color:var(--text-primary)] transition active:cursor-grabbing hover:z-30 hover:ring-1 hover:ring-white/20 ${selected ? 'z-40 ring-2 ring-[color:var(--node-selected-border)]' : ''} ${blockClass}`}
        style={style}
        title={`${block.title} / ${block.meta}`}
        onClick={() => onSelect(block)}
        onMouseDown={(event) => {
          if (event.button !== 0) return
          onDragStart(block, event.clientY)
        }}
      >
        <div className="truncate text-xs font-semibold">{block.title}</div>
        <div className="mt-1 truncate text-[10px] tabular-nums opacity-80">
          {formatTimeOnly(block.startTime)} - {formatTimeOnly(block.endTime)}
        </div>
        <div className="mt-1 truncate text-[10px] opacity-75">{calendarStatusLabel(block.status)}</div>
        <div className="mt-1 truncate text-[10px] opacity-70">{block.primaryCategory} / {block.secondaryProject}</div>
      </button>
      {dragPreview?.blockId === block.id ? (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-[color:var(--node-selected-border)] bg-cyan-300/20 shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
          style={{
            top: timeToTop(dragPreview.startMinutes, { visibleStartHour: 0, visibleEndHour: 24, pixelsPerMinute: 0.8, minuteStep: 30, showHalfHourLine: true, minEventHeight: 24, snapMinutes: 15 }),
            height: Math.max((dragPreview.endMinutes - dragPreview.startMinutes) * 0.8, 24),
            left: style.left,
            width: style.width
          }}
        >
          <span className="absolute left-2 top-1 text-[10px] tabular-nums text-cyan-50">{formatMinutesAsTime(dragPreview.startMinutes)} - {formatMinutesAsTime(dragPreview.endMinutes)}</span>
        </div>
      ) : null}
    </>
  )
}

export function calendarStatusLabel(status: CalendarBlock['status']): string {
  return {
    planned: 'Planned',
    active: 'Active',
    completed: 'Completed',
    missed: 'Missed'
  }[status]
}

export function formatTimeOnly(value: string): string {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(11, 16) || value
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function categoryBlockClass(category: string): string {
  if (category.includes('学习')) return 'border-emerald-300/40 bg-emerald-300/12'
  if (category.includes('运动')) return 'border-lime-300/40 bg-lime-300/12'
  if (category.includes('娱乐') || category.includes('空转')) return 'border-violet-300/35 bg-violet-300/12'
  if (category.includes('生活')) return 'border-sky-300/35 bg-sky-300/12'
  return 'border-cyan-300/40 bg-cyan-300/12'
}
