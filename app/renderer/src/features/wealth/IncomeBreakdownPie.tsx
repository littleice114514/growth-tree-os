import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { WealthRecord } from '@shared/wealth'
import {
  calculateIncomeBreakdown,
  insightPeriodLabels,
  type InsightPeriod
} from './wealthRecordInsights'

echarts.use([PieChart, TooltipComponent, CanvasRenderer])

const palette = [
  '#34d399', // emerald
  '#60a5fa', // blue
  '#a78bfa', // violet
  '#f59e0b', // amber
  '#38bdf8', // sky
  '#f472b6', // pink
  '#fbbf24', // yellow
  '#818cf8', // indigo
  '#e879f9', // fuchsia
  '#fb7185'  // rose
]

function formatCurrency(value: number): string {
  return `¥${Math.round(value)}`
}

export function IncomeBreakdownPie({
  records,
  referenceDate,
  period,
  onPeriodChange
}: {
  records: WealthRecord[]
  referenceDate: string
  period: InsightPeriod
  onPeriodChange: (p: InsightPeriod) => void
}) {
  const breakdown = useMemo(
    () => calculateIncomeBreakdown(records, period, referenceDate),
    [records, period, referenceDate]
  )

  const option = useMemo(() => {
    if (breakdown.slices.length === 0) return null

    return {
      animation: true,
      animationDuration: 300,
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: 'rgba(30,30,40,0.92)',
        borderColor: 'rgba(100,116,139,0.3)',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { fontSize: 12, color: '#e2e8f0' },
        formatter: (p: { name: string; value: number; percent: number }) =>
          `<div style="font-weight:600;margin-bottom:4px">${p.name}</div>` +
          `<div>${formatCurrency(p.value)} · ${p.percent.toFixed(1)}%</div>`
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: 'var(--inspector-section-bg, #1e1e2e)',
            borderWidth: 2
          },
          label: {
            show: true,
            fontSize: 10,
            color: 'rgba(148,163,184,0.7)',
            formatter: '{b}\n{d}%'
          },
          labelLine: {
            lineStyle: { color: 'rgba(100,116,139,0.2)' }
          },
          emphasis: {
            label: { fontWeight: 'bold', fontSize: 11 },
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.2)'
            }
          },
          data: breakdown.slices.map((s, i) => ({
            name: s.source,
            value: s.amount,
            itemStyle: { color: palette[i % palette.length] }
          }))
        }
      ]
    }
  }, [breakdown])

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Income</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">收入来源结构</h3>
        </div>
        <div className="flex gap-2">
          {(Object.keys(insightPeriodLabels) as InsightPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={
                period === p
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-1.5 text-xs text-[color:var(--text-primary)]'
                  : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {insightPeriodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {breakdown.slices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-6 text-center">
          <div className="text-sm font-medium text-[color:var(--text-secondary)]">这段时间还没有收入记录</div>
          <p className="mt-2 text-xs text-[color:var(--text-muted)]">
            记录一笔收入后，系统会分析你的收入来源结构。
          </p>
        </div>
      ) : (
        <>
          {/* Metrics row */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="收入总额" value={formatCurrency(breakdown.total)} className="text-accent-green" />
            <MetricCard label="最大来源" value={breakdown.maxSource} className="text-[color:var(--text-primary)]" />
            <MetricCard label="稳定收入占比" value={`${(breakdown.stableRatio * 100).toFixed(1)}%`} className="text-accent-cyan" />
            <MetricCard label="睡后收入占比" value={`${(breakdown.passiveRatio * 100).toFixed(1)}%`} className="text-accent-violet" />
          </div>

          {/* Pie chart */}
          <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
            <div style={{ height: '220px' }}>
              <ReactEChartsCore
                echarts={echarts}
                option={option!}
                style={{ height: '100%', width: '100%' }}
                notMerge
                lazyUpdate
              />
            </div>
          </div>

          {/* Source list */}
          <div className="mt-3 space-y-1.5">
            {breakdown.slices.map((s, i) => (
              <div
                key={s.source}
                className="flex items-center justify-between rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: palette[i % palette.length] }}
                  />
                  <span className="text-xs font-medium text-[color:var(--text-primary)]">{s.source}</span>
                  {s.isStable ? (
                    <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] text-accent-cyan">稳定</span>
                  ) : null}
                  {s.isPassive ? (
                    <span className="rounded-md border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 text-[10px] text-accent-violet">睡后</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[color:var(--text-secondary)]">{formatCurrency(s.amount)}</span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">{(s.ratio * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2 text-right">
            <span className="text-xs text-[color:var(--text-muted)]">合计 </span>
            <span className="text-xs font-semibold text-accent-green">{formatCurrency(breakdown.total)}</span>
          </div>
        </>
      )}
    </section>
  )
}

function MetricCard({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="text-[10px] text-[color:var(--text-muted)]">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${className}`}>{value}</div>
    </div>
  )
}
