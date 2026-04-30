import type { CalendarBlock, CalendarDragPreview, CalendarResizeEdge, CalendarResizePreview, CalendarTimeScale } from './calendarTypes'
import { CalendarGrid } from './CalendarGrid'

export function DayCalendarView(props: {
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
  return <CalendarGrid {...props} days={props.days.slice(0, 1)} />
}
