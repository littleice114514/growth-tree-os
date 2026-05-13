import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, ColorType, type CandlestickData, type HistogramData, type Time } from 'lightweight-charts'
import type { MarketCandle } from './marketDataTypes'

export function MarketKlineChart({
  candles,
  symbol,
  name
}: {
  candles: MarketCandle[]
  symbol: string
  name: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || candles.length === 0) return

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(148,163,184,0.8)',
        fontSize: 11,
        fontFamily: 'inherit'
      },
      grid: {
        vertLines: { color: 'rgba(100,116,139,0.08)' },
        horzLines: { color: 'rgba(100,116,139,0.08)' }
      },
      crosshair: {
        mode: 1 // Magnet
      },
      rightPriceScale: {
        borderColor: 'rgba(100,116,139,0.15)',
        scaleMargins: { top: 0.05, bottom: 0.25 }
      },
      timeScale: {
        borderColor: 'rgba(100,116,139,0.15)',
        timeVisible: false,
        secondsVisible: false
      }
    })

    const candleData: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }))

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#6ee7b7',
      downColor: '#fb7185',
      borderUpColor: '#6ee7b7',
      borderDownColor: '#fb7185',
      wickUpColor: 'rgba(110,231,183,0.6)',
      wickDownColor: 'rgba(251,113,133,0.6)'
    })
    candleSeries.setData(candleData)

    const volumeData: HistogramData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume ?? 0,
      color: c.close >= c.open ? 'rgba(110,231,183,0.3)' : 'rgba(251,113,133,0.3)'
    }))

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: ''
    })
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    })
    volumeSeries.setData(volumeData)

    chart.timeScale().fitContent()

    chartRef.current = chart

    return () => {
      chart.remove()
      chartRef.current = null
    }
  }, [candles])

  if (candles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[color:var(--text-muted)]">
        暂无 {name} ({symbol}) 的 K 线数据
      </div>
    )
  }

  return (
    <div>
      <div ref={containerRef} style={{ height: '320px' }} />
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
