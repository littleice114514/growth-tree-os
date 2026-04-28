import { useEffect } from 'react'
import { Toolbar } from '@/components/Toolbar'
import { useWorkspaceStore } from '@/app/store'
import { ReviewComposer } from '@/features/reviews/ReviewComposer'
import { ReviewDetailPanel } from '@/features/reviews/ReviewDetailPanel'
import { ReviewSidebar } from '@/features/reviews/ReviewSidebar'
import { TreeCanvas } from '@/features/tree/TreeCanvas'
import { NodeDetailPanel } from '@/features/nodes/NodeDetailPanel'
import { ExtractionDrawer } from '@/features/extraction/ExtractionDrawer'
import { ReminderPanel } from '@/features/reminders/ReminderPanel'
import { WeeklyReviewPanel } from '@/features/review/WeeklyReviewPanel'
import { LifeVitalityTreeCanvas } from '@/features/life-vitality-tree/LifeVitalityTreeCanvas'
import { LifeCurveDashboard } from '@/features/life-curve/LifeCurveDashboard'
import { WealthDashboard } from '@/features/wealth/WealthDashboard'
import { TimeDebtDashboard } from '@/features/time-debt/TimeDebtDashboard'
import { LifeDashboardPreview } from '@/features/dashboard-preview'

export function MainWorkspacePage() {
  const isReviewComposerOpen = useWorkspaceStore((state) => state.isReviewComposerOpen)
  const extractionReview = useWorkspaceStore((state) => state.extractionReview)
  const currentView = useWorkspaceStore((state) => state.currentView)
  const rightPanelMode = useWorkspaceStore((state) => state.rightPanelMode)
  const selectedNodeId = useWorkspaceStore((state) => state.selectedNodeId)
  const selectedReviewId = useWorkspaceStore((state) => state.selectedReviewId)
  const focusedNodeId = useWorkspaceStore((state) => state.focusedNodeId)
  const searchQuery = useWorkspaceStore((state) => state.searchQuery)
  const setSearchQuery = useWorkspaceStore((state) => state.setSearchQuery)
  const exitInspectMode = useWorkspaceStore((state) => state.exitInspectMode)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (isReviewComposerOpen || extractionReview) {
        return
      }

      if (searchQuery.trim()) {
        event.preventDefault()
        setSearchQuery('')
        return
      }

      if (selectedNodeId || selectedReviewId || focusedNodeId || rightPanelMode === 'review') {
        event.preventDefault()
        exitInspectMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    exitInspectMode,
    extractionReview,
    focusedNodeId,
    isReviewComposerOpen,
    rightPanelMode,
    searchQuery,
    selectedNodeId,
    selectedReviewId,
    setSearchQuery
  ])

  return (
    <div className="h-full bg-transparent px-5 py-4 text-base-100">
      <div className="flex h-full flex-col gap-4">
        <Toolbar />
        {currentView === 'tree' ? (
          <main className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_340px] gap-4">
            <div className="min-h-0">
              <ReviewSidebar />
            </div>
            <div className="relative min-h-0">
              <TreeCanvas />
              <ExtractionDrawer />
            </div>
            <div className="min-h-0">
              {rightPanelMode === 'review' ? <ReviewDetailPanel /> : <NodeDetailPanel />}
            </div>
          </main>
        ) : null}
        {currentView === 'reminders' ? (
          <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4">
            <div className="min-h-0">
              <ReminderPanel />
            </div>
            <div className="min-h-0">
              {rightPanelMode === 'review' ? <ReviewDetailPanel /> : <NodeDetailPanel />}
            </div>
          </main>
        ) : null}
        {currentView === 'lifeDashboard' ? <LifeDashboardPreview /> : null}
        {currentView === 'lifeVitalityTree' ? <LifeVitalityTreeCanvas /> : null}
        {currentView === 'lifeCurve' ? <LifeCurveDashboard /> : null}
        {currentView === 'wealth' ? <WealthDashboard /> : null}
        {currentView === 'timeDebt' ? <TimeDebtDashboard /> : null}
        {currentView === 'weeklyReview' ? (
          <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4">
            <div className="min-h-0">
              <WeeklyReviewPanel />
            </div>
            <div className="min-h-0">
              {rightPanelMode === 'review' ? <ReviewDetailPanel /> : <NodeDetailPanel />}
            </div>
          </main>
        ) : null}
      </div>

      {isReviewComposerOpen ? <ReviewComposer /> : null}
    </div>
  )
}
