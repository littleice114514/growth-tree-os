import type { TimeDebtLog } from '@shared/timeDebt'
import type { TimeDebtPlan } from './timeDebtPlansStorage'

const primaryCategories = ['工作', '学习', '休息', '生活', '其他'] as const
const fallbackPrimaryCategory = '其他'

export type TimeDebtTaskCatalogItem = {
  title: string
  primaryCategory: string
  secondaryProject: string
  tags?: string[]
  aiEnableRatio?: number
  lastUsedAt: string
  useCount: number
}

export function getPrimaryCategories(): string[] {
  return [...primaryCategories]
}

export function normalizeTimeDebtPrimaryCategory(value: string | undefined): string {
  const normalized = value?.trim()
  if (!normalized) {
    return fallbackPrimaryCategory
  }
  return primaryCategories.includes(normalized as (typeof primaryCategories)[number]) ? normalized : fallbackPrimaryCategory
}

export function getRecentTimeDebtTasks(logs: TimeDebtLog[], plans: TimeDebtPlan[] = []): TimeDebtTaskCatalogItem[] {
  const byTitle = new Map<string, TimeDebtTaskCatalogItem>()

  const remember = (input: {
    title: string
    primaryCategory: string
    secondaryProject?: string
    tags?: string[]
    aiEnableRatio?: number
    usedAt: string
  }) => {
    const title = input.title.trim()
    if (!title) {
      return
    }

    const key = title.toLowerCase()
    const current = byTitle.get(key)
    const primaryCategory = normalizeTimeDebtPrimaryCategory(input.primaryCategory)
    const secondaryProject = input.secondaryProject?.trim() || '未归属项目'

    if (!current) {
      byTitle.set(key, {
        title,
        primaryCategory,
        secondaryProject,
        tags: input.tags,
        aiEnableRatio: input.aiEnableRatio,
        lastUsedAt: input.usedAt,
        useCount: 1
      })
      return
    }

    const isNewer = input.usedAt.localeCompare(current.lastUsedAt) > 0
    byTitle.set(key, {
      title: isNewer ? title : current.title,
      primaryCategory: isNewer ? primaryCategory : current.primaryCategory,
      secondaryProject: isNewer ? secondaryProject : current.secondaryProject,
      tags: isNewer ? input.tags : current.tags,
      aiEnableRatio: typeof input.aiEnableRatio === 'number' ? input.aiEnableRatio : current.aiEnableRatio,
      lastUsedAt: isNewer ? input.usedAt : current.lastUsedAt,
      useCount: current.useCount + 1
    })
  }

  for (const log of logs) {
    remember({
      title: log.title,
      primaryCategory: log.primaryCategory,
      secondaryProject: log.secondaryProject,
      tags: log.tags,
      aiEnableRatio: log.aiEnableRatio,
      usedAt: log.endTime || log.startTime
    })
  }

  for (const plan of plans) {
    remember({
      title: plan.title,
      primaryCategory: plan.primaryCategory,
      secondaryProject: plan.secondaryProject,
      tags: plan.tags,
      usedAt: plan.actualEndTime || plan.actualStartTime || plan.plannedStartTime
    })
  }

  return Array.from(byTitle.values()).sort((first, second) => {
    if (first.lastUsedAt !== second.lastUsedAt) {
      return second.lastUsedAt.localeCompare(first.lastUsedAt)
    }
    return second.useCount - first.useCount
  })
}
