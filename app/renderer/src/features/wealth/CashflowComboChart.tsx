import { useCallback, useMemo, useRef, useState } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { WealthRecord } from '@shared/wealth'
import { wealthRecordTypeLabels } from '@shared/wealth'
import type { CashflowTrend, TrendDay } from './overdraftTracker'

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  CanvasRenderer
])

export function CashflowComboChart({
  trend,
  records,
  safeLine
}: {
  trend: CashflowTrend
  records: WealthRecord[]
  safeLine: number
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const chartRef = useRef<ReactEChartsCore>(null)

  const { days, period } = trend
  const dayCount = days.length

  const selectedRecords = selectedDate ? records.filter((r) => r.date === selectedDate) : []
  const selectedDay = selectedDate ? days.find((d) => d.date === selectedDate) : null

  const toggleDate = useCallback(
    (date: string) => setSelectedDate((prev) => (prev === date ? null : date)),
    []
  )

  // Connect click on chart to day selection
  const onChartClick = useCallback(
    (params: { name?: string }) => {
      if (params.name) {
        toggleDate(params.name)
      }
    },
    [toggleDate]
  )

  const dates = useMemo(() => days.map((d) => d.date.slice(5)), [days]) // MM-DD for X axis
  const expenseData = useMemo(() => days.map((d) => d.totalExpense), [days])
  const incomeData = useMemo(() => days.map((d) => d.totalIncome), [days])

  // Color each bar: green normal, rose overdraft
  const barColors = useMemo(
    () =>
      days.map((d) =>
        d.isOverdraft
          ? 'rgba(251,113,133,0.65)'
          : 'rgba(110,231,183,0.55)'
      ),
    [days]
  )

  const option = useMemo(() => {
    // X-axis label density: show all for 7d, sparse for 30d
    const showLabel = (i: number) => {
      if (period === 'last7') return true
      if (days[i].date === selectedDate) return true
      if (i === 0 || i === dayCount - 1) return true
      return i % 5 === 0
    }

    return {
      animation: false,
      grid: {
        top: 32,
        right: 16,
        bottom: 28,
        left: 12,
        containLabel: false
      },
      legend: {
        top: 0,
        left: 0,
        itemWidth: 16,
        itemHeight: 8,
        itemGap: 16,
        textStyle: {
          fontSize: 11,
          color: 'rgba(148,163,184,0.8)'
        },
        data: ['支出', '收入', '安全线']
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30,30,40,0.92)',
        borderColor: 'rgba(100,116,139,0.3)',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: {
          fontSize: 12,
          color: '#e2e8f0'
        },
        formatter: (params: { seriesName: string; name: string; value: number; dataIndex: number }[]) => {
          const idx = params[0]?.dataIndex
          if (idx == null) return ''
          const day = days[idx]
          if (!day) return ''

          const statusLabel = day.isOverdraft
            ? `<span style="color:#fb7185">透支 ¥${Math.abs(day.totalExpense - day.safeLine)}</span>`
            : '<span style="color:#6ee7b7">正常</span>'

          return `
            <div style="font-weight:600;margin-bottom:6px">${day.date} ${statusLabel}</div>
            <div style="display:flex;gap:16px">
              <div>
                <div style="color:#94a3b8;font-size:10px">收入</div>
                <div style="color:#60a5fa;font-weight:600">${formatMoney(day.totalIncome)}</div>
              </div>
              <div>
                <div style="color:#94a3b8;font-size:10px">支出</div>
                <div style="color:${day.isOverdraft ? '#fb7185' : '#e2e8f0'};font-weight:600">${formatMoney(day.totalExpense)}</div>
              </div>
              <div>
                <div style="color:#94a3b8;font-size:10px">安全线</div>
                <div style="color:#d4a017;font-weight:600">${formatMoney(day.safeLine)}</div>
              </div>
            </div>
          `
        }
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: 'rgba(100,116,139,0.15)' } },
        axisLabel: {
          fontSize: 10,
          color: 'rgba(148,163,184,0.6)',
          interval: (i: number) => showLabel(i),
          rotate: period === 'last30' ? 30 : 0
        }
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          name: '支出',
          type: 'bar',
          data: expenseData.map((val, i) => ({
            value: val,
            itemStyle: { color: barColors[i], borderRadius: [3, 3, 0, 0] }
          })),
          barWidth: period === 'last30' ? '45%' : '50%',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#f59e0b',
              type: 'dashed',
              width: 1.5,
              opacity: 0.7
            },
            data: [{ yAxis: safeLine, name: '安全线' }],
            label: {
              position: 'end',
              formatter: `安全线 ¥${safeLine}`,
              fontSize: 10,
              color: '#f59e0b'
            }
          }
        },
        {
          name: '收入',
          type: 'line',
          data: incomeData,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#60a5fa',
            width: 2
          },
          itemStyle: {
            color: '#60a5fa'
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 6,
              shadowColor: 'rgba(96,165,250,0.4)'
            },
            scale: 1.8
          },
          z: 10
        }
      ]
    }
  }, [days, dates, expenseData, incomeData, barColors, safeLine, period, selectedDate, dayCount])

  // All zero state
  const allZero = days.every((d) => d.totalExpense === 0 && d.totalIncome === 0)

  if (dayCount === 0) return null

  if (allZero) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-[80px] w-full opacity-15">
          <ReactEChartsCore
            ref={chartRef}
            echarts={echarts}
            option={option}
            style={{ height: '100%', width: '100%' }}
            notMerge
            lazyUpdate
          />
        </div>
        <div className="mt-3 text-xs font-medium text-[color:var(--text-secondary)]">等待数据</div>
        <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">新增记录后，趋势图将自动更新。</p>
      </div>
    )
  }

  return (
    <div>
      {/* ECharts chart */}
      <div style={{ height: '220px' }}>
        <ReactEChartsCore
          ref={chartRef}
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={{ click: onChartClick }}
          notMerge
          lazyUpdate
        />
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[color:var(--text-muted)]">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-emerald-300/50" />支出</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: '#60a5fa' }} />收入</span>
        <span className="flex items-center gap-1"><span className="inline-block h-0 w-3 border-t border-dashed" style={{ borderColor: '#f59e0b' }} />安全线</span>
        <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400/70" />透支</span>
      </div>

      {/* Day detail slice (on click) */}
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
