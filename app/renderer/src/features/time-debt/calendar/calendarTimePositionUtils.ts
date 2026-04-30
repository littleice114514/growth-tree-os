import type { CalendarBlock, CalendarTimeScale, PositionedCalendarBlock } from './calendarTypes'

export function minutesFromDateTime(value: string): number {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 0
  }
  return date.getHours() * 60 + date.getMinutes()
}

export function minutesFromDate(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function timeToTop(minutes: number, scale: CalendarTimeScale): number {
  const visibleStart = scale.visibleStartHour * 60
  return (minutes - visibleStart) * scale.pixelsPerMinute
}

export function timeToPixel(minutes: number, scale: CalendarTimeScale): number {
  return timeToTop(minutes, scale)
}

export function pixelToTime(pixel: number, scale: CalendarTimeScale): number {
  return Math.round(pixel / scale.pixelsPerMinute + scale.visibleStartHour * 60)
}

export function durationToHeight(durationMinutes: number, scale: CalendarTimeScale): number {
  return Math.max(durationMinutes * scale.pixelsPerMinute, scale.minEventHeight)
}

export function snapToMinute(minutes: number, snapMinutes: number): number {
  return Math.round(minutes / snapMinutes) * snapMinutes
}

export function visibleGridHeight(scale: CalendarTimeScale): number {
  return (scale.visibleEndHour - scale.visibleStartHour) * 60 * scale.pixelsPerMinute
}

export function positionCalendarBlock(block: CalendarBlock, dayKey: string, scale: CalendarTimeScale): PositionedCalendarBlock | null {
  const visibleStart = scale.visibleStartHour * 60
  const visibleEnd = scale.visibleEndHour * 60
  const startDate = new Date(block.startTime)
  const endDate = new Date(block.endTime || block.startTime)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null
  }
  const startMinutes = block.startTime.slice(0, 10) < dayKey ? 0 : minutesFromDate(startDate)
  const rawEndMinutes = block.endTime.slice(0, 10) > dayKey ? 1440 : minutesFromDate(endDate)
  const endMinutes = Math.max(rawEndMinutes, startMinutes + 1)
  const clampedStart = Math.max(visibleStart, Math.min(visibleEnd, startMinutes))
  const clampedEnd = Math.max(visibleStart, Math.min(visibleEnd, endMinutes))
  if (clampedEnd <= visibleStart || clampedStart >= visibleEnd || clampedEnd <= clampedStart) {
    return null
  }
  return {
    ...block,
    top: timeToTop(clampedStart, scale),
    height: durationToHeight(clampedEnd - clampedStart, scale),
    leftPercent: block.leftPercent ?? 0,
    widthPercent: block.widthPercent ?? 100,
    clippedStart: startMinutes < visibleStart,
    clippedEnd: endMinutes > visibleEnd
  }
}

export function formatMinutesAsTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, minutes))
  const hour = Math.floor(clamped / 60)
  const minute = clamped % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
