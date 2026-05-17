import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { WealthRecord } from '@shared/wealth'
import {
  calculateIncomeBreakdown,
  calculateExpenseBreakdown,
  insightPeriodLabels,
  type InsightPeriod
} from './wealthRecordInsights'

echarts.use([PieChart, TooltipComponent, CanvasRenderer])

const incomePalette = [
  '#34d399', '#60a5fa', '#a78bfa', '#f59e0b', '#38bdf8',
  '#f472b6', '#fbbf24', '#818cf8', '#e879f9', '#fb7185'
]

const expensePalette = [
  '#60a5fa', '#34d399', '#f59e0b', '#fb7185', '#a78bfa',
  '#38bdf8', '#f472b6', '#fbbf24', '#818cf8', '#e879f9'
]

function formatCurrency(value: number): string {
  return `¥${Math.round(value)}`
}

function buildPieOption(slices: { name: string; value: number }[], palette: string[]) {
  if (slices.length === 0) return null
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
    series: [{
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
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' }
      },
      data: slices.map((s, i) => ({
        name: s.name,
        value: s.value,
        itemStyle: { color: palette[i % palette.length] }
      }))
    }]
  }
}

export function CashflowBreakdownDualPie({
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
  const incomeBreakdown = useMemo(
    () => calculateIncomeBreakdown(records, period, referenceDate),
    [records, period, referenceDate]
  )
  const expenseBreakdown = useMemo(
    () => calculateExpenseBreakdown(records, period, referenceDate),
    [records, period, referenceDate]
  )

  const incomeSlices = incomeBreakdown.slices.map((s) => ({ name: s.source, value: s.amount }))
  const expenseSlices = expenseBreakdown.slices.map((s) => ({ name: s.category, value: s.amount }))

  const incomeOption = useMemo(() => buildPieOption(incomeSlices, incomePalette), [incomeSlices])
  const expenseOption = useMemo(() => buildPieOption(expenseSlices, expensePalette), [expenseSlices])

  const hasIncome = incomeBreakdown.slices.length > 0
  const hasExpense = expenseBreakdown.slices.length > 0

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">开源 / 节流</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">收支结构对比</h3>
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

      {/* Summary metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="收入总额" value={formatCurrency(incomeBreakdown.total)} className="text-accent-green" />
        <MetricCard label="支出总额" value={formatCurrency(expenseBreakdown.total)} className="text-accent-rose" />
        <MetricCard label="最大收入来源" value={incomeBreakdown.maxSource || '--'} className="text-[color:var(--text-primary)]" />
        <MetricCard label="最大支出方向" value={expenseBreakdown.slices[0]?.category || '--'} className="text-[color:var(--text-primary)]" />
      </div>

      {/* Dual pie charts: side by side on wide, stacked on narrow */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Income pie */}
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="mb-2 text-center text-xs font-semibold text-accent-green">收入来源</div>
          {!hasIncome ? (
            <div className="flex h-[180px] items-center justify-center text-xs text-[color:var(--text-muted)]">
              暂无收入记录
            </div>
          ) : (
            <>
              <div style={{ height: '180px' }}>
                <ReactEChartsCore
                  echarts={echarts}
                  option={incomeOption!}
                  style={{ height: '100%', width: '100%' }}
                  notMerge
                  lazyUpdate
                />
              </div>
              <div className="mt-2 space-y-1">
                {incomeBreakdown.slices.map((s, i) => (
                  <div key={s.source} className="flex items-center justify-between rounded-lg px-2 py-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: incomePalette[i % incomePalette.length] }} />
                      <span className="text-[color:var(--text-secondary)]">{s.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[color:var(--text-muted)]">{formatCurrency(s.amount)}</span>
                      <span className="text-[color:var(--text-muted)]">{(s.ratio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Expense pie */}
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="mb-2 text-center text-xs font-semibold text-accent-rose">支出结构</div>
          {!hasExpense ? (
            <div className="flex h-[180px] items-center justify-center text-xs text-[color:var(--text-muted)]">
              暂无支出记录
            </div>
          ) : (
            <>
              <div style={{ height: '180px' }}>
                <ReactEChartsCore
                  echarts={echarts}
                  option={expenseOption!}
                  style={{ height: '100%', width: '100%' }}
                  notMerge
                  lazyUpdate
                />
              </div>
              <div className="mt-2 space-y-1">
                {expenseBreakdown.slices.map((s, i) => (
                  <div key={s.category} className="flex items-center justify-between rounded-lg px-2 py-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: expensePalette[i % expensePalette.length] }} />
                      <span className="text-[color:var(--text-secondary)]">{s.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[color:var(--text-muted)]">{formatCurrency(s.amount)}</span>
                      <span className="text-[color:var(--text-muted)]">{(s.ratio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Income/Expense ratio bar */}
      {(hasIncome || hasExpense) ? (
        <div className="mt-3 rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[color:var(--text-muted)]">
              收入/支出比：
              <span className="font-semibold text-[color:var(--text-primary)]">
                {expenseBreakdown.total > 0
                  ? `${(incomeBreakdown.total / expenseBreakdown.total).toFixed(2)}`
                  : '--'}
              </span>
            </span>
            <span className="text-[color:var(--text-muted)]">
              结余：
              <span className={`font-semibold ${incomeBreakdown.total - expenseBreakdown.total >= 0 ? 'text-accent-green' : 'text-accent-rose'}`}>
                {formatCurrency(incomeBreakdown.total - expenseBreakdown.total)}
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MetricCard({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="text-[10px] text-[color:var(--text-muted)]">{label}</div>
      <div className={`mt-1 truncate text-sm font-semibold ${className}`}>{value}</div>
    </div>
  )
}
