import { useState } from 'react'
import type { WealthRecord } from '@shared/wealth'
import { wealthRecordTypeLabels } from '@shared/wealth'
import type { CashflowTrend, TrendDay } from './overdraftTracker'

const CHART_H = 180
const PLOT_PAD_TOP = 6
const PLOT_PAD_BOTTOM = 2

type HoverTarget = string | null

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

  const { days, period } = trend
  const dayCount = days.length
  if (dayCount === 0) return null

  const activeDate = hover ?? selectedDate
  const maxValue = Math.max(
    safeLine,
    ...days.map((d) => Math.max(d.totalExpense, d.totalIncome))
  )
  const scaleMax = maxValue > 0 ? maxValue * 1.2 : safeLine * 2

  const toY = (value: number) => PLOT_PAD_TOP + (1 - value / scaleMax) * (CHART_H - PLOT_PAD_TOP - PLOT_PAD_BOTTOM)
  const safeLineY = toY(safeLine)

  const colW = 100 / dayCount
  const barW = Math.max(colW * 0.38, 1.2)
  const cx = (i: number) => colW * i + colW / 2

  const incomeXY = days.map((d, i) => ({ x: cx(i), y: toY(d.totalIncome), date: d.date }))
  const hasAnyIncome = days.some((d) => d.totalIncome > 0)
  const polylineStr = incomeXY.map((p) => `${p.x},${p.y}`).join(' ')

  const allZero = days.every((d) => d.totalExpense === 0 && d.totalIncome === 0)

  const selectedRecords = selectedDate ? records.filter((r) => r.date === selectedDate) : []
  const selectedDay = selectedDate ? days.find((d) => d.date === selectedDate) : null

  const toggleDate = (date: string) => setSelectedDate((prev) => (prev === date ? null : date))

  // Date label density: show all for 7d, sparse for 30d
  const showLabel = (i: number) => {
    if (period === 'last7') return true
    if (days[i].date === selectedDate) return true
    if (i === 0 || i === dayCount - 1) return true
    return i % 5 === 0
  }

  if (allZero) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <svg viewBox={`0 0 100 ${CHART_H}`} className="w-full opacity-15" style={{ maxHeight: '80px' }} preserveAspectRatio="none">
          <line x1="0" y1={safeLineY} x2="100" y2={safeLineY} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          {days.map((d, i) => (
            <rect key={d.date} x={cx(i) - barW / 2} y={CHART_H * 0.92} width={barW} height={CHART_H * 0.08} fill="currentColor" rx="0.5" />
          ))}
        </svg>
        <div className="mt-3 text-xs font-medium text-[color:var(--text-secondary)]">等待数据</div>
        <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">新增记录后，趋势图将自动更新。</p>
      </div>
    )
  }

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${CHART_H}`}
        className="w-full"
        style={{ height: '220px' }}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
      >
        {/* ── Safe line (formal) ── */}
        <line x1="0" y1={safeLineY} x2="100" y2={safeLineY} stroke="#d4a017" strokeWidth="0.35" strokeDasharray="4 1.8" opacity="0.55" />
        <text x="100.5" y={safeLineY + 1.2} fill="#d4a017" fontSize="2.8" opacity="0.65" textAnchor="start" dominantBaseline="middle">
          安全线 ¥{safeLine}
        </text>

        {/* ── Column highlight (hover / selected) ── */}
        {days.map((day, i) => {
          const isHovered = hover === day.date
          const isSelected = selectedDate === day.date
          if (!isHovered && !isSelected) return null
          return (
            <rect
              key={`hl-${day.date}`}
              x={cx(i) - colW / 2}
              y="0"
              width={colW}
              height={CHART_H}
              fill={isSelected ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.07)'}
              rx="0.5"
            />
          )
        })}

        {/* ── Bars (expense) ── */}
        {days.map((day, i) => {
          const x = cx(i)
          const barH = Math.max(0.8, (day.totalExpense / scaleMax) * (CHART_H - PLOT_PAD_TOP - PLOT_PAD_BOTTOM))
          const barY = CHART_H - PLOT_PAD_BOTTOM - barH

          return (
            <g key={`bar-${day.date}`}>
              <rect
                x={x - barW / 2}
                y={barY}
                width={barW}
                height={barH}
                rx="0.6"
                fill={day.isOverdraft ? 'rgba(251,113,133,0.55)' : 'rgba(110,231,183,0.45)'}
                pointerEvents="none"
              />
              {/* Overdraft risk dot on top of bar */}
              {day.isOverdraft ? (
                <circle cx={x} cy={barY - 1.2} r="0.7" fill="rgba(244,63,94,0.8)" pointerEvents="none" />
              ) : null}
            </g>
          )
        })}

        {/* ── Income polyline + dots ── */}
        {hasAnyIncome && (
          <>
            {/* Area fill under income line */}
            <polygon
              points={`${incomeXY[0].x},${CHART_H - PLOT_PAD_BOTTOM} ${polylineStr} ${incomeXY[incomeXY.length - 1].x},${CHART_H - PLOT_PAD_BOTTOM}`}
              fill="rgba(96,165,250,0.08)"
              pointerEvents="none"
            />
            <polyline
              points={polylineStr}
              fill="none"
              stroke="rgba(96,165,250,0.85)"
              strokeWidth="0.55"
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
            {incomeXY.map((p) => {
              const day = days.find((d) => d.date === p.date)!
              const hasIncome = day.totalIncome > 0
              const isHovered = hover === p.date
              const isSelected = selectedDate === p.date
              return (
                <circle
                  key={`dot-${p.date}`}
                  cx={p.x}
                  cy={p.y}
                  r={hasIncome ? (isHovered || isSelected ? 1.2 : 0.8) : 0.3}
                  fill={hasIncome ? 'rgba(96,165,250,0.9)' : 'rgba(96,165,250,0.2)'}
                  stroke={hasIncome ? 'white' : 'none'}
                  strokeWidth="0.25"
                  pointerEvents="none"
                />
              )
            })}
          </>
        )}

        {/* ── Invisible interaction layer (topmost, captures all events) ── */}
        {days.map((day, i) => (
          <rect
            key={`hit-${day.date}`}
            x={cx(i) - colW / 2}
            y="0"
            width={colW}
            height={CHART_H}
            fill="transparent"
            onMouseEnter={() => setHover(day.date)}
            onClick={() => toggleDate(day.date)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>

      {/* ── X-axis date labels ── */}
      <div className="mt-1 flex px-0.5">
        {days.map((day, i) => {
          const isSelected = selectedDate === day.date
          const visible = showLabel(i)
          return (
            <div key={day.date} className="flex flex-1 justify-center">
              {visible ? (
                <button
                  type="button"
                  onClick={() => toggleDate(day.date)}
                  className={`truncate rounded-md px-1 py-0.5 text-[9px] transition ${
                    isSelected
                      ? 'bg-[color:var(--text-primary)] text-[color:var(--panel-bg)] font-medium'
                      : day.isOverdraft
                        ? 'text-accent-rose font-medium'
                        : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
                  }`}
                  style={{ maxWidth: '36px' }}
                >
                  {day.date.slice(5)}
                </button>
              ) : (
                <div style={{ height: '14px' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Legend ── */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[color:var(--text-muted)]">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-emerald-300/50" />支出</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 bg-blue-400/80" />收入</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0 w-3 border-t border-dashed" style={{ borderColor: '#d4a017' }} />安全线</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400/70" />透支</span>
      </div>

      {/* ── Tooltip (shows all data for active column) ── */}
      {activeDate && (() => {
        const day = days.find((d) => d.date === activeDate)
        if (!day) return null
        return (
          <div className="mt-2 rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[color:var(--text-primary)]">{day.date}</span>
              {day.isOverdraft
                ? <span className="rounded-md bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-rose">透支</span>
                : <span className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-green">正常</span>
              }
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <div>
                <div className="text-[10px] text-[color:var(--text-muted)]">收入</div>
                <div className="font-medium text-blue-400">{formatMoney(day.totalIncome)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[color:var(--text-muted)]">支出</div>
                <div className={day.isOverdraft ? 'font-medium text-accent-rose' : 'font-medium text-[color:var(--text-primary)]'}>{formatMoney(day.totalExpense)}</div>
              </div>
              <div>
                <div className="text-[10px] text-[color:var(--text-muted)]">安全线</div>
                <div className="font-medium text-[color:var(--text-secondary)]">{formatMoney(day.safeLine)}</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Day detail slice ── */}
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
