import type {
  ExtractionUpdate,
  NodeDetail,
  ReminderRecord,
  ReviewDetail,
  ReviewRecord,
  SearchNodeResult,
  TreeSnapshot,
  WeeklyReviewSummary
} from '@shared/contracts'

export type WorkspaceView = 'tree' | 'wealth' | 'timeDebt' | 'reminders' | 'weeklyReview' | 'obsidianGraph'
export type RightPanelMode = 'node' | 'review'

export type HoverCardState = {
  nodeId: string
  title: string
  createdAt: string
  updatedAt: string
  x: number
  y: number
}

export type ExtractionDraft = ExtractionUpdate & {
  key: string
  bindQuery: string
}

export type WorkspaceState = {
  currentView: WorkspaceView
  tree: TreeSnapshot | null
  recentReviews: ReviewRecord[]
  reminders: ReminderRecord[]
  weeklyReview: WeeklyReviewSummary | null
  rightPanelMode: RightPanelMode
  selectedNodeId: string | null
  selectedNodeDetail: NodeDetail | null
  selectedReviewId: string | null
  selectedReviewDetail: ReviewDetail | null
  focusedNodeId: string | null
  hoveredNodeId: string | null
  isReviewComposerOpen: boolean
  extractionReview: ReviewRecord | null
  extractionDrafts: ExtractionDraft[]
  hoverCard: HoverCardState | null
  dataRoot: string
  searchQuery: string
  searchResults: SearchNodeResult[]
  searchLoading: boolean
  searchError: string | null
}
