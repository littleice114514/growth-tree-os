import ReactECharts from 'echarts-for-react'
import type { TimeDebtLog } from '@shared/timeDebt'
import { getPrimaryCategories, normalizeTimeDebtPrimaryCategory } from '../timeDebtTaskCatalog'

type TimeDebtTodayUsagePieProps = {
  logs: TimeDebtLog[]
  now: Date
}

const blankCategory = '空白'
const categoryColors: Record<string, string> = {
  工作: '#22d3ee',
  学习: '#34d399',
  休息: '#a3e635',
  生活: '#38bdf8',
  其他: '#94a3b8',
  空白: '#cbd5e1'
}

export function TimeDebtTodayUsagePie({ logs, now }: TimeDebtTodayUsagePieProps) {
  const rows = buildTodayUsageRows(logs, now)
  const chartRows = rows.filter((row) => row.minutes > 0)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} min ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: {
        color: 'var(--text-secondary)'
      }
    },
    color: rows.map((row) => row.color),
    series: [
      {
        name: '今日时间使用',
        type: 'pie',
        radius: ['46%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        label: {
          formatter: '{b}\n{d}%'
        },
        data: chartRows.map((row) => ({
          name: row.label,
          value: row.minutes
        }))
      }
    ]
  }

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Today Usage</div>
          <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">今日时间使用</h3>
        </div>
        <div className="text-xs tabular-nums text-[color:var(--text-muted)]">{formatDate(now)}</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-h-[260px] min-w-0">
          <ReactECharts option={option} style={{ height: 260, width: '100%' }} />
        </div>
        <div className="grid content-start gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                  <span className="truncate text-xs text-[color:var(--text-secondary)]">{row.label}</span>
                </div>
                <span className="text-[11px] tabular-nums text-[color:var(--text-muted)]">{row.share}</span>
              </div>
              <div className="mt-2 text-sm font-semibold tabular-nums text-[color:var(--text-primary)]">{formatMinutes(row.minutes)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type UsageRow = {
  label: string
  minutes: number
  share: string
  color: string
}

function buildTodayUsageRows(logs: TimeDebtLog[], now: Date): UsageRow[] {
  const categories = getPrimaryCategories()
  const minutesByCategory = new Map(categories.map((category) => [category, 0]))
  let recordedMinutes = 0

  for (const log of logs) {
    const minutes = Math.max(0, log.durationMinutes)
    const category = normalizeTimeDebtPrimaryCategory(log.primaryCategory)
    minutesByCategory.set(category, (minutesByCategory.get(category) ?? 0) + minutes)
    recordedMinutes += minutes
  }

  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - startOfDay(now).getTime()) / 60000))
  const blankMinutes = Math.max(0, elapsedMinutes - recordedMinutes)
  const totalMinutes = Math.max(recordedMinutes + blankMinutes, 1)

  return [
    ...categories.map((category) => ({
      label: category,
      minutes: minutesByCategory.get(category) ?? 0,
      share: formatShare(minutesByCategory.get(category) ?? 0, totalMinutes),
      color: categoryColors[category]
    })),
    {
      label: blankCategory,
      minutes: blankMinutes,
      share: formatShare(blankMinutes, totalMinutes),
      color: categoryColors[blankCategory]
    }
  ]
}

function startOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} min`
}

function formatShare(minutes: number, totalMinutes: number): string {
  return `${Math.round((minutes / totalMinutes) * 100)}%`
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}
