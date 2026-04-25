import type { ExtractionUpdate, ReviewCreatePayload } from '@shared/contracts'

export const api = {
  listRecentReviews: () => window.growthTree.reviews.listRecent(),
  createReview: (payload: ReviewCreatePayload) => window.growthTree.reviews.create(payload),
  getReviewDetail: (reviewId: string) => window.growthTree.reviews.getDetail(reviewId),
  getTreeSnapshot: () => window.growthTree.tree.getSnapshot(),
  getNodeDetail: (nodeId: string) => window.growthTree.nodes.getDetail(nodeId),
  searchNodes: (query: string) => window.growthTree.nodes.search(query),
  markNodeReviewed: (nodeId: string) => window.growthTree.nodes.markReviewed(nodeId),
  applyExtraction: (reviewId: string, updates: ExtractionUpdate[]) => window.growthTree.extraction.apply(reviewId, updates),
  listAllReminders: () => window.growthTree.reminders.listAll(),
  completeReminder: (reminderId: string, action: 'complete' | 'reviewed') =>
    window.growthTree.reminders.complete(reminderId, action),
  getWeeklyReview: () => window.growthTree.insights.getWeeklyReview(),
  getDataRoot: () => window.growthTree.appPaths.getDataRoot()
}
