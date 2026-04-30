import { useRef } from 'react'
import type { CalendarBlock, CalendarDragPreview, PositionedCalendarBlock } from './calendarTypes'

const CLICK_DRAG_THRESHOLD_PX = 3

export function CalendarEventBlock({
  block,
  selected,
  dragPreview,
  dayIndex,
  columnCount,
  onSelect,
  onDragStart
}: {
  block: PositionedCalendarBlock
  selected: boolean
  dragPreview: CalendarDragPreview
  dayIndex: number
  columnCount: number
  onSelect: (block: CalendarBlock) => void
  onDragStart: (block: CalendarBlock, drag: { originClientX: number; originClientY: number; currentClientX: number; currentClientY: number; dayColumnWidth: number; dayIndex: number; columnCount: number }) => void
}) {
  const interactionRef = useRef<{ originClientX: number; originClientY: number; startedDrag: boolean } | null>(null)
  const style = {
    top: block.top,
    height: block.height,
    left: `calc(4px + (100% - 8px) * ${block.leftPercent / 100})`,
    width: `calc((100% - 8px) * ${block.widthPercent / 100} - 2px)`
  }
  const blockClass =
    block.status === 'planned'
      ? 'border-dashed border-amber-400/45 bg-amber-400/10'
      : block.status === 'active'
        ? 'border-emerald-400/45 bg-emerald-400/18 shadow-[0_12px_28px_rgba(16,185,129,0.14)]'
        : block.status === 'missed'
          ? 'border-rose-400/35 bg-rose-400/10'
          : categoryBlockClass(block.primaryCategory)
  const showTimeRange = block.height >= 34
  const showStatus = block.height >= 58
  const canDrag = block.status !== 'active'
  const isDragging = dragPreview?.blockId === block.id

  return (
      <button
        type="button"
        className={`absolute z-20 overflow-hidden rounded-lg border border-l-4 px-2 py-1.5 text-left text-[color:var(--text-primary)] transition hover:z-30 hover:ring-1 hover:ring-white/20 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${selected ? 'z-40 ring-2 ring-sky-300/80' : ''} ${isDragging ? 'opacity-45' : ''} ${blockClass}`}
        style={style}
        title={`${block.title} / ${block.meta}${canDrag ? '' : ' / Active tasks cannot be dragged'}`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onMouseDown={(event) => {
          if (event.button !== 0) return
          event.preventDefault()
          event.stopPropagation()
          interactionRef.current = {
            originClientX: event.clientX,
            originClientY: event.clientY,
            startedDrag: false
          }
          const dayColumn = event.currentTarget.closest('[data-calendar-day-column="true"]') as HTMLElement | null
          const dayColumnWidth = dayColumn?.getBoundingClientRect().width ?? event.currentTarget.getBoundingClientRect().width
          const handleMove = (moveEvent: MouseEvent) => {
            const interaction = interactionRef.current
            if (!interaction || interaction.startedDrag || !canDrag) return
            const deltaX = moveEvent.clientX - interaction.originClientX
            const deltaY = moveEvent.clientY - interaction.originClientY
            if (Math.hypot(deltaX, deltaY) < CLICK_DRAG_THRESHOLD_PX) return
            interaction.startedDrag = true
            onDragStart(block, {
              originClientX: interaction.originClientX,
              originClientY: interaction.originClientY,
              currentClientX: moveEvent.clientX,
              currentClientY: moveEvent.clientY,
              dayColumnWidth,
              dayIndex,
              columnCount
            })
          }
          const handleUp = () => {
            const interaction = interactionRef.current
            if (interaction && !interaction.startedDrag) {
              onSelect(block)
            }
            interactionRef.current = null
            window.removeEventListener('mousemove', handleMove)
          }
          window.addEventListener('mousemove', handleMove)
          window.addEventListener('mouseup', handleUp, { once: true })
        }}
      >
        <div className="truncate text-xs font-semibold">{block.title}</div>
        {showTimeRange ? (
          <div className="mt-0.5 truncate text-[10px] tabular-nums opacity-80">
            {formatTimeOnly(block.startTime)} - {formatTimeOnly(block.endTime)}
          </div>
        ) : null}
        {showStatus ? <div className="mt-0.5 inline-flex max-w-full truncate rounded-full border border-current/15 px-1.5 py-0.5 text-[9px] uppercase opacity-75">{calendarStatusLabel(block.status)}</div> : null}
      </button>
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
