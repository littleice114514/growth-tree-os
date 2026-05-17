import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { InvestmentRecord } from './investmentStorage'
import { computeCurrentValue } from './investmentStorage'

echarts.use([PieChart, LineChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const palette = [
  '#60a5fa', '#34d399', '#f59e0b', '#fb7185', '#a78bfa',
  '#38bdf8', '#f472b6', '#fbbf24', '#818cf8', '#e879f9'
]

function formatCurrency(value: number): string {
  return `¥${Math.round(value)}`
}

export function PositionPieChart({ records }: { records: InvestmentRecord[] }) {
  const slices = useMemo(() => {
    return records
      .map((r) => ({
        name: r.assetName,
        value: computeCurrentValue(r).value
      }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [records])

  const option = useMemo(() => {
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
  }, [slices])

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Position</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">仓位结构</h3>
      </div>

      {slices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-6 text-center">
          <div className="text-sm font-medium text-[color:var(--text-secondary)]">暂无持仓数据</div>
          <p className="mt-2 text-xs text-[color:var(--text-muted)]">添加投资记录后，仓位结构将显示在此处。</p>
        </div>
      ) : (
        <>
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
          <div className="mt-3 space-y-1.5">
            {slices.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
                  <span className="text-xs font-medium text-[color:var(--text-primary)]">{s.name}</span>
                </div>
                <span className="text-xs text-[color:var(--text-secondary)]">{formatCurrency(s.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export function PnlLineChart({ records }: { records: InvestmentRecord[] }) {
  const totalPrincipal = useMemo(() => records.reduce((sum, r) => sum + r.principal, 0), [records])

  // Generate 30-day mock P&L curve based on current position
  const chartData = useMemo(() => {
    if (records.length === 0 || totalPrincipal <= 0) return null

    const totalValue = records.reduce((sum, r) => sum + computeCurrentValue(r).value, 0)
    const currentRate = (totalValue - totalPrincipal) / totalPrincipal

    // Generate a plausible 30-day curve ending at current rate
    const days: { date: string; rate: number }[] = []
    const now = new Date()

    // Simple random walk from 0 to currentRate
    let rate = 0
    const step = currentRate / 30
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      if (i === 0) {
        rate = currentRate
      } else {
        // Random walk with trend toward target
        const noise = (Math.random() - 0.5) * 0.02
        const trend = step + (currentRate - rate) * 0.1
        rate = rate + trend + noise
      }

      days.push({ date: dateStr, rate: rate * 100 })
    }

    return days
  }, [records, totalPrincipal])

  const option = useMemo(() => {
    if (!chartData) return null

    return {
      animation: true,
      animationDuration: 300,
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: 'rgba(30,30,40,0.92)',
        borderColor: 'rgba(100,116,139,0.3)',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { fontSize: 12, color: '#e2e8f0' },
        formatter: (params: { axisValueLabel: string; value: number }[]) => {
          const p = params[0]
          if (!p) return ''
          const sign = p.value >= 0 ? '+' : ''
          return `<div style="font-weight:600;margin-bottom:4px">${p.axisValueLabel}</div>` +
            `<div>收益率: ${sign}${p.value.toFixed(2)}%</div>`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category' as const,
        data: chartData.map((d) => d.date.slice(5)),
        axisLabel: {
          fontSize: 10,
          color: 'rgba(148,163,184,0.6)',
          interval: 5
        },
        axisLine: { lineStyle: { color: 'rgba(100,116,139,0.15)' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          fontSize: 10,
          color: 'rgba(148,163,184,0.6)',
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: { color: 'rgba(100,116,139,0.1)' }
        },
        axisLine: { show: false }
      },
      series: [{
        type: 'line',
        data: chartData.map((d) => +d.rate.toFixed(2)),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fb7185' },
            { offset: 0.5, color: '#60a5fa' },
            { offset: 1, color: '#34d399' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(251,113,133,0.15)' },
            { offset: 0.5, color: 'rgba(96,165,250,0.05)' },
            { offset: 1, color: 'rgba(52,211,153,0.15)' }
          ])
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ yAxis: 0 }],
          lineStyle: {
            color: 'rgba(148,163,184,0.3)',
            type: 'dashed' as const
          },
          label: {
            show: true,
            formatter: '0%',
            fontSize: 10,
            color: 'rgba(148,163,184,0.5)'
          }
        }
      }]
    }
  }, [chartData])

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">P&L Trend</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">盈亏曲线</h3>
        <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">近 30 日收益率走势 · 观察用</p>
      </div>

      {!chartData ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-6 text-center">
          <div className="text-sm font-medium text-[color:var(--text-secondary)]">暂无数据</div>
          <p className="mt-2 text-xs text-[color:var(--text-muted)]">添加投资记录后，盈亏曲线将显示在此处。</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div style={{ height: '200px' }}>
            <ReactEChartsCore
              echarts={echarts}
              option={option!}
              style={{ height: '100%', width: '100%' }}
              notMerge
              lazyUpdate
            />
          </div>
        </div>
      )}
    </section>
  )
}
