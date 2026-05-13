import { useMemo, useState } from 'react'
import type { MarketWatchlistItem } from './marketDataTypes'
import { marketGroupOrder } from './marketDataTypes'
import { getMarketWatchlist, getMarketCandles } from './marketDataService'
import { MarketKlineChart } from './MarketKlineChart'

export function MarketQuotesPanel() {
  const watchlist = useMemo(() => getMarketWatchlist(), [])
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  const selectedQuote = selectedSymbol ? watchlist.find((q) => q.symbol === selectedSymbol) : null
  const selectedCandles = useMemo(
    () => (selectedSymbol ? getMarketCandles(selectedSymbol) : []),
    [selectedSymbol]
  )

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbol((prev) => (prev === symbol ? null : symbol))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Market</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">行情观察</h3>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            固定标的行情快照 · 点击标的查看 30 日 K 线 · 数据为 mock 演示
          </p>
        </div>

        {/* Watchlist by market group */}
        {marketGroupOrder.map((group) => {
          const items = watchlist.filter((q) => group.types.includes(q.marketType))
          if (items.length === 0) return null
          return (
            <div key={group.key} className="mb-4 last:mb-0">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                {group.label}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-2">
                {items.map((item) => (
                  <QuoteCard
                    key={item.symbol}
                    item={item}
                    isSelected={selectedSymbol === item.symbol}
                    onClick={() => toggleSymbol(item.symbol)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* K-line detail */}
      {selectedQuote ? (
        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">K-Line</div>
              <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">
                {selectedQuote.name}
                <span className="ml-2 text-sm font-normal text-[color:var(--text-muted)]">{selectedQuote.symbol}</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSymbol(null)}
              className="rounded-lg border border-[color:var(--input-border)] px-2 py-1 text-xs text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)]"
            >
              关闭
            </button>
          </div>
          <MarketKlineChart
            candles={selectedCandles}
            symbol={selectedQuote.symbol}
            name={selectedQuote.name}
          />
        </section>
      ) : null}
    </div>
  )
}

function QuoteCard({
  item,
  isSelected,
  onClick
}: {
  item: MarketWatchlistItem
  isSelected: boolean
  onClick: () => void
}) {
  const changeColor =
    item.changePercent >= 0 ? 'text-accent-green' : 'text-accent-rose'
  const changePrefix = item.changePercent >= 0 ? '+' : ''
  const cardClass = isSelected
    ? 'rounded-2xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] p-3 cursor-pointer transition'
    : 'rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 cursor-pointer transition hover:bg-[var(--control-hover)]'

  return (
    <button type="button" onClick={onClick} className={cardClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[color:var(--text-primary)]">{item.name}</span>
            <span className="text-[10px] text-[color:var(--text-muted)]">{item.symbol}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[color:var(--text-muted)]">
            <span className="rounded-md border border-[color:var(--input-border)] bg-[var(--control-bg)] px-1.5 py-0.5">
              {item.marketLabel}
            </span>
            <span className="rounded-md border border-[color:var(--input-border)] bg-[var(--control-bg)] px-1.5 py-0.5">
              {item.sourceLabel}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-semibold text-[color:var(--text-primary)]">
            {formatPrice(item.price, item.marketType)}
          </div>
          <div className={`mt-0.5 text-xs font-medium ${changeColor}`}>
            {changePrefix}{item.changePercent}%
          </div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-[color:var(--text-muted)]">
        更新: {formatTime(item.updatedAt)}
      </div>
    </button>
  )
}

function formatPrice(price: number, marketType: string): string {
  if (marketType === 'cn-fund') return price.toFixed(4)
  if (marketType === 'crypto') return price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)
  return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
