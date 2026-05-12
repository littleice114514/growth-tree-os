import { contextBridge, ipcRenderer } from 'electron'
import type { GrowthTreeApi } from '@shared/contracts'

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
  }
}

contextBridge.exposeInMainWorld('growthTree', api)
