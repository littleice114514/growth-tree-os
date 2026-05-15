import { calculateDurationMinutes, createTimeDebtLog, type TimeDebtLog } from '@shared/timeDebt'
import {
  clearActiveTimeDebtTimer,
  createActiveTimeDebtTimer,
  loadActiveTimeDebtTimer,
  saveActiveTimeDebtTimer,
  type ActiveTimeDebtTimer
} from './timeDebtActiveTimerStorage'
import { appendTimeDebtLog, loadTimeDebtParams } from './timeDebtStorage'

const quickTimerFallbackPrimaryCategory = '其他'
const quickTimerSecondaryProject = 'growth-tree-os'

export type QuickTimeDebtTimerResult =
  | { ok: true; timer: ActiveTimeDebtTimer }
  | { ok: false; error: string }

export type FinishQuickTimeDebtTimerResult =
  | { ok: true; log: TimeDebtLog }
  | { ok: false; error: string }

export function startQuickTimeDebtTimer(title: string, primaryCategory: string): QuickTimeDebtTimerResult {
  const normalizedTitle = title.trim()
  if (!normalizedTitle) {
    return { ok: false, error: '先写一下这次在做什么' }
  }
  const normalizedPrimaryCategory = primaryCategory.trim() || quickTimerFallbackPrimaryCategory

  const currentTimer = loadActiveTimeDebtTimer()
  if (currentTimer) {
    return { ok: false, error: '已经有一段时间正在记录中' }
  }

  const now = new Date()
  const timer = createActiveTimeDebtTimer({
    title: normalizedTitle,
    primaryCategory: normalizedPrimaryCategory,
    secondaryProject: quickTimerSecondaryProject,
    actualStart: formatLocalDateTimeInput(now),
    startTimestampMs: now.getTime(),
    resultNote: '由 Time Debt 快速记录浮窗生成。'
  })
  saveActiveTimeDebtTimer(timer)
  return { ok: true, timer }
}

export function finishQuickTimeDebtTimer(): FinishQuickTimeDebtTimerResult {
  const timer = loadActiveTimeDebtTimer()
  if (!timer) {
    return { ok: false, error: '当前没有正在计时的记录' }
  }

  const now = new Date()
  const minimumEndTimestamp = timer.startTimestampMs + 60000
  const endDate = new Date(Math.max(now.getTime(), minimumEndTimestamp))
  const endTime = formatLocalDateTimeInput(endDate)
  const durationMinutes = Math.max(1, calculateDurationMinutes(timer.actualStart, endTime))
  const log = createTimeDebtLog(
    {
      title: timer.title,
      primaryCategory: timer.primaryCategory,
      secondaryProject: timer.secondaryProject,
      startTime: timer.actualStart,
      endTime,
      aiEnableRatio: timer.aiEnableRatio,
      tags: timer.tags,
      resultNote: timer.resultNote ?? '由 Time Debt 快速记录浮窗生成。'
    },
    loadTimeDebtParams()
  )

  appendTimeDebtLog({
    ...log,
    durationMinutes
  })
  clearActiveTimeDebtTimer()
  return { ok: true, log: { ...log, durationMinutes } }
}

function formatLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}
