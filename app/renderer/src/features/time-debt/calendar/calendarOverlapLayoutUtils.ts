import type { CalendarBlock } from './calendarTypes'
import { minutesFromDateTime } from './calendarTimePositionUtils'

export function layoutOverlappingEvents(blocks: CalendarBlock[]): CalendarBlock[] {
  const byDay = new Map<string, CalendarBlock[]>()
  for (const block of blocks) {
    byDay.set(block.dayKey, [...(byDay.get(block.dayKey) ?? []), block])
  }
  return Array.from(byDay.values())
    .flatMap(layoutDayBlocks)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function blocksOverlap(first: CalendarBlock, second: CalendarBlock): boolean {
  const firstStart = minutesFromDateTime(first.startTime)
  const firstEnd = firstStart + Math.max(first.durationMinutes, 1)
  const secondStart = minutesFromDateTime(second.startTime)
  const secondEnd = secondStart + Math.max(second.durationMinutes, 1)
  return firstStart < secondEnd && secondStart < firstEnd
}

function layoutDayBlocks(blocks: CalendarBlock[]): CalendarBlock[] {
  const sorted = [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime))
  const groups: CalendarBlock[][] = []
  let currentGroup: CalendarBlock[] = []
  let currentGroupEnd = -1
  for (const block of sorted) {
    const start = minutesFromDateTime(block.startTime)
    const end = minutesFromDateTime(block.endTime) || start + Math.max(block.durationMinutes, 1)
    if (currentGroup.length === 0 || start < currentGroupEnd) {
      currentGroup.push(block)
      currentGroupEnd = Math.max(currentGroupEnd, end)
    } else {
      groups.push(currentGroup)
      currentGroup = [block]
      currentGroupEnd = end
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }
  return groups.flatMap(layoutOverlapGroup)
}

function layoutOverlapGroup(group: CalendarBlock[]): CalendarBlock[] {
  if (group.length <= 1) {
    return group.map((block) => ({ ...block, leftPercent: 0, widthPercent: 100 }))
  }
  const columns: CalendarBlock[][] = []
  const placements = new Map<string, number>()
  for (const block of group) {
    const columnIndex = columns.findIndex((column) => {
      const last = column[column.length - 1]
      return last ? !blocksOverlap(last, block) : true
    })
    const targetColumn = columnIndex >= 0 ? columnIndex : columns.length
    if (!columns[targetColumn]) {
      columns[targetColumn] = []
    }
    columns[targetColumn].push(block)
    placements.set(block.id, targetColumn)
  }
  const columnCount = Math.max(1, columns.length)
  const widthPercent = 100 / columnCount
  return group.map((block) => ({
    ...block,
    leftPercent: (placements.get(block.id) ?? 0) * widthPercent,
    widthPercent
  }))
}
