import type { CalendarBlock, CalendarDragPreview, CalendarDragState, CalendarTimeScale } from './calendarTypes'
import { formatMinutesAsTime, minutesFromDateTime, pixelToTime, snapToMinute } from './calendarTimePositionUtils'

export function createDragState(block: CalendarBlock, clientY: number): CalendarDragState {
  const start = minutesFromDateTime(block.startTime)
  return {
    blockId: block.id,
    originClientY: clientY,
    originStartMinutes: start,
    originEndMinutes: start + Math.max(block.durationMinutes, 1),
    dayKey: block.dayKey
  }
}

export function createDragPreview(dragState: NonNullable<CalendarDragState>, clientY: number, scale: CalendarTimeScale): CalendarDragPreview {
  const deltaMinutes = snapToMinute(pixelToTime(clientY - dragState.originClientY, scale) - scale.visibleStartHour * 60, scale.snapMinutes)
  const duration = dragState.originEndMinutes - dragState.originStartMinutes
  const startMinutes = Math.max(0, Math.min(24 * 60 - duration, dragState.originStartMinutes + deltaMinutes))
  return {
    blockId: dragState.blockId,
    dayKey: dragState.dayKey,
    startMinutes,
    endMinutes: startMinutes + duration,
    originalStartMinutes: dragState.originStartMinutes,
    originalEndMinutes: dragState.originEndMinutes
  }
}

export function formatPreviewRange(preview: NonNullable<CalendarDragPreview>): string {
  return `${formatMinutesAsTime(preview.startMinutes)} - ${formatMinutesAsTime(preview.endMinutes)}`
}

export function previewDeltaMinutes(preview: NonNullable<CalendarDragPreview>): number {
  return preview.startMinutes - preview.originalStartMinutes
}
