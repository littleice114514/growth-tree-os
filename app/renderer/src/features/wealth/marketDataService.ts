import type { MarketQuote, MarketCandle, MarketCandleResult, MarketWatchlistItem, MarketType, MarketSource } from './marketDataTypes'
import { marketTypeLabels, marketSourceLabels } from './marketDataTypes'

// ── Fixed watchlist ──

const watchlistDef: { symbol: string; name: string; marketType: MarketType; source: MarketSource }[] = [
  // 国内 (mock)
  { symbol: '000001', name: '上证指数', marketType: 'cn-index', source: 'akshare' },
  { symbol: '000300', name: '沪深300', marketType: 'cn-index', source: 'akshare' },
  { symbol: '600519', name: '贵州茅台', marketType: 'cn-stock', source: 'akshare' },
  { symbol: '005827', name: '易方达蓝筹精选', marketType: 'cn-fund', source: 'akshare' },
  // 海外 (finnhub)
  { symbol: 'SPY', name: 'SPDR S&P 500', marketType: 'us-etf', source: 'finnhub' },
  { symbol: 'QQQ', name: 'Invesco QQQ', marketType: 'us-etf', source: 'finnhub' },
  { symbol: 'NVDA', name: 'NVIDIA', marketType: 'us-stock', source: 'finnhub' },
  { symbol: 'TSLA', name: 'Tesla', marketType: 'us-stock', source: 'finnhub' },
  // 加密 (finnhub)
  { symbol: 'BTC-USD', name: 'Bitcoin', marketType: 'crypto', source: 'finnhub' },
  { symbol: 'ETH-USD', name: 'Ethereum', marketType: 'crypto', source: 'finnhub' }
]

// ── Mock data generators (fallback) ──

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateMockQuote(def: (typeof watchlistDef)[number], seed: number): MarketQuote {
  const rand = seededRandom(seed)
  const basePrice =
    def.marketType === 'crypto'
      ? def.symbol.startsWith('BTC')
        ? 67000
        : 3400
      : def.marketType.startsWith('us')
        ? def.symbol === 'NVDA'
          ? 120
          : def.symbol === 'TSLA'
            ? 175
            : def.symbol === 'QQQ'
              ? 450
              : 520
        : def.marketType === 'cn-fund'
          ? 2.1
          : def.symbol === '000001'
            ? 3150
            : 3800

  const noise = (rand() - 0.5) * basePrice * 0.02
  const price = +(basePrice + noise).toFixed(def.marketType === 'cn-fund' ? 4 : 2)
  const changePercent = +((rand() - 0.48) * 4).toFixed(2)

  const now = new Date()
  const hourAgo = new Date(now.getTime() - rand() * 3600000)

  return {
    symbol: def.symbol,
    name: def.name,
    marketType: def.marketType,
    source: def.source,
    price,
    changePercent,
    updatedAt: hourAgo.toISOString(),
    isMock: true
  }
}

function generateMockCandles(symbol: string, days: number = 30, basePriceOverride?: number): MarketCandle[] {
  const seed = hashSymbol(symbol)
  const rand = seededRandom(seed)
  const defaultBase =
    symbol.startsWith('BTC')
      ? 65000
      : symbol.startsWith('ETH')
        ? 3200
        : symbol === 'NVDA'
          ? 110
          : symbol === 'TSLA'
            ? 170
            : symbol === 'QQQ'
              ? 440
              : symbol === 'SPY'
                ? 510
                : symbol.endsWith('000001')
                  ? 3000
                  : symbol.endsWith('000300')
                    ? 3600
                    : symbol === '600519'
                      ? 1700
                      : 2.0
  const basePrice = basePriceOverride ?? defaultBase
  console.info('[market-data] mock candle base', { symbol, basePrice, override: basePriceOverride })

  const candles: MarketCandle[] = []
  let lastClose = basePrice

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)

    const volatility = basePrice * 0.015
    const open = lastClose + (rand() - 0.5) * volatility
    const close = open + (rand() - 0.5) * volatility * 1.5
    const high = Math.max(open, close) + rand() * volatility * 0.5
    const low = Math.min(open, close) - rand() * volatility * 0.5
    const volume = Math.round(rand() * 1000000 + 500000)

    const precision = symbol.endsWith('-USD') ? 2 : symbol === '005827' ? 4 : 2

    candles.push({
      time: dateStr,
      open: +open.toFixed(precision),
      high: +high.toFixed(precision),
      low: +low.toFixed(precision),
      close: +close.toFixed(precision),
      volume
    })

    lastClose = close
  }

  return candles
}

function hashSymbol(symbol: string): number {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = ((hash << 5) - hash + symbol.charCodeAt(i)) | 0
  }
  return Math.abs(hash) + 1
}

// ── Source label with live/mock indicator ──

function getSourceLabel(source: MarketSource, isMock: boolean): string {
  if (source === 'finnhub') {
    return isMock ? 'Finnhub · Mock' : 'Finnhub · Live'
  }
  return 'AKShare · Mock'
}

// ── Public API ──

/**
 * Returns the market watchlist with real Finnhub quotes where available,
 * falling back to mock data for domestic (akshare) or when API key is missing.
 */
export async function getMarketWatchlist(): Promise<MarketWatchlistItem[]> {
  let hasKey = false
  try {
    hasKey = await window.growthTree.market.hasApiKey()
  } catch {
    // IPC not available — fallback to mock
  }

  let finnhubQuotes: Record<string, { price: number; changePercent: number; updatedAt: string }> = {}

  if (hasKey) {
    const finnhubSymbols = watchlistDef.filter((d) => d.source === 'finnhub').map((d) => d.symbol)
    try {
      const results = await window.growthTree.market.fetchQuotes(finnhubSymbols)
      for (const r of results) {
        if (!r.error) {
          finnhubQuotes[r.symbol] = { price: r.price, changePercent: r.changePercent, updatedAt: r.updatedAt }
        }
      }
    } catch {
      // IPC call failed — all finnhub items will fall back to mock
    }
  }

  return watchlistDef.map((def, i) => {
    let quote: MarketQuote

    if (def.source === 'finnhub' && finnhubQuotes[def.symbol]) {
      const real = finnhubQuotes[def.symbol]
      quote = {
        symbol: def.symbol,
        name: def.name,
        marketType: def.marketType,
        source: def.source,
        price: real.price,
        changePercent: real.changePercent,
        updatedAt: real.updatedAt,
        isMock: false
      }
    } else {
      quote = generateMockQuote(def, hashSymbol(def.symbol) + i * 7)
    }

    return {
      ...quote,
      marketLabel: marketTypeLabels[quote.marketType],
      sourceLabel: getSourceLabel(quote.source, quote.isMock ?? true)
    }
  })
}

/**
 * Returns 30-day K-line candles for a given symbol.
 * Finnhub symbols (us-stock, us-etf, crypto) → Yahoo Finance via IPC (free, real data).
 * Domestic symbols (akshare) → mock fallback.
 */
export async function getMarketCandles(symbol: string, source?: MarketSource, quotePrice?: number): Promise<MarketCandleResult> {
  console.info('[market-data] candles request', { symbol, source, quotePrice })

  // For finnhub-sourced symbols, try Yahoo Finance via IPC (avoids CORS)
  if (source === 'finnhub') {
    try {
      const result = await window.growthTree.market.fetchYahooCandles(symbol)
      if (!result.error && result.candles.length > 0) {
        console.info('[market-data] yahoo candle OK', { symbol, bars: result.candles.length })
        return { candles: result.candles, candleSource: 'yahoo-live' }
      }
    } catch (e) {
      console.warn('[market-data] yahoo candle failed', { symbol, error: String(e) })
    }
  }

  // Fallback: mock candles aligned to quote price
  return { candles: generateMockCandles(symbol, 30, quotePrice), candleSource: 'mock' }
}
