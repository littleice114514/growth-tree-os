import type { CalendarBlock } from './calendarTypes'
import { formatDateKey } from './calendarDateUtils'

export function splitEventIntoDailySegments(block: CalendarBlock, visibleStartDate: Date, visibleEndDate: Date): CalendarBlock[] {
  const start = new Date(block.startTime)
  const end = new Date(block.endTime || block.startTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return []
  }

  const visibleStart = startOfDay(visibleStartDate)
  const visibleEnd = startOfDay(visibleEndDate)
  const rangeStart = new Date(Math.max(start.getTime(), visibleStart.getTime()))
  const rangeEnd = new Date(Math.min(end.getTime(), visibleEnd.getTime()))
  if (rangeEnd <= rangeStart) {
    return []
  }

  const crossesDay = formatDateKey(start) !== formatDateKey(end)
  if (!crossesDay) {
    return [
      {
        ...block,
        dayKey: formatDateKey(start)
      }
    ]
  }

  const segments: CalendarBlock[] = []
  let cursor = startOfDay(rangeStart)
  while (cursor < rangeEnd) {
    const nextDay = addDays(cursor, 1)
    const segmentStart = new Date(Math.max(start.getTime(), rangeStart.getTime(), cursor.getTime()))
    const segmentEnd = new Date(Math.min(end.getTime(), rangeEnd.getTime(), nextDay.getTime()))
    if (segmentEnd > segmentStart) {
      const dayKey = formatDateKey(cursor)
      const startTime = formatDateTime(segmentStart)
      const endTime = formatDateTime(segmentEnd)
      segments.push({
        ...block,
        id: `${block.id}::segment::${dayKey}`,
        sourceBlockId: block.sourceBlockId ?? block.id,
        isDailySegment: true,
        startTime,
        endTime,
        durationMinutes: Math.max(1, Math.round((segmentEnd.getTime() - segmentStart.getTime()) / 60000)),
        dayKey,
        meta: `${block.meta} / 跨天分段`
      })
    }
    cursor = nextDay
  }

  return segments
}

export function splitEventsIntoDailySegments(blocks: CalendarBlock[], visibleStartDate: Date, visibleEndDate: Date): CalendarBlock[] {
  return blocks.flatMap((block) => splitEventIntoDailySegments(block, visibleStartDate, visibleEndDate))
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
