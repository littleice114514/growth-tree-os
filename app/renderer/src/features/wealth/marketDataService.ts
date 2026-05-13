import type { MarketQuote, MarketCandle, MarketWatchlistItem, MarketType, MarketSource } from './marketDataTypes'
import { marketTypeLabels, marketSourceLabels } from './marketDataTypes'

// ── Fixed watchlist ──

const watchlistDef: { symbol: string; name: string; marketType: MarketType; source: MarketSource }[] = [
  // 国内
  { symbol: '000001', name: '上证指数', marketType: 'cn-index', source: 'akshare' },
  { symbol: '000300', name: '沪深300', marketType: 'cn-index', source: 'akshare' },
  { symbol: '600519', name: '贵州茅台', marketType: 'cn-stock', source: 'akshare' },
  { symbol: '005827', name: '易方达蓝筹精选', marketType: 'cn-fund', source: 'akshare' },
  // 海外
  { symbol: 'SPY', name: 'SPDR S&P 500', marketType: 'us-etf', source: 'finnhub' },
  { symbol: 'QQQ', name: 'Invesco QQQ', marketType: 'us-etf', source: 'finnhub' },
  { symbol: 'NVDA', name: 'NVIDIA', marketType: 'us-stock', source: 'finnhub' },
  { symbol: 'TSLA', name: 'Tesla', marketType: 'us-stock', source: 'finnhub' },
  // 加密
  { symbol: 'BTC-USD', name: 'Bitcoin', marketType: 'crypto', source: 'finnhub' },
  { symbol: 'ETH-USD', name: 'Ethereum', marketType: 'crypto', source: 'finnhub' }
]

// ── Mock data generators ──

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
    updatedAt: hourAgo.toISOString()
  }
}

function generateMockCandles(symbol: string, days: number = 30): MarketCandle[] {
  const seed = hashSymbol(symbol)
  const rand = seededRandom(seed)
  const basePrice =
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

// ── Public API ──

/**
 * Returns the fixed market watchlist with mock quotes.
 *
 * Future integration points:
 * - AKShare: 国内指数/股票/基金行情需通过本地 Python 服务或脚本代理接入
 *   接入方式：前端 → IPC → main process → spawn python script / HTTP to local AKShare server
 * - Finnhub: 海外股票/ETF/加密行情需通过主进程 IPC 或后端代理接入
 *   接入方式：前端 → IPC → main process → fetch Finnhub API (API key 存在主进程，不暴露前端)
 */
export function getMarketWatchlist(): MarketWatchlistItem[] {
  return watchlistDef.map((def, i) => {
    const quote = generateMockQuote(def, hashSymbol(def.symbol) + i * 7)
    return {
      ...quote,
      marketLabel: marketTypeLabels[quote.marketType],
      sourceLabel: marketSourceLabels[quote.source]
    }
  })
}

/**
 * Returns mock 30-day K-line candles for a given symbol.
 *
 * Future integration points:
 * - AKShare: ak.stock_zh_a_hist() / ak.index_zh_a_hist() / ak.fund_open_fund_info_em()
 * - Finnhub: GET /stock/candle?symbol={symbol}&resolution=D&count=30
 */
export function getMarketCandles(symbol: string): MarketCandle[] {
  return generateMockCandles(symbol, 30)
}
