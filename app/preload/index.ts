import { contextBridge, ipcRenderer } from 'electron'
import type { GrowthTreeApi } from '@shared/contracts'

const timeDebtOpenQuickFloatChannel = 'time-debt:open-quick-float'
const wealthOpenQuickFloatChannel = 'wealth:open-quick-float'

const api: GrowthTreeApi = {
  reviews: {
    create: (payload) => ipcRenderer.invoke('reviews:create', payload),
    listRecent: () => ipcRenderer.invoke('reviews:listRecent'),
    getDetail: (reviewId) => ipcRenderer.invoke('reviews:getDetail', reviewId)
  },
  nodes: {
    getDetail: (nodeId) => ipcRenderer.invoke('nodes:getDetail', nodeId),
    search: (query) => ipcRenderer.invoke('nodes:search', query),
    markReviewed: (nodeId) => ipcRenderer.invoke('nodes:markReviewed', nodeId)
  },
  tree: {
    getSnapshot: () => ipcRenderer.invoke('tree:getSnapshot')
  },
  extraction: {
    apply: (reviewId, updates) => ipcRenderer.invoke('extraction:apply', reviewId, updates)
  },
  reminders: {
    listAll: () => ipcRenderer.invoke('reminders:listAll'),
    complete: (reminderId, action) => ipcRenderer.invoke('reminders:complete', reminderId, action)
  },
  insights: {
    getWeeklyReview: () => ipcRenderer.invoke('insights:getWeeklyReview')
  },
  appPaths: {
    getDataRoot: () => ipcRenderer.invoke('appPaths:getDataRoot')
  },
  accounts: {
    getCurrentUser: () => ipcRenderer.invoke('accounts:getCurrentUser')
  },
  timeDebt: {
    onOpenQuickFloat: (callback) => {
      const handler = () => callback()
      ipcRenderer.on(timeDebtOpenQuickFloatChannel, handler)
      return () => ipcRenderer.removeListener(timeDebtOpenQuickFloatChannel, handler)
    }
  },
  wealth: {
    onOpenQuickFloat: (callback) => {
      const handler = () => callback()
      ipcRenderer.on(wealthOpenQuickFloatChannel, handler)
      return () => ipcRenderer.removeListener(wealthOpenQuickFloatChannel, handler)
    }
  },
  market: {
    hasApiKey: () => ipcRenderer.invoke('market:hasApiKey'),
    fetchQuote: (symbol) => ipcRenderer.invoke('market:fetchQuote', symbol),
    fetchQuotes: (symbols) => ipcRenderer.invoke('market:fetchQuotes', symbols),
    fetchCandles: (symbol) => ipcRenderer.invoke('market:fetchCandles', symbol),
    fetchYahooCandles: (symbol) => ipcRenderer.invoke('market:fetchYahooCandles', symbol)
  }
}

contextBridge.exposeInMainWorld('growthTree', api)
