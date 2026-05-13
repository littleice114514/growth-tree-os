import type {
  ExtractionUpdate,
  ReminderRecord,
  ReviewRecord,
  TreeSnapshot,
  WeeklyReviewSummary
} from '@shared/contracts'
import { DOMAIN_OPTIONS } from '@shared/contracts'
import { create } from 'zustand'
import { api } from '@/services/api'
import type { ExtractionDraft, HoverCardState, WorkspaceState, WorkspaceView } from '@/types/ui'

type WorkspaceActions = {
  boot: () => Promise<void>
  refreshTree: () => Promise<void>
  loadRecentReviews: () => Promise<void>
  loadReminders: () => Promise<void>
  loadWeeklyReview: () => Promise<void>
  openReview: (reviewId: string | null) => Promise<void>
  selectNode: (nodeId: string | null) => Promise<void>
  jumpToNode: (nodeId: string) => Promise<void>
  setHoverCard: (hoverCard: HoverCardState | null) => void
  setHoveredNodeId: (nodeId: string | null) => void
  setCurrentView: (view: WorkspaceView) => Promise<void>
  exitInspectMode: () => void
  openReviewComposer: () => void
  closeReviewComposer: () => void
  setSearchQuery: (searchQuery: string) => void
  createReview: (payload: { reviewDate: string; title: string; contentMarkdown: string }) => Promise<void>
  closeExtraction: () => void
  addExtractionDraft: () => void
  removeExtractionDraft: (key: string) => void
  updateExtractionDraft: (key: string, patch: Partial<ExtractionDraft>) => void
  submitExtraction: () => Promise<void>
  completeReminder: (reminderId: string, action: 'complete' | 'reviewed') => Promise<void>
  markNodeReviewed: (nodeId: string) => Promise<void>
}

const defaultWorkspaceView: WorkspaceView = 'timeDebt'
const mvpWorkspaceViews = new Set<WorkspaceView>(['timeDebt', 'wealth'])

function resolveMvpWorkspaceView(view: WorkspaceView): WorkspaceView {
  return mvpWorkspaceViews.has(view) ? view : defaultWorkspaceView
}

const makeDraft = (): ExtractionDraft => ({
  key: Math.random().toString(36).slice(2, 9),
  mode: 'create',
  title: '',
  nodeType: 'ability',
  domain: DOMAIN_OPTIONS[0],
  description: '',
  addEvidence: true,
  bindQuery: ''
})

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set, get) => ({
  currentView: defaultWorkspaceView,
  tree: null,
  recentReviews: [],
  reminders: [],
  weeklyReview: null,
  rightPanelMode: 'node',
  selectedNodeId: null,
  selectedNodeDetail: null,
  selectedReviewId: null,
  selectedReviewDetail: null,
  focusedNodeId: null,
  hoveredNodeId: null,
  isReviewComposerOpen: false,
  extractionReview: null,
  extractionDrafts: [makeDraft()],
  hoverCard: null,
  dataRoot: '',
  currentUser: null,
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,

  boot: async () => {
    const [tree, recentReviews, reminders, weeklyReview, dataRoot, currentUser] = await Promise.all([
      api.getTreeSnapshot(),
      api.listRecentReviews(),
      api.listAllReminders(),
      api.getWeeklyReview(),
      api.getDataRoot(),
      api.getCurrentUser()
    ])
    set({
      tree,
      recentReviews,
      reminders,
      weeklyReview,
      dataRoot,
      currentUser
    })
  },

  refreshTree: async () => {
    const tree = await api.getTreeSnapshot()
    set({ tree })
  },

  loadRecentReviews: async () => {
    const recentReviews = await api.listRecentReviews()
    set({ recentReviews })
  },

  loadReminders: async () => {
    const reminders = await api.listAllReminders()
    set({ reminders })
  },

  loadWeeklyReview: async () => {
    const weeklyReview = await api.getWeeklyReview()
    set({ weeklyReview })
  },

  openReview: async (reviewId) => {
    if (!reviewId) {
      set({ rightPanelMode: 'node', selectedReviewId: null, selectedReviewDetail: null })
      return
    }

    const detail = await api.getReviewDetail(reviewId)
    set({
      rightPanelMode: 'review',
      selectedReviewId: reviewId,
      selectedReviewDetail: detail
    })
  },

  selectNode: async (nodeId) => {
    if (!nodeId) {
      set({
        rightPanelMode: 'node',
        selectedNodeId: null,
        selectedNodeDetail: null,
        focusedNodeId: null,
        searchResults: [],
        searchLoading: false,
        searchError: null
      })
      return
    }

    const detail = await api.getNodeDetail(nodeId)
    set({
      currentView: defaultWorkspaceView,
      rightPanelMode: 'node',
      selectedNodeId: nodeId,
      selectedNodeDetail: detail,
      focusedNodeId: nodeId,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchError: null
    })
  },

  jumpToNode: async (nodeId) => {
    await get().selectNode(nodeId)
  },

  setHoverCard: (hoverCard) => set({ hoverCard }),
  setHoveredNodeId: (hoveredNodeId) => set({ hoveredNodeId }),
  setCurrentView: async (currentView) => {
    set({ currentView: resolveMvpWorkspaceView(currentView) })
  },
  exitInspectMode: () => {
    set({
      currentView: defaultWorkspaceView,
      rightPanelMode: 'node',
      selectedNodeId: null,
      selectedNodeDetail: null,
      selectedReviewId: null,
      selectedReviewDetail: null,
      focusedNodeId: null,
      hoveredNodeId: null,
      hoverCard: null,
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      searchError: null
    })
  },
  openReviewComposer: () => set({ isReviewComposerOpen: true }),
  closeReviewComposer: () => set({ isReviewComposerOpen: false }),
  setSearchQuery: async (searchQuery) => {
    const query = searchQuery.trim()
    if (!query) {
      set({
        searchQuery,
        searchResults: [],
        searchLoading: false,
        searchError: null
      })
      return
    }

    set({
      searchQuery,
      searchLoading: true,
      searchError: null
    })

    try {
      const searchResults = await api.searchNodes(query)
      if (get().searchQuery !== searchQuery) {
        return
      }
      set({
        searchResults,
        searchLoading: false,
        searchError: null
      })
    } catch {
      if (get().searchQuery !== searchQuery) {
        return
      }
      set({
        searchResults: [],
        searchLoading: false,
        searchError: '搜索暂时不可用'
      })
    }
  },

  createReview: async (payload) => {
    const result = await api.createReview(payload)
    await get().loadRecentReviews()
    set({
      isReviewComposerOpen: false,
      extractionReview: result.review,
      extractionDrafts: [makeDraft()]
    })
  },

  closeExtraction: () => {
    set({
      extractionReview: null,
      extractionDrafts: [makeDraft()]
    })
  },

  addExtractionDraft: () => {
    const drafts = get().extractionDrafts
    if (drafts.length >= 3) {
      return
    }
    set({ extractionDrafts: [...drafts, makeDraft()] })
  },

  removeExtractionDraft: (key) => {
    const drafts = get().extractionDrafts.filter((item) => item.key !== key)
    set({ extractionDrafts: drafts.length > 0 ? drafts : [makeDraft()] })
  },

  updateExtractionDraft: (key, patch) => {
    set({
      extractionDrafts: get().extractionDrafts.map((item) => (item.key === key ? { ...item, ...patch } : item))
    })
  },

  submitExtraction: async () => {
    const review = get().extractionReview
    if (!review) {
      return
    }

    const updates: ExtractionUpdate[] = get()
      .extractionDrafts.map((draft) => ({
        mode: draft.mode,
        title: draft.title.trim(),
        nodeType: draft.nodeType,
        domain: draft.domain,
        description: draft.description.trim(),
        bindNodeId: draft.bindNodeId,
        addEvidence: draft.addEvidence
      }))
      .filter((item) => item.title || item.bindNodeId)

    if (updates.length === 0) {
      return
    }

    const tree = await api.applyExtraction(review.id, updates)
    const [recentReviews, reminders, weeklyReview] = await Promise.all([
      api.listRecentReviews(),
      api.listAllReminders(),
      api.getWeeklyReview()
    ])
    set({
      tree,
      recentReviews,
      reminders,
      weeklyReview,
      extractionReview: null,
      extractionDrafts: [makeDraft()]
    })
    if (get().selectedNodeId) {
      await get().selectNode(get().selectedNodeId)
    }
  },

  completeReminder: async (reminderId, action) => {
    await api.completeReminder(reminderId, action)
    const [tree, reminders, weeklyReview] = await Promise.all([
      api.getTreeSnapshot(),
      api.listAllReminders(),
      api.getWeeklyReview()
    ])
    set({ tree, reminders, weeklyReview })
    if (get().selectedNodeId) {
      await get().selectNode(get().selectedNodeId)
    }
  },

  markNodeReviewed: async (nodeId) => {
    const [detail, tree, reminders, weeklyReview] = await Promise.all([
      api.markNodeReviewed(nodeId),
      api.getTreeSnapshot(),
      api.listAllReminders(),
      api.getWeeklyReview()
    ])
    set({
      rightPanelMode: 'node',
      selectedNodeId: nodeId,
      selectedNodeDetail: detail,
      tree,
      reminders,
      weeklyReview
    })
  }
}))
