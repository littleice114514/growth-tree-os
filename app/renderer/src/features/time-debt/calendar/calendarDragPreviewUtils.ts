import type { CalendarBlock, CalendarDragPreview, CalendarDragState, CalendarTimeScale } from './calendarTypes'
import { formatMinutesAsTime, minutesFromDateTime, pixelToTime, snapToMinute } from './calendarTimePositionUtils'

export function createDragState(
  block: CalendarBlock,
  originClientX: number,
  originClientY: number,
  originDayIndex: number,
  dayColumnWidth: number,
  columnCount: number
): CalendarDragState {
  const start = minutesFromDateTime(block.startTime)
  const duration = Math.max(block.durationMinutes, 1)
  return {
    blockId: block.id,
    originClientX,
    originClientY,
    originDayIndex,
    originStartMinutes: start,
    originEndMinutes: start + duration,
    durationMinutes: duration,
    dayKey: block.dayKey,
    dayColumnWidth: Math.max(dayColumnWidth, 1),
    columnCount: Math.max(columnCount, 1)
  }
}

export function createDragPreview(
  dragState: NonNullable<CalendarDragState>,
  clientX: number,
  clientY: number,
  scale: CalendarTimeScale,
  dayKeys: string[]
): CalendarDragPreview {
  const deltaMinutes = snapToMinute(pixelToTime(clientY - dragState.originClientY, scale) - scale.visibleStartHour * 60, scale.snapMinutes)
  const rawDeltaDays = Math.round((clientX - dragState.originClientX) / dragState.dayColumnWidth)
  const dayIndex = Math.max(0, Math.min(dragState.columnCount - 1, dragState.originDayIndex + rawDeltaDays))
  const duration = dragState.durationMinutes
  const startMinutes = Math.max(0, Math.min(24 * 60 - duration, dragState.originStartMinutes + deltaMinutes))
  return {
    blockId: dragState.blockId,
    dayKey: dayKeys[dayIndex] ?? dragState.dayKey,
    dayIndex,
    startMinutes,
    endMinutes: startMinutes + duration,
    originalStartMinutes: dragState.originStartMinutes,
    originalEndMinutes: dragState.originEndMinutes,
    deltaDays: dayIndex - dragState.originDayIndex
  }
}

export function formatPreviewRange(preview: NonNullable<CalendarDragPreview>): string {
  return `${formatMinutesAsTime(preview.startMinutes)} - ${formatMinutesAsTime(preview.endMinutes)}`
}

export function previewDeltaMinutes(preview: NonNullable<CalendarDragPreview>): number {
  return preview.startMinutes - preview.originalStartMinutes
}
