import type { CalendarBlock, CalendarDragPreview, CalendarTimeScale } from './calendarTypes'
import { CalendarGrid } from './CalendarGrid'

export function DayCalendarView(props: {
  days: Date[]
  blocks: CalendarBlock[]
  todayKey: string
  now: Date
  scale: CalendarTimeScale
  selectedBlockId: string | null
  dragPreview: CalendarDragPreview
  onSelectBlock: (block: CalendarBlock) => void
  onDragStart: (block: CalendarBlock, drag: { originClientX: number; originClientY: number; currentClientX: number; currentClientY: number; dayColumnWidth: number; dayIndex: number; columnCount: number }) => void
  onClearSelection: () => void
}) {
  return <CalendarGrid {...props} days={props.days.slice(0, 1)} />
}
