import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { CandlestickChart, BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { MarketCandle } from './marketDataTypes'

echarts.use([CandlestickChart, BarChart, LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer])

export function MarketKlineChart({
  candles,
  symbol,
  name
}: {
  candles: MarketCandle[]
  symbol: string
  name: string
}) {
  const dates = useMemo(() => candles.map((c) => c.time.slice(5)), [candles])
  const ohlcData = useMemo(
    () => candles.map((c) => [c.open, c.close, c.low, c.high]),
    [candles]
  )
  const volumeData = useMemo(
    () =>
      candles.map((c, i) => ({
        value: c.volume ?? 0,
        itemStyle: {
          color: c.close >= c.open ? 'rgba(110,231,183,0.4)' : 'rgba(251,113,133,0.4)'
        }
      })),
    [candles]
  )

  const option = useMemo(
    () => ({
      animation: false,
      grid: [
        { top: 24, right: 16, bottom: 60, left: 12, containLabel: true },
        { top: '70%', right: 16, bottom: 32, left: 12, containLabel: true }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(30,30,40,0.92)',
        borderColor: 'rgba(100,116,139,0.3)',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { fontSize: 12, color: '#e2e8f0' },
        formatter: (
          params: { seriesName: string; name: string; value: number[] | number; dataIndex: number }[]
        ) => {
          const idx = params[0]?.dataIndex
          if (idx == null) return ''
          const candle = candles[idx]
          if (!candle) return ''
          const upDown = candle.close >= candle.open ? '涨' : '跌'
          const color = candle.close >= candle.open ? '#6ee7b7' : '#fb7185'
          return `
            <div style="font-weight:600;margin-bottom:6px">${candle.time}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;font-size:11px">
              <div><span style="color:#94a3b8">开</span> ${candle.open}</div>
              <div><span style="color:#94a3b8">收</span> <span style="color:${color}">${candle.close}</span></div>
              <div><span style="color:#94a3b8">高</span> ${candle.high}</div>
              <div><span style="color:#94a3b8">低</span> ${candle.low}</div>
            </div>
            <div style="margin-top:4px;font-size:10px;color:${color}">${upDown}</div>
          `
        }
      },
      xAxis: [
        {
          type: 'category',
          data: dates,
          gridIndex: 0,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: 'rgba(100,116,139,0.15)' } },
          axisLabel: {
            fontSize: 10,
            color: 'rgba(148,163,184,0.6)',
            interval: 4,
            rotate: 30
          }
        },
        {
          type: 'category',
          data: dates,
          gridIndex: 1,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: 'rgba(100,116,139,0.15)' } },
          axisLabel: { show: false }
        }
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: 'rgba(100,116,139,0.08)' } },
          axisLabel: {
            fontSize: 10,
            color: 'rgba(148,163,184,0.5)'
          }
        },
        {
          type: 'value',
          gridIndex: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false }
        }
      ],
      series: [
        {
          name: 'K 线',
          type: 'candlestick',
          data: ohlcData,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: 'rgba(110,231,183,0.8)',
            color0: 'rgba(251,113,133,0.8)',
            borderColor: '#6ee7b7',
            borderColor0: '#fb7185',
            borderWidth: 1
          }
        },
        {
          name: '成交量',
          type: 'bar',
          data: volumeData,
          xAxisIndex: 1,
          yAxisIndex: 1,
          barWidth: '60%'
        }
      ]
    }),
    [candles, dates, ohlcData, volumeData]
  )

  if (candles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[color:var(--text-muted)]">
        暂无 {name} ({symbol}) 的 K 线数据
      </div>
    )
  }

  return (
    <div>
      <div style={{ height: '280px' }}>
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
          notMerge
          lazyUpdate
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[color:var(--text-muted)]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-emerald-300/60" />
          涨
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-rose-300/60" />
          跌
        </span>
        <span>30 日 K 线 · {candles[0]?.time} ~ {candles[candles.length - 1]?.time}</span>
      </div>
    </div>
  )
}
