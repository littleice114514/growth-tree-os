import { defaultProjectCategories } from '@shared/timeDebt'

const OPTIONS_KEY = 'growth-tree-os:time-debt-options:v1'

export type TimeDebtOptions = {
  categories: string[]
  projects: string[]
  units: string[]
}

export const defaultTimeDebtOptions: TimeDebtOptions = {
  categories: mergeOptions(['工作', '学习', '生活', '运动', '空转', '恢复'], defaultProjectCategories.map((category) => category.primaryCategory)),
  projects: mergeOptions(['growth-tree-os', '公众号文章', 'Codex 推进', '英语学习'], defaultProjectCategories.map((category) => category.secondaryProject)),
  units: mergeOptions(['min', '小时', '项', '篇', '题', '次', '页', '组'], defaultProjectCategories.map((category) => category.defaultWorkloadUnit ?? ''))
}

export function loadTimeDebtOptions(): TimeDebtOptions {
  if (typeof window === 'undefined') {
    return defaultTimeDebtOptions
  }

  try {
    const raw = window.localStorage.getItem(OPTIONS_KEY)
    if (!raw) {
      return defaultTimeDebtOptions
    }
    const parsed = JSON.parse(raw)
    if (!isTimeDebtOptions(parsed)) {
      return defaultTimeDebtOptions
    }
    return normalizeTimeDebtOptions(parsed)
  } catch {
    return defaultTimeDebtOptions
  }
}

export function saveTimeDebtOptions(options: TimeDebtOptions): void {
  window.localStorage.setItem(OPTIONS_KEY, JSON.stringify(normalizeTimeDebtOptions(options)))
}

export function upsertTimeDebtOptions(
  current: TimeDebtOptions,
  values: {
    category?: string
    project?: string
    unit?: string
  }
): TimeDebtOptions {
  return normalizeTimeDebtOptions({
    categories: addOption(current.categories, values.category),
    projects: addOption(current.projects, values.project),
    units: addOption(current.units, values.unit)
  })
}

export const timeDebtOptionsStorageKey = OPTIONS_KEY

function normalizeTimeDebtOptions(options: TimeDebtOptions): TimeDebtOptions {
  return {
    categories: mergeOptions(defaultTimeDebtOptions.categories, options.categories),
    projects: mergeOptions(defaultTimeDebtOptions.projects, options.projects),
    units: mergeOptions(defaultTimeDebtOptions.units, options.units)
  }
}

function addOption(options: string[], option: string | undefined): string[] {
  return mergeOptions(options, option ? [option] : [])
}

function mergeOptions(base: string[], next: string[]): string[] {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const option of [...base, ...next]) {
    const trimmed = option.trim()
    const key = trimmed.toLowerCase()
    if (!trimmed || seen.has(key)) {
      continue
    }
    seen.add(key)
    merged.push(trimmed)
  }
  return merged
}

function isTimeDebtOptions(value: unknown): value is TimeDebtOptions {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<TimeDebtOptions>
  return (
    isStringArray(candidate.categories) &&
    isStringArray(candidate.projects) &&
    isStringArray(candidate.units)
  )
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}
