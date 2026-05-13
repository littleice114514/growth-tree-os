export type MarketSource = 'akshare' | 'finnhub'

export type MarketType =
  | 'cn-index'
  | 'cn-stock'
  | 'cn-fund'
  | 'us-stock'
  | 'us-etf'
  | 'crypto'

export type MarketQuote = {
  symbol: string
  name: string
  marketType: MarketType
  source: MarketSource
  price: number
  changePercent: number
  updatedAt: string
  isMock?: boolean
}

export type MarketCandle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type MarketWatchlistItem = MarketQuote & {
  marketLabel: string
  sourceLabel: string
}

export const marketTypeLabels: Record<MarketType, string> = {
  'cn-index': '国内指数',
  'cn-stock': 'A 股',
  'cn-fund': '基金',
  'us-stock': '美股',
  'us-etf': 'ETF',
  'crypto': '加密货币'
}

export const marketSourceLabels: Record<MarketSource, string> = {
  akshare: 'AKShare',
  finnhub: 'Finnhub'
}

export const marketGroupOrder: { key: string; label: string; types: MarketType[] }[] = [
  { key: 'cn', label: '国内', types: ['cn-index', 'cn-stock', 'cn-fund'] },
  { key: 'us', label: '海外', types: ['us-stock', 'us-etf'] },
  { key: 'crypto', label: '加密', types: ['crypto'] }
]
