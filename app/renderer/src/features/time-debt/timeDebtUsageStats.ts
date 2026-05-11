import type { TimeDebtLog } from '@shared/timeDebt'

export type TimeUsageCategoryId = 'mainline' | 'growth' | 'maintenance' | 'recovery' | 'debt' | 'unknown' | 'blank'

export type DailyTimeUsageStats = {
  date: string
  totalRecordedMinutes: number
  mainlineMinutes: number
  growthMinutes: number
  maintenanceMinutes: number
  recoveryMinutes: number
  debtMinutes: number
  unknownMinutes: number
  blankMinutes: number
}

const timeUsageKeywordMap: Array<{ id: Exclude<TimeUsageCategoryId, 'unknown' | 'blank'>; keywords: string[] }> = [
  {
    id: 'debt',
    keywords: ['短视频', '游戏', '拖延', '刷手机', '无目的', '失控', '娱乐过量']
  },
  {
    id: 'mainline',
    keywords: ['项目', '开发', 'codex', 'claude', '公众号', '写作', '发布', 'growth-tree', '开发人生精进系统']
  },
  {
    id: 'growth',
    keywords: ['学习', '英语', 'c++', '蓝桥杯', '阅读', '课程', '算法']
  },
  {
    id: 'maintenance',
    keywords: ['吃饭', '饮食', '洗澡', '通勤', '整理', '家务', '睡前准备']
  },
  {
    id: 'recovery',
    keywords: ['休息', '散步', '午休', '睡觉', '放松', '运动']
  }
]

export function buildDailyTimeUsageStats(logs: TimeDebtLog[], now: Date = new Date()): DailyTimeUsageStats {
  const dayStart = new Date(now)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = now
  const date = formatDateKey(dayStart)
  const stats: DailyTimeUsageStats = {
    date,
    totalRecordedMinutes: 0,
    mainlineMinutes: 0,
    growthMinutes: 0,
    maintenanceMinutes: 0,
    recoveryMinutes: 0,
    debtMinutes: 0,
    unknownMinutes: 0,
    blankMinutes: 0
  }

  for (const log of logs) {
    const minutes = clippedMinutesInRange(log.startTime, log.endTime, dayStart, dayEnd)
    if (minutes <= 0) {
      continue
    }
    stats.totalRecordedMinutes += minutes
    const category = resolveTimeUsageCategory(log)
    addCategoryMinutes(stats, category, minutes)
  }

  const elapsedTodayMinutes = Math.max(0, Math.round((dayEnd.getTime() - dayStart.getTime()) / 60000))
  stats.blankMinutes = Math.max(0, elapsedTodayMinutes - stats.totalRecordedMinutes)
  return stats
}

function addCategoryMinutes(stats: DailyTimeUsageStats, category: Exclude<TimeUsageCategoryId, 'blank'>, minutes: number): void {
  if (category === 'mainline') {
    stats.mainlineMinutes += minutes
    return
  }
  if (category === 'growth') {
    stats.growthMinutes += minutes
    return
  }
  if (category === 'maintenance') {
    stats.maintenanceMinutes += minutes
    return
  }
  if (category === 'recovery') {
    stats.recoveryMinutes += minutes
    return
  }
  if (category === 'debt') {
    stats.debtMinutes += minutes
    return
  }
  stats.unknownMinutes += minutes
}

function resolveTimeUsageCategory(log: TimeDebtLog): Exclude<TimeUsageCategoryId, 'blank'> {
  const searchable = [
    log.title,
    log.primaryCategory,
    log.secondaryProject,
    log.distractionSource,
    log.dimension,
    log.resultNote,
    ...(log.tags ?? [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  for (const group of timeUsageKeywordMap) {
    if (group.keywords.some((keyword) => searchable.includes(keyword.toLowerCase()))) {
      return group.id
    }
  }
  return 'unknown'
}

function clippedMinutesInRange(startTime: string, endTime: string, rangeStart: Date, rangeEnd: Date): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }
  const clippedStart = Math.max(start, rangeStart.getTime())
  const clippedEnd = Math.min(end, rangeEnd.getTime())
  if (clippedEnd <= clippedStart) {
    return 0
  }
  return Math.round((clippedEnd - clippedStart) / 60000)
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
