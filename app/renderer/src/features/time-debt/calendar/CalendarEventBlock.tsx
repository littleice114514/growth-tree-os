import { useRef } from 'react'
import type { CalendarBlock, CalendarDragPreview, CalendarResizeEdge, CalendarResizePreview, PositionedCalendarBlock } from './calendarTypes'

const CLICK_DRAG_THRESHOLD_PX = 3
const RESIZE_HIT_AREA_PX = 12

export function CalendarEventBlock({
  block,
  selected,
  dragPreview,
  resizePreview,
  dayIndex,
  columnCount,
  onSelect,
  onDragStart,
  onResizeStart
}: {
  block: PositionedCalendarBlock
  selected: boolean
  dragPreview: CalendarDragPreview
  resizePreview: CalendarResizePreview
  dayIndex: number
  columnCount: number
  onSelect: (block: CalendarBlock) => void
  onDragStart: (block: CalendarBlock, drag: { originClientX: number; originClientY: number; currentClientX: number; currentClientY: number; dayColumnWidth: number; dayIndex: number; columnCount: number }) => void
  onResizeStart: (block: CalendarBlock, edge: CalendarResizeEdge, originClientY: number) => void
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
      ? 'border-dashed border-amber-500/55 border-l-amber-500 bg-amber-100/80 text-amber-950 shadow-[0_8px_20px_rgba(180,83,9,0.08)] dark:bg-amber-300/16 dark:text-amber-50'
      : block.status === 'active'
        ? 'border-emerald-600/45 border-l-emerald-600 bg-emerald-100/85 text-emerald-950 shadow-[0_12px_28px_rgba(16,185,129,0.12)] dark:bg-emerald-300/18 dark:text-emerald-50'
        : block.status === 'missed'
          ? 'border-rose-500/45 border-l-rose-500 bg-rose-100/85 text-rose-950 shadow-[0_8px_20px_rgba(225,29,72,0.08)] dark:bg-rose-300/14 dark:text-rose-50'
          : 'border-sky-600/40 border-l-sky-600 bg-sky-100/85 text-sky-950 shadow-[0_8px_20px_rgba(2,132,199,0.08)] dark:bg-sky-300/14 dark:text-sky-50'
  const showTimeRange = block.height >= 34
  const showStatus = block.height >= 58
  const canDrag = block.status !== 'active' && !block.isDailySegment
  const canResize = block.status !== 'active' && !block.isDailySegment
  const isDragging = dragPreview?.blockId === block.id
  const isResizing = resizePreview?.blockId === block.id

  return (
      <button
        type="button"
        className={`absolute z-20 overflow-hidden rounded-lg border border-l-4 px-2 py-1.5 text-left transition hover:z-30 hover:ring-1 hover:ring-sky-300/35 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${selected ? 'z-40 ring-2 ring-sky-300/80' : ''} ${isDragging || isResizing ? 'opacity-45' : ''} ${blockClass}`}
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
          if (canResize) {
            const blockRect = event.currentTarget.getBoundingClientRect()
            const offsetY = event.clientY - blockRect.top
            if (offsetY <= RESIZE_HIT_AREA_PX || offsetY >= blockRect.height - RESIZE_HIT_AREA_PX) {
              onResizeStart(block, offsetY <= RESIZE_HIT_AREA_PX ? 'start' : 'end', event.clientY)
              return
            }
          }
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
        {canResize ? <ResizeHandle edge="start" block={block} onResizeStart={onResizeStart} /> : null}
        {canResize ? <ResizeHandle edge="end" block={block} onResizeStart={onResizeStart} /> : null}
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

function ResizeHandle({
  edge,
  block,
  onResizeStart
}: {
  edge: CalendarResizeEdge
  block: CalendarBlock
  onResizeStart: (block: CalendarBlock, edge: CalendarResizeEdge, originClientY: number) => void
}) {
  return (
    <span
      className={`absolute left-0 right-0 z-30 block h-4 cursor-ns-resize ${edge === 'start' ? 'top-0' : 'bottom-0'}`}
      aria-hidden="true"
      onMouseDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        onResizeStart(block, edge, event.clientY)
      }}
    />
  )
}
