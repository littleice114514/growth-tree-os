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
  sourceBlockId?: string
  isDailySegment?: boolean
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
  showHalfHourLabel: boolean
  minEventHeight: number
  snapMinutes: number
}

export type CalendarDragState = {
  blockId: string
  originClientX: number
  originClientY: number
  originDayIndex: number
  originStartMinutes: number
  originEndMinutes: number
  durationMinutes: number
  dayKey: string
  dayColumnWidth: number
  columnCount: number
} | null

export type CalendarDragPreview = {
  blockId: string
  dayKey: string
  dayIndex: number
  startMinutes: number
  endMinutes: number
  originalStartMinutes: number
  originalEndMinutes: number
  deltaDays: number
} | null

export type CalendarResizeEdge = 'start' | 'end'

export type CalendarResizeState = {
  blockId: string
  edge: CalendarResizeEdge
  originClientY: number
  originStartMinutes: number
  originEndMinutes: number
  dayKey: string
} | null

export type CalendarResizePreview = {
  blockId: string
  edge: CalendarResizeEdge
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
  showHalfHourLabel: true,
  minEventHeight: 12,
  snapMinutes: 15
}

export const minVisualCalendarEventDurationMinutes = 15
