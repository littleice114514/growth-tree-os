import type { CalendarBlock, CalendarDragPreview, CalendarDragState, CalendarResizeEdge, CalendarResizePreview, CalendarResizeState, CalendarTimeScale } from './calendarTypes'
import { formatMinutesAsTime, minutesFromDateTime, pixelToTime, snapToMinute } from './calendarTimePositionUtils'

const MIN_RESIZE_DURATION_MINUTES = 15

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

export function createResizeState(block: CalendarBlock, edge: CalendarResizeEdge, originClientY: number): CalendarResizeState {
  const start = minutesFromDateTime(block.startTime)
  const duration = Math.max(block.durationMinutes, MIN_RESIZE_DURATION_MINUTES)
  return {
    blockId: block.id,
    edge,
    originClientY,
    originStartMinutes: start,
    originEndMinutes: Math.min(24 * 60, start + duration),
    dayKey: block.dayKey
  }
}

export function createResizePreview(
  resizeState: NonNullable<CalendarResizeState>,
  clientY: number,
  scale: CalendarTimeScale
): CalendarResizePreview {
  const deltaMinutes = snapToMinute(pixelToTime(clientY - resizeState.originClientY, scale) - scale.visibleStartHour * 60, scale.snapMinutes)
  const startLimit = Math.max(0, resizeState.originEndMinutes - MIN_RESIZE_DURATION_MINUTES)
  const endLimit = Math.min(24 * 60, resizeState.originStartMinutes + MIN_RESIZE_DURATION_MINUTES)
  const startMinutes =
    resizeState.edge === 'start'
      ? Math.max(0, Math.min(startLimit, resizeState.originStartMinutes + deltaMinutes))
      : resizeState.originStartMinutes
  const endMinutes =
    resizeState.edge === 'end'
      ? Math.min(24 * 60, Math.max(endLimit, resizeState.originEndMinutes + deltaMinutes))
      : resizeState.originEndMinutes
  return {
    blockId: resizeState.blockId,
    edge: resizeState.edge,
    dayKey: resizeState.dayKey,
    startMinutes,
    endMinutes,
    originalStartMinutes: resizeState.originStartMinutes,
    originalEndMinutes: resizeState.originEndMinutes
  }
}
