import { ipcMain } from 'electron'
import type { ExtractionUpdate, ReviewCreatePayload } from '@shared/contracts'
import type { AppPaths } from './storage'
import { GrowthTreeDatabase } from './db'

export function registerIpc(db: GrowthTreeDatabase, appPaths: AppPaths) {
  ipcMain.handle('reviews:create', (_event, payload: ReviewCreatePayload) => db.createReview(payload))
  ipcMain.handle('reviews:listRecent', () => db.listRecentReviews())
  ipcMain.handle('reviews:getDetail', (_event, reviewId: string) => db.getReviewDetail(reviewId))
  ipcMain.handle('nodes:getDetail', (_event, nodeId: string) => db.getNodeDetail(nodeId))
  ipcMain.handle('nodes:search', (_event, query: string) => db.searchNodes(query))
  ipcMain.handle('nodes:markReviewed', (_event, nodeId: string) => db.markNodeReviewed(nodeId))
  ipcMain.handle('tree:getSnapshot', () => db.getTreeSnapshot())
  ipcMain.handle('extraction:apply', (_event, reviewId: string, updates: ExtractionUpdate[]) =>
    db.applyExtraction(reviewId, updates)
  )
  ipcMain.handle('reminders:listAll', () => db.listAllReminders())
  ipcMain.handle('reminders:complete', (_event, reminderId: string, action: 'complete' | 'reviewed') =>
    db.completeReminder(reminderId, action)
  )
  ipcMain.handle('insights:getWeeklyReview', () => db.getWeeklyReview())
  ipcMain.handle('appPaths:getDataRoot', () => appPaths.dataRoot)
}
