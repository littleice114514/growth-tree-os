import { useMemo, useState } from 'react'
import clsx from 'clsx'

export type StackedBarSegment = {
  id: string
  label: string
  value: number
  unit?: string
  colorClass: string
  description?: string
}

export type InteractiveStackedBarProps = {
  segments: StackedBarSegment[]
  total?: number
  showLegend?: boolean
  showTooltip?: boolean
  compact?: boolean
}

type DisplaySegment = StackedBarSegment & {
  safeValue: number
  percent: number
}

export function InteractiveStackedBar({
  segments,
  total,
  showLegend = true,
  showTooltip = true,
  compact = false
}: InteractiveStackedBarProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const safeTotal = useMemo(() => {
    if (typeof total === 'number' && Number.isFinite(total) && total > 0) {
      return total
    }
    return segments.reduce((sum, segment) => sum + sanitizeValue(segment.value), 0)
  }, [segments, total])

  const displaySegments = useMemo<DisplaySegment[]>(
    () =>
      segments.map((segment) => {
        const safeValue = sanitizeValue(segment.value)
        return {
          ...segment,
          safeValue,
          percent: safeTotal > 0 ? (safeValue / safeTotal) * 100 : 0
        }
      }),
    [safeTotal, segments]
  )

  const activeSegment = displaySegments.find((segment) => segment.id === activeId) ?? null
  const hasVisibleData = safeTotal > 0 && displaySegments.some((segment) => segment.safeValue > 0)
  const barHeight = compact ? 'h-3' : 'h-4'

  if (!hasVisibleData) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
        <div className={clsx(barHeight, 'rounded-full bg-white/10')} />
        <div className="mt-3 text-xs text-[color:var(--text-muted)]">暂无可展示的结构数据</div>
      </div>
    )
  }

  return (
    <div className="relative" onMouseLeave={() => setActiveId(null)}>
      {showTooltip && activeSegment ? <StackedBarTooltip segment={activeSegment} /> : null}

      <div className={clsx('flex overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10', barHeight)}>
        {displaySegments.map((segment) => {
          const isActive = activeId === segment.id
          const isDimmed = Boolean(activeId && !isActive)
          const formattedValue = formatValue(segment.value, segment.unit)
          const title = `${segment.label}: ${formattedValue}, ${formatPercent(segment.percent)}`

          return (
            <button
              key={segment.id}
              type="button"
              title={title}
              aria-label={title}
              onMouseEnter={() => setActiveId(segment.id)}
              onFocus={() => setActiveId(segment.id)}
              onBlur={() => setActiveId(null)}
              className={clsx(
                'h-full cursor-pointer border-0 p-0 transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80',
                segment.colorClass,
                isActive ? 'relative z-10 scale-y-125 opacity-100 ring-2 ring-white/70' : 'opacity-90',
                isDimmed ? 'opacity-40' : null
              )}
              style={{
                width: `${segment.percent}%`,
                minWidth: segment.safeValue > 0 ? (compact ? '0.5rem' : '0.75rem') : 0
              }}
            />
          )
        })}
      </div>

      {showLegend ? (
        <div className={clsx('grid gap-2', compact ? 'mt-2' : 'mt-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2')}>
          {displaySegments.map((segment) => {
            const isActive = activeId === segment.id
            const isDimmed = Boolean(activeId && !isActive)
            return (
              <button
                key={segment.id}
                type="button"
                onMouseEnter={() => setActiveId(segment.id)}
                onFocus={() => setActiveId(segment.id)}
                onBlur={() => setActiveId(null)}
                className={clsx(
                  'flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-xs transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
                  isActive ? 'bg-white/10 text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)]',
                  isDimmed ? 'opacity-40' : 'opacity-100'
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={clsx('h-2.5 w-2.5 shrink-0 rounded-full', segment.colorClass)} />
                  <span className="truncate">{segment.label}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatValue(segment.value, segment.unit)}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function StackedBarTooltip({ segment }: { segment: DisplaySegment }) {
  return (
    <div className="pointer-events-none absolute right-0 top-0 z-20 w-56 -translate-y-[calc(100%+0.5rem)] rounded-xl border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-3 text-xs text-[color:var(--text-primary)] shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className={clsx('h-2.5 w-2.5 rounded-full', segment.colorClass)} />
        <span className="font-semibold">{segment.label}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[color:var(--text-secondary)]">
        <span>{formatValue(segment.value, segment.unit)}</span>
        <span>{formatPercent(segment.percent)}</span>
      </div>
      {segment.description ? <p className="mt-2 leading-5 text-[color:var(--text-secondary)]">{segment.description}</p> : null}
    </div>
  )
}

function sanitizeValue(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

function formatValue(value: number, unit?: string) {
  const rounded = Number.isInteger(value) ? `${value}` : value.toFixed(1)
  if (!unit) {
    return rounded
  }
  return unit === '¥' ? `¥${rounded}` : `${rounded} ${unit}`
}

function formatPercent(percent: number) {
  if (!Number.isFinite(percent)) {
    return '0%'
  }
  return `${percent > 0 && percent < 10 ? percent.toFixed(1) : Math.round(percent)}%`
}
