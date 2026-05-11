import { useState } from 'react'
import type { WealthRecord } from '@shared/wealth'
import { wealthRecordTypeLabels } from '@shared/wealth'
import type { CashflowTrend, TrendDay } from './overdraftTracker'

const CHART_HEIGHT = 180
const BAR_WIDTH_RATIO = 0.35
const DOT_RADIUS = 5
const DOT_HIT_RADIUS = 10

type HoverTarget = { date: string; kind: 'bar' | 'dot' } | null

export function CashflowComboChart({
  trend,
  records,
  safeLine
}: {
  trend: CashflowTrend
  records: WealthRecord[]
  safeLine: number
}) {
  const [hover, setHover] = useState<HoverTarget>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { days } = trend
  const dayCount = days.length
  if (dayCount === 0) return null

  const maxValue = Math.max(
    safeLine,
    ...days.map((d) => Math.max(d.totalExpense, d.totalIncome))
  )
  const scaleMax = maxValue > 0 ? maxValue * 1.15 : safeLine * 2
  const safeLineY = CHART_HEIGHT - (safeLine / scaleMax) * CHART_HEIGHT

  const colWidth = 100 / dayCount
  const barWidth = colWidth * BAR_WIDTH_RATIO
  const getX = (i: number) => colWidth * i + colWidth / 2

  const incomePoints = days.map((d, i) => {
    const x = getX(i)
    const y = CHART_HEIGHT - (d.totalIncome / scaleMax) * CHART_HEIGHT
    return { x, y, ...d }
  })

  const polylinePoints = incomePoints.map((p) => `${p.x},${p.y}`).join(' ')

  const selectedRecords = selectedDate
    ? records.filter((r) => r.date === selectedDate)
    : []
  const selectedDay = selectedDate ? days.find((d) => d.date === selectedDate) : null

  const allZero = days.every((d) => d.totalExpense === 0 && d.totalIncome === 0)

  if (allZero) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg viewBox={`0 0 100 ${CHART_HEIGHT}`} className="w-full opacity-20" style={{ maxHeight: '80px' }} preserveAspectRatio="none">
          <line x1="0" y1={safeLineY} x2="100" y2={safeLineY} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          {days.map((d, i) => (
            <rect key={d.date} x={getX(i) - barWidth / 2} y={CHART_HEIGHT * 0.92} width={barWidth} height={CHART_HEIGHT * 0.08} fill="currentColor" rx="0.5" />
          ))}
        </svg>
        <div className="mt-3 text-xs font-medium text-[color:var(--text-secondary)]">等待数据</div>
        <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">新增记录后，趋势图将自动更新。</p>
      </div>
    )
  }

  return (
    <div>
      {/* SVG Chart */}
      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        className="w-full"
        style={{ height: '200px' }}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
      >
        {/* Safe line */}
        <line
          x1="0"
          y1={safeLineY}
          x2="100"
          y2={safeLineY}
          stroke="var(--accent-amber, #f59e0b)"
          strokeWidth="0.4"
          strokeDasharray="3 2"
          opacity="0.6"
        />

        {/* Bars (expense) — rendered first so dots overlay */}
        {days.map((day, i) => {
          const x = getX(i)
          const barH = Math.max(1, (day.totalExpense / scaleMax) * CHART_HEIGHT)
          const barY = CHART_HEIGHT - barH
          const isHovered = hover?.date === day.date && hover.kind === 'bar'
          const isSelected = selectedDate === day.date

          return (
            <g key={`bar-${day.date}`}>
              <rect
                x={x - barWidth / 2}
                y={barY}
                width={barWidth}
                height={barH}
                rx="0.8"
                fill={day.isOverdraft ? 'rgba(251,113,133,0.65)' : 'rgba(110,231,183,0.55)'}
                stroke={day.isOverdraft ? 'rgba(244,63,94,0.7)' : 'none'}
                strokeWidth={day.isOverdraft ? '0.4' : '0'}
                opacity={isHovered ? 1 : isSelected ? 0.9 : 0.75}
                onMouseEnter={() => setHover({ date: day.date, kind: 'bar' })}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                style={{ cursor: 'pointer' }}
              />
              {/* Invisible wider hit area for hover */}
              <rect
                x={x - colWidth / 2}
                y="0"
                width={colWidth}
                height={CHART_HEIGHT}
                fill="transparent"
                onMouseEnter={() => setHover({ date: day.date, kind: 'bar' })}
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                style={{ cursor: 'pointer' }}
              />
            </g>
          )
        })}

        {/* Income polyline */}
        {days.some((d) => d.totalIncome > 0) && (
          <>
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="rgba(96,165,250,0.8)"
              strokeWidth="0.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Income dots — rendered after bars for higher z-index */}
            {incomePoints.map((p, i) => {
              const isHovered = hover?.date === p.date && hover.kind === 'dot'
              const isSelected = selectedDate === p.date
              return (
                <g key={`dot-${p.date}`}>
                  {/* Invisible larger hit area for dot */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={DOT_HIT_RADIUS * (100 / (dayCount * colWidth)) * (colWidth / 100)}
                    fill="transparent"
                    onMouseEnter={() => setHover({ date: p.date, kind: 'dot' })}
                    onClick={() => setSelectedDate(selectedDate === p.date ? null : p.date)}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered || isSelected ? DOT_RADIUS * 0.18 : DOT_RADIUS * 0.12}
                    fill="rgba(96,165,250,0.9)"
                    stroke="white"
                    strokeWidth="0.25"
                    pointerEvents="none"
                  />
                </g>
              )
            })}
          </>
        )}

        {/* Selected date highlight */}
        {selectedDate && (() => {
          const idx = days.findIndex((d) => d.date === selectedDate)
          if (idx < 0) return null
          const x = getX(idx)
          return (
            <line
              x1={x}
              y1="0"
              x2={x}
              y2={CHART_HEIGHT}
              stroke="rgba(148,163,184,0.3)"
              strokeWidth="0.3"
              strokeDasharray="1.5 1"
            />
          )
        })()}
      </svg>

      {/* X-axis labels */}
      <div className="mt-1 flex" style={{ paddingLeft: '2px', paddingRight: '2px' }}>
        {days.map((day) => {
          const isSelected = selectedDate === day.date
          return (
            <div
              key={day.date}
              className="flex flex-1 justify-center"
            >
              <button
                type="button"
                onClick={() => setSelectedDate(selectedDate === day.date ? null : day.date)}
                className={`truncate rounded-md px-1 py-0.5 text-[9px] transition ${
                  isSelected
                    ? 'border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] text-[color:var(--text-primary)]'
                    : day.isOverdraft
                      ? 'border border-rose-400/30 text-accent-rose'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
                }`}
                style={{ maxWidth: '36px' }}
              >
                {day.date.slice(5)}
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[color:var(--text-muted)]">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-emerald-400/55" />支出</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-400/80" />收入</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-amber-400/60" />安全线</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm border border-rose-400/70 bg-rose-400/20" />透支日</span>
      </div>

      {/* Hover tooltip */}
      {hover && (() => {
        const day = days.find((d) => d.date === hover.date)
        if (!day) return null
        return (
          <div className="mt-2 rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-2.5 text-xs">
            <div className="font-medium text-[color:var(--text-primary)]">{day.date}</div>
            {hover.kind === 'dot' ? (
              <div className="mt-1 text-blue-400">收入 {formatMoney(day.totalIncome)}</div>
            ) : (
              <>
                <div className="mt-1 text-[color:var(--text-secondary)]">支出 {formatMoney(day.totalExpense)}</div>
                <div className="text-[color:var(--text-muted)]">安全线 {formatMoney(day.safeLine)}</div>
                {day.isOverdraft ? <div className="text-accent-rose">已透支 {formatMoney(day.totalExpense - day.safeLine)}</div> : null}
              </>
            )}
          </div>
        )
      })()}

      {/* Day detail slice */}
      {selectedDate && selectedDay ? (
        <div className="mt-3 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Daily Slice</div>
              <div className="mt-0.5 text-sm font-semibold text-[color:var(--text-primary)]">{selectedDate} 日记录切片</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="rounded-lg border border-[color:var(--input-border)] px-2 py-1 text-[10px] text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)]"
            >
              关闭
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-2">
              <div className="text-[10px] text-[color:var(--text-muted)]">收入</div>
              <div className="mt-0.5 text-sm font-semibold text-blue-400">{formatMoney(selectedDay.totalIncome)}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-2">
              <div className="text-[10px] text-[color:var(--text-muted)]">支出</div>
              <div className={`mt-0.5 text-sm font-semibold ${selectedDay.isOverdraft ? 'text-accent-rose' : 'text-accent-green'}`}>{formatMoney(selectedDay.totalExpense)}</div>
            </div>
            <div className="rounded-xl border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-2">
              <div className="text-[10px] text-[color:var(--text-muted)]">状态</div>
              <div className={`mt-0.5 text-sm font-semibold ${selectedDay.isOverdraft ? 'text-accent-rose' : 'text-accent-green'}`}>
                {selectedDay.isOverdraft ? '透支' : '正常'}
              </div>
            </div>
          </div>

          {selectedRecords.length === 0 ? (
            <div className="mt-2 rounded-xl border border-dashed border-[color:var(--panel-border)] p-3 text-center text-xs text-[color:var(--text-muted)]">
              这一天还没有财富记录
            </div>
          ) : (
            <div className="mt-2 space-y-1.5">
              {selectedRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-xl border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] px-2.5 py-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[color:var(--text-primary)]">{wealthRecordTypeLabels[record.type]}</span>
                      <span className="text-[10px] text-[color:var(--text-muted)]">{record.title ?? record.source ?? record.category ?? ''}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${
                    ['real_income', 'passive_income', 'system_income', 'stable_finance'].includes(record.type)
                      ? 'text-blue-400'
                      : 'text-accent-rose'
                  }`}>
                    {['real_income', 'passive_income', 'system_income', 'stable_finance'].includes(record.type) ? '+' : '-'}{formatMoney(record.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0
  }).format(value)
}
