import type { CalendarBlock, CalendarDragPreview, CalendarTimeScale } from './calendarTypes'
import { CalendarGrid } from './CalendarGrid'

export function WeekCalendarView(props: {
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
  return <CalendarGrid {...props} />
}
