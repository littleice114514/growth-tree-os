export const DOMAIN_OPTIONS = [
  '学业 / 认知成长',
  '身体 / 能量管理',
  '表达 / 输出能力',
  '关系 / 社会互动',
  '金钱 / 生存系统',
  '内在秩序 / 情绪与自我管理'
] as const

export const NODE_TYPE_OPTIONS = [
  'mainline',
  'ability',
  'habit',
  'method',
  'issue',
  'cognition',
  'achievement'
] as const

export const NODE_STATUS_OPTIONS = [
  'new',
  'growing',
  'stable',
  'dormant',
  'review',
  'restarted'
] as const

export type Domain = (typeof DOMAIN_OPTIONS)[number]
export type NodeType = (typeof NODE_TYPE_OPTIONS)[number]
export type NodeStatus = (typeof NODE_STATUS_OPTIONS)[number]
export type ReminderType = 'dormant' | 'repeat_problem' | 'review_due'
export type ReminderStatus = 'open' | 'done'

export type UserRecord = {
  id: string
  displayName: string
  mode: 'local'
  createdAt: string
  updatedAt: string
}

export type ReviewRecord = {
  id: string
  reviewDate: string
  title: string
  contentMarkdown: string
  markdownPath: string
  createdAt: string
  updatedAt: string
}

export type ReviewLinkedNode = {
  nodeId: string
  title: string
  nodeType: NodeType
  domain: Domain
  status: NodeStatus
  evidenceCount: number
  excerpt: string
}

export type ReviewDetail = ReviewRecord & {
  relatedNodes: ReviewLinkedNode[]
}

export type NodeRecord = {
  id: string
  title: string
  nodeType: NodeType
  domain: Domain
  status: NodeStatus
  description: string
  createdAt: string
  updatedAt: string
  firstSeenAt: string
  lastActiveAt: string
  evidenceCount: number
  weightScore: number
  isAchievement: boolean
  needsReview: boolean
}

export type EdgeRecord = {
  id: string
  sourceNodeId: string
  targetNodeId: string
  relationType: 'supports' | 'reveals' | 'stabilizes'
  createdAt: string
  updatedAt: string
}

export type NodeEvidenceRecord = {
  id: string
  nodeId: string
  reviewId: string
  excerpt: string
  createdAt: string
}

export type ReminderRecord = {
  id: string
  nodeId: string
  reminderType: ReminderType
  status: ReminderStatus
  dueAt: string
  createdAt: string
  updatedAt: string
  lastTriggeredAt: string | null
  nodeTitle: string
  domain: Domain
  nodeStatus: NodeStatus
  lastActiveAt: string
  processedAt: string | null
  reason: string
}

export type NodeReminderSummary = {
  id: string
  reminderType: ReminderType
  status: ReminderStatus
  dueAt: string
  reason: string
}

export type TreeNodeView = NodeRecord & {
  position: { x: number; y: number }
}

export type TreeSnapshot = {
  nodes: TreeNodeView[]
  edges: EdgeRecord[]
  mainlines: Array<{ domain: Domain; nodeId: string }>
}

export type NodeDetail = NodeRecord & {
  recentEvidence: NodeEvidenceRecord[]
  daysSinceLastActive: number
  isReviewDue: boolean
  activeReminders: NodeReminderSummary[]
}

export type ReviewCreatePayload = {
  reviewDate: string
  title: string
  contentMarkdown: string
}

export type ExtractionUpdate = {
  mode: 'create' | 'bind'
  title: string
  nodeType: Exclude<NodeType, 'mainline'>
  domain: Domain
  description: string
  bindNodeId?: string
  addEvidence: boolean
}

export type SearchNodeResult = Pick<
  NodeRecord,
  'id' | 'title' | 'nodeType' | 'domain' | 'status'
>

export type ReviewCreateResult = {
  review: ReviewRecord
}

export type WeeklyReviewItem = {
  nodeId: string
  title: string
  domain: Domain
  status: NodeStatus
  reason: string
}

export type WeeklyReviewSummary = {
  windowStart: string
  windowEnd: string
  newNodesCount: number
  updatedNodesCount: number
  stableNodesCount: number
  dormantNodesCount: number
  restartedNodesCount: number
  newReviewsCount: number
  newNodes: WeeklyReviewItem[]
  repeatProblems: WeeklyReviewItem[]
  dormantNodes: WeeklyReviewItem[]
  restartedNodes: WeeklyReviewItem[]
}

export type FinnhubQuoteResult = {
  symbol: string
  price: number
  changePercent: number
  updatedAt: string
  error?: string
}

export type FinnhubCandle = {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type FinnhubCandlesResult = {
  symbol: string
  candles: FinnhubCandle[]
  error?: string
}

export interface GrowthTreeApi {
  reviews: {
    create(payload: ReviewCreatePayload): Promise<ReviewCreateResult>
    listRecent(): Promise<ReviewRecord[]>
    getDetail(reviewId: string): Promise<ReviewDetail | null>
  }
  nodes: {
    getDetail(nodeId: string): Promise<NodeDetail | null>
    search(query: string): Promise<SearchNodeResult[]>
    markReviewed(nodeId: string): Promise<NodeDetail | null>
  }
  tree: {
    getSnapshot(): Promise<TreeSnapshot>
  }
  extraction: {
    apply(reviewId: string, updates: ExtractionUpdate[]): Promise<TreeSnapshot>
  }
  reminders: {
    listAll(): Promise<ReminderRecord[]>
    complete(reminderId: string, action: 'complete' | 'reviewed'): Promise<{ ok: true }>
  }
  insights: {
    getWeeklyReview(): Promise<WeeklyReviewSummary>
  }
  appPaths: {
    getDataRoot(): Promise<string>
  }
  accounts: {
    getCurrentUser(): Promise<UserRecord>
  }
  timeDebt: {
    onOpenQuickFloat(callback: () => void): () => void
  }
  wealth: {
    onOpenQuickFloat(callback: () => void): () => void
  }
  quickRecord: {
    onOpenQuickRecord(callback: (mode: 'choose' | 'time' | 'wealth' | 'toggle') => void): () => void
  }
  market: {
    hasApiKey(): Promise<boolean>
    fetchQuote(symbol: string): Promise<FinnhubQuoteResult>
    fetchQuotes(symbols: string[]): Promise<FinnhubQuoteResult[]>
    fetchCandles(symbol: string): Promise<FinnhubCandlesResult>
    fetchYahooCandles(symbol: string): Promise<FinnhubCandlesResult>
  }
}
