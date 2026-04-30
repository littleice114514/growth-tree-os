import type { TimeDebtLog } from '@shared/timeDebt'
import type { TimeDebtPlan } from '../timeDebtPlansStorage'

export type CalendarViewMode = 'day' | 'week' | 'month' | 'customDays'

export type CalendarBlockStatus = 'planned' | 'active' | 'completed' | 'missed'

export type CalendarBlock = {
  id: string
  title: string
  primaryCategory: string
  secondaryProject: string
  startTime: string
  endTime: string
  durationMinutes: number
  status: CalendarBlockStatus
  meta: string
  dayKey: string
  tags?: string[]
  distractionSource?: string
  aiEnableRatio?: number
  statusScore?: number
  note?: string
  log?: TimeDebtLog
  plan?: TimeDebtPlan
  leftPercent?: number
  widthPercent?: number
}

export type PositionedCalendarBlock = CalendarBlock & {
  top: number
  height: number
  leftPercent: number
  widthPercent: number
  clippedStart: boolean
  clippedEnd: boolean
}

export type CalendarRange = {
  start: Date
  end: Date
  days: Date[]
  label: string
}

export type CalendarTimeScale = {
  visibleStartHour: number
  visibleEndHour: number
  pixelsPerMinute: number
  minuteStep: number
  showHalfHourLine: boolean
  minEventHeight: number
  snapMinutes: number
}

export type CalendarDragState = {
  blockId: string
  originClientY: number
  originStartMinutes: number
  originEndMinutes: number
  dayKey: string
} | null

export type CalendarDragPreview = {
  blockId: string
  dayKey: string
  startMinutes: number
  endMinutes: number
  originalStartMinutes: number
  originalEndMinutes: number
} | null

export const defaultCalendarTimeScale: CalendarTimeScale = {
  visibleStartHour: 0,
  visibleEndHour: 24,
  pixelsPerMinute: 0.8,
  minuteStep: 30,
  showHalfHourLine: true,
  minEventHeight: 24,
  snapMinutes: 15
}
