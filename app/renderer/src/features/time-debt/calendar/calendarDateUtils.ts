import type { CalendarRange, CalendarViewMode } from './calendarTypes'

export function startOfWeek(date: Date): Date {
  const next = startOfDay(date)
  next.setDate(next.getDate() - next.getDay())
  return next
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

export function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey: string): Date {
  const date = new Date(`${dateKey}T00:00`)
  return Number.isNaN(date.getTime()) ? startOfDay(new Date()) : date
}

export function formatDateSlash(date: Date): string {
  return `${date.getFullYear()}/${padDatePart(date.getMonth() + 1)}/${padDatePart(date.getDate())}`
}

export function formatMonthDay(date: Date): string {
  return `${padDatePart(date.getMonth() + 1)}/${padDatePart(date.getDate())}`
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`
}

export function weekDayLabel(date: Date): string {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

export function buildCalendarRange(mode: CalendarViewMode, anchorDateKey: string, customDayCount: number): CalendarRange {
  const anchorDate = parseDateKey(anchorDateKey)
  if (mode === 'day') {
    const start = startOfDay(anchorDate)
    const end = addDays(start, 1)
    return { start, end, days: [start], label: formatDateSlash(start) }
  }
  if (mode === 'month') {
    const monthStart = startOfMonth(anchorDate)
    const gridStart = startOfWeek(monthStart)
    const nextMonth = addMonths(monthStart, 1)
    const gridEnd = addDays(startOfWeek(addDays(nextMonth, 6)), 1)
    const days = rangeDays(gridStart, gridEnd)
    return { start: gridStart, end: gridEnd, days, label: formatMonthTitle(monthStart) }
  }
  const dayCount = mode === 'customDays' ? Math.min(9, Math.max(2, customDayCount)) : 7
  const start = mode === 'week' ? startOfWeek(anchorDate) : startOfDay(anchorDate)
  const end = addDays(start, dayCount)
  return {
    start,
    end,
    days: rangeDays(start, end),
    label: `${formatDateSlash(start)} - ${formatDateSlash(addDays(end, -1))}`
  }
}

export function shiftAnchorDate(mode: CalendarViewMode, anchorDateKey: string, customDayCount: number, direction: -1 | 1): string {
  const anchorDate = parseDateKey(anchorDateKey)
  if (mode === 'month') {
    return formatDateKey(addMonths(anchorDate, direction))
  }
  if (mode === 'week') {
    return formatDateKey(addDays(anchorDate, 7 * direction))
  }
  if (mode === 'customDays') {
    return formatDateKey(addDays(anchorDate, Math.min(9, Math.max(2, customDayCount)) * direction))
  }
  return formatDateKey(addDays(anchorDate, direction))
}

export function dateTimeOverlapsRange(startTime: string, endTime: string, rangeStart: Date, rangeEnd: Date): boolean {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime || startTime).getTime()
  return Number.isFinite(start) && Number.isFinite(end) && start < rangeEnd.getTime() && Math.max(end, start + 60000) > rangeStart.getTime()
}

export function isSameMonth(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth()
}

function rangeDays(start: Date, end: Date): Date[] {
  const days: Date[] = []
  for (let cursor = startOfDay(start); cursor < end; cursor = addDays(cursor, 1)) {
    days.push(cursor)
  }
  return days
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}
