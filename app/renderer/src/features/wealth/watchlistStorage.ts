import type { MarketType, MarketSource } from './marketDataTypes'

export type WatchlistItem = {
  symbol: string
  name: string
  marketType: MarketType
  source: MarketSource
}

const STORAGE_KEY = 'growth-tree-os:wealth-market-watchlist:v1'

export function loadCustomWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isWatchlistItem)
  } catch {
    return []
  }
}

export function saveCustomWatchlist(items: WatchlistItem[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addToWatchlist(item: WatchlistItem): WatchlistItem[] {
  const items = loadCustomWatchlist()
  // Don't add duplicates
  if (items.some((i) => i.symbol.toUpperCase() === item.symbol.toUpperCase())) {
    return items
  }
  const updated = [...items, item]
  saveCustomWatchlist(updated)
  return updated
}

export function removeFromWatchlist(symbol: string): WatchlistItem[] {
  const items = loadCustomWatchlist().filter(
    (i) => i.symbol.toUpperCase() !== symbol.toUpperCase()
  )
  saveCustomWatchlist(items)
  return items
}

function isWatchlistItem(value: unknown): value is WatchlistItem {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<WatchlistItem>
  return (
    typeof candidate.symbol === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.marketType === 'string' &&
    typeof candidate.source === 'string'
  )
}
