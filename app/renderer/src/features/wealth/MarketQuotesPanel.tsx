import { useEffect, useMemo, useState } from 'react'
import type { MarketWatchlistItem, MarketCandle, MarketType, MarketSource } from './marketDataTypes'
import { marketGroupOrder, marketTypeLabels, marketSourceLabels } from './marketDataTypes'
import { getMarketWatchlist, getMarketCandles } from './marketDataService'
import { MarketKlineChart } from './MarketKlineChart'
import { loadCustomWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from './watchlistStorage'

const defaultSymbols = new Set([
  '000001', '000300', '600519', '005827',
  'SPY', 'QQQ', 'NVDA', 'TSLA',
  'BTC-USD', 'ETH-USD'
])

export function MarketQuotesPanel() {
  const [watchlist, setWatchlist] = useState<MarketWatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [candles, setCandles] = useState<MarketCandle[]>([])
  const [candleSource, setCandleSource] = useState<'finnhub-live' | 'yahoo-live' | 'mock'>('mock')
  const [candlesLoading, setCandlesLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [customSymbols, setCustomSymbols] = useState<WatchlistItem[]>(() => loadCustomWatchlist())

  // Form state
  const [newSymbol, setNewSymbol] = useState('')
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<MarketType>('us-stock')
  const [newSource, setNewSource] = useState<MarketSource>('finnhub')

  const reloadWatchlist = async () => {
    const items = await getMarketWatchlist()
    setWatchlist(items)
    setLoading(false)
    setApiKeyAvailable(items.some((i) => i.source === 'finnhub' && !i.isMock))
  }

  // Load watchlist on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await reloadWatchlist()
    })()
    return () => { cancelled = true }
  }, [])

  // Load candles when symbol changes
  useEffect(() => {
    if (!selectedSymbol || !selectedSource) {
      setCandles([])
      setCandleSource('mock')
      return
    }
    let cancelled = false
    setCandlesLoading(true)
    ;(async () => {
      const quotePrice = watchlist.find(q => q.symbol === selectedSymbol)?.price
      console.info('[market-ui] selected', { selectedSymbol, selectedSource, quotePrice })
      const result = await getMarketCandles(selectedSymbol, selectedSource as any, quotePrice)
      if (!cancelled) {
        setCandles(result.candles)
        setCandleSource(result.candleSource)
        setCandlesLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [selectedSymbol, selectedSource, watchlist])

  const selectedQuote = selectedSymbol ? watchlist.find((q) => q.symbol === selectedSymbol) : null

  const toggleSymbol = (symbol: string, source: string) => {
    if (selectedSymbol === symbol) {
      setSelectedSymbol(null)
      setSelectedSource(null)
    } else {
      setSelectedSymbol(symbol)
      setSelectedSource(source)
    }
  }

  const handleAdd = () => {
    const symbol = newSymbol.trim().toUpperCase()
    const name = newName.trim()
    if (!symbol || !name) return

    const item: WatchlistItem = { symbol, name, marketType: newType, source: newSource }
    addToWatchlist(item)
    setCustomSymbols(loadCustomWatchlist())
    setNewSymbol('')
    setNewName('')
    setShowAddForm(false)
    reloadWatchlist()
  }

  const handleRemove = (symbol: string) => {
    removeFromWatchlist(symbol)
    setCustomSymbols(loadCustomWatchlist())
    if (selectedSymbol === symbol) {
      setSelectedSymbol(null)
      setSelectedSource(null)
    }
    reloadWatchlist()
  }

  const isCustom = (symbol: string) => !defaultSymbols.has(symbol)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Market</div>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">行情观察</h3>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              点击标的查看 30 日 K 线
              {loading
                ? ' · 加载中…'
                : apiKeyAvailable
                  ? ' · 海外行情来自 Finnhub'
                  : ' · 未配置 Finnhub API Key，当前显示 mock 数据'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
          >
            {showAddForm ? '取消' : '添加自选'}
          </button>
        </div>

        {/* Add custom symbol form */}
        {showAddForm ? (
          <div className="mb-4 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1 text-xs">
                <span className="text-[color:var(--text-muted)]">代码</span>
                <input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="例：AAPL"
                  className="rounded-xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)]"
                />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-[color:var(--text-muted)]">名称</span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例：Apple Inc."
                  className="rounded-xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)]"
                />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-[color:var(--text-muted)]">类型</span>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as MarketType)}
                  className="rounded-xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--node-selected-border)]"
                >
                  {(Object.keys(marketTypeLabels) as MarketType[]).map((t) => (
                    <option key={t} value={t}>{marketTypeLabels[t]}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs">
                <span className="text-[color:var(--text-muted)]">数据源</span>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as MarketSource)}
                  className="rounded-xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--node-selected-border)]"
                >
                  <option value="finnhub">Finnhub</option>
                  <option value="akshare">AKShare Mock</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newSymbol.trim() || !newName.trim()}
                className="rounded-xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)] disabled:opacity-40"
              >
                添加
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-[color:var(--text-muted)]">
            加载行情数据…
          </div>
        ) : (
          /* Watchlist by market group */
          marketGroupOrder.map((group) => {
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
                      isCustom={isCustom(item.symbol)}
                      onClick={() => toggleSymbol(item.symbol, item.source)}
                      onRemove={() => handleRemove(item.symbol)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
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
              <span className={`mt-1 inline-block rounded-md border px-1.5 py-0.5 text-[10px] ${
                candleSource === 'mock'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              }`}>
                {candleSource === 'finnhub-live' ? 'Candle · Finnhub Live'
                  : candleSource === 'yahoo-live' ? 'Candle · Yahoo Live'
                  : 'Candle · Mock'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedSymbol(null); setSelectedSource(null) }}
              className="rounded-lg border border-[color:var(--input-border)] px-2 py-1 text-xs text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)]"
            >
              关闭
            </button>
          </div>
          {candlesLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-[color:var(--text-muted)]">
              加载 K 线数据…
            </div>
          ) : (
            <MarketKlineChart
              key={selectedQuote.symbol}
              candles={candles}
              symbol={selectedQuote.symbol}
              name={selectedQuote.name}
            />
          )}
        </section>
      ) : null}
    </div>
  )
}

function QuoteCard({
  item,
  isSelected,
  isCustom,
  onClick,
  onRemove
}: {
  item: MarketWatchlistItem
  isSelected: boolean
  isCustom: boolean
  onClick: () => void
  onRemove: () => void
}) {
  const changeColor =
    item.changePercent >= 0 ? 'text-accent-green' : 'text-accent-rose'
  const changePrefix = item.changePercent >= 0 ? '+' : ''
  const cardClass = isSelected
    ? 'rounded-2xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] p-3 cursor-pointer transition'
    : 'rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 cursor-pointer transition hover:bg-[var(--control-hover)]'

  const isLive = item.source === 'finnhub' && !item.isMock

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[color:var(--text-primary)]">{item.name}</span>
            <span className="text-[10px] text-[color:var(--text-muted)]">{item.symbol}</span>
            {isCustom ? (
              <span className="rounded-md border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 text-[10px] text-violet-400">自选</span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-[color:var(--text-muted)]">
            <span className="rounded-md border border-[color:var(--input-border)] bg-[var(--control-bg)] px-1.5 py-0.5">
              {item.marketLabel}
            </span>
            <span className={`rounded-md border px-1.5 py-0.5 ${
              isLive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-[color:var(--input-border)] bg-[var(--control-bg)]'
            }`}>
              {item.sourceLabel}
            </span>
          </div>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="text-right">
            <div className="text-sm font-semibold text-[color:var(--text-primary)]">
              {formatPrice(item.price, item.marketType)}
            </div>
            <div className={`mt-0.5 text-xs font-medium ${changeColor}`}>
              {changePrefix}{item.changePercent}%
            </div>
          </div>
          {isCustom ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="rounded-lg border border-[color:var(--input-border)] px-1.5 py-0.5 text-[10px] text-[color:var(--text-muted)] transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-accent-rose"
            >
              移除
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-2 text-[10px] text-[color:var(--text-muted)]">
        更新: {formatTime(item.updatedAt)}
      </div>
    </div>
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
