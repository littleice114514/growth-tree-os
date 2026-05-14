/**
 * Finnhub API service — runs in Electron main process.
 * API key is read via getEnvValue (process.env -> root .env fallback), never exposed to renderer.
 *
 * Endpoints used:
 *   Quote:    GET https://finnhub.io/api/v1/quote?symbol={symbol}&token={key}
 *   Candles:  GET https://finnhub.io/api/v1/stock/candle?symbol={symbol}&resolution=D&from={unix}&to={unix}&token={key}
 *
 * Crypto symbols (BTC-USD, ETH-USD) are mapped to Finnhub format:
 *   BTC-USD -> BINANCE:BTCUSDT
 *   ETH-USD -> BINANCE:ETHUSDT
 */

import { getEnvValue } from './env'

const BASE_URL = 'https://finnhub.io/api/v1'

// Map our internal crypto symbols to Finnhub symbols
function toFinnhubSymbol(symbol: string): string {
  if (symbol === 'BTC-USD') return 'BINANCE:BTCUSDT'
  if (symbol === 'ETH-USD') return 'BINANCE:ETHUSDT'
  return symbol
}

let _keyCache: { value: string | null } | null = null

function getApiKey(): string | null {
  if (!_keyCache) {
    const raw = getEnvValue('FINNHUB_API_KEY')
    const value = raw || null
    _keyCache = { value }
    console.info('[finnhub] api key configured:', Boolean(value), 'length:', value?.length ?? 0)
  }
  return _keyCache.value
}

export interface FinnhubQuoteResult {
  symbol: string
  price: number
  changePercent: number
  updatedAt: string
  error?: string
}

export interface FinnhubCandle {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface FinnhubCandlesResult {
  symbol: string
  candles: FinnhubCandle[]
  error?: string
}

export function hasApiKey(): boolean {
  return getApiKey() !== null
}

/**
 * Fetch real-time quote for a single symbol.
 */
export async function fetchQuote(symbol: string): Promise<FinnhubQuoteResult> {
  const key = getApiKey()
  if (!key) {
    return { symbol, price: 0, changePercent: 0, updatedAt: '', error: 'NO_API_KEY' }
  }

  const fhSymbol = toFinnhubSymbol(symbol)
  const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(fhSymbol)}&token=${key}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      return { symbol, price: 0, changePercent: 0, updatedAt: '', error: `HTTP_${res.status}` }
    }
    const data = await res.json()

    // Finnhub returns { c: current, d: change, dp: percent, h: high, l: low, o: open, pc: prevClose, t: timestamp }
    if (data.c === undefined || data.c === 0) {
      return { symbol, price: 0, changePercent: 0, updatedAt: '', error: 'NO_DATA' }
    }

    return {
      symbol,
      price: data.c,
      changePercent: data.dp ?? 0,
      updatedAt: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString()
    }
  } catch (e) {
    return { symbol, price: 0, changePercent: 0, updatedAt: '', error: 'FETCH_FAILED' }
  }
}

/**
 * Fetch quotes for multiple symbols (sequential to respect rate limits).
 */
export async function fetchQuotes(symbols: string[]): Promise<FinnhubQuoteResult[]> {
  const results: FinnhubQuoteResult[] = []
  for (const sym of symbols) {
    results.push(await fetchQuote(sym))
  }
  return results
}

/**
 * Fetch 30-day daily candles for a symbol.
 */
export async function fetchCandles(symbol: string): Promise<FinnhubCandlesResult> {
  const key = getApiKey()
  if (!key) {
    return { symbol, candles: [], error: 'NO_API_KEY' }
  }

  const fhSymbol = toFinnhubSymbol(symbol)
  const now = Math.floor(Date.now() / 1000)
  const from = now - 45 * 86400 // 45 days back to ensure we get ~30 trading days
  const url = `${BASE_URL}/stock/candle?symbol=${encodeURIComponent(fhSymbol)}&resolution=D&from=${from}&to=${now}&token=${key}`

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[finnhub] candle ${symbol} (${fhSymbol}) → HTTP ${res.status}`)
      return { symbol, candles: [], error: `HTTP_${res.status}` }
    }
    const data = await res.json()

    // Finnhub returns { c: [...], h: [...], l: [...], o: [...], t: [...], v: [...], s: "ok" | "no_data" }
    if (data.s !== 'ok' || !Array.isArray(data.t) || data.t.length === 0) {
      console.warn(`[finnhub] candle ${symbol} (${fhSymbol}) → s=${data.s}`)
      return { symbol, candles: [], error: 'NO_DATA' }
    }

    const candles: FinnhubCandle[] = data.t.map((ts: number, i: number) => ({
      time: new Date(ts * 1000).toISOString().slice(0, 10),
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i]
    }))

    // Take last 30 candles
    const last30 = candles.slice(-30)

    return { symbol, candles: last30 }
  } catch (e) {
    return { symbol, candles: [], error: 'FETCH_FAILED' }
  }
}

/**
 * Fetch 1-month daily candles from Yahoo Finance (free, no key needed).
 * Called from main process to avoid CORS issues in renderer.
 */
export async function fetchYahooCandles(symbol: string): Promise<FinnhubCandlesResult> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) {
      console.warn(`[yahoo] candle ${symbol} → HTTP ${res.status}`)
      return { symbol, candles: [], error: `HTTP_${res.status}` }
    }
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return { symbol, candles: [], error: 'NO_DATA' }

    const timestamps: number[] = result.timestamp ?? []
    const quote = result.indicators?.quote?.[0]
    if (!quote || timestamps.length === 0) return { symbol, candles: [], error: 'NO_DATA' }

    const opens: number[] = quote.open ?? []
    const highs: number[] = quote.high ?? []
    const lows: number[] = quote.low ?? []
    const closes: number[] = quote.close ?? []
    const volumes: number[] = quote.volume ?? []

    const candles: FinnhubCandle[] = timestamps
      .map((ts, i) => ({
        time: new Date(ts * 1000).toISOString().slice(0, 10),
        open: +(opens[i] ?? 0).toFixed(2),
        high: +(highs[i] ?? 0).toFixed(2),
        low: +(lows[i] ?? 0).toFixed(2),
        close: +(closes[i] ?? 0).toFixed(2),
        volume: volumes[i] ?? 0
      }))
      .filter(c => !isNaN(c.close) && c.close > 0)

    console.info(`[yahoo] candle ${symbol} → ${candles.length} bars`)
    return { symbol, candles: candles.slice(-30) }
  } catch (e) {
    console.warn(`[yahoo] candle ${symbol} → FETCH_FAILED`)
    return { symbol, candles: [], error: 'FETCH_FAILED' }
  }
}
