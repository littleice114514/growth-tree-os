import dayjs from 'dayjs'
import { DOMAIN_OPTIONS } from '@shared/contracts'
import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'

export function ReviewSidebar() {
  const recentReviews = useWorkspaceStore((state) => state.recentReviews)
  const openReviewComposer = useWorkspaceStore((state) => state.openReviewComposer)
  const openReview = useWorkspaceStore((state) => state.openReview)
  const selectedReviewId = useWorkspaceStore((state) => state.selectedReviewId)
  const rightPanelMode = useWorkspaceStore((state) => state.rightPanelMode)
  const dataRoot = useWorkspaceStore((state) => state.dataRoot)

  return (
    <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--panel-bg)] p-4">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--text-muted)]">workspace</div>
          <h2 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">主线与复盘</h2>
        </div>
        <button
          type="button"
          onClick={openReviewComposer}
          className="rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1.5 text-sm text-[color:var(--text-primary)] transition hover:border-[color:var(--node-selected-border)] hover:bg-[var(--control-hover)]"
        >
          新建
        </button>
      </div>

      <div className="mt-5 min-h-0 shrink-0">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">一级主线</div>
        <div className="max-h-48 space-y-1 overflow-auto pr-1">
          {DOMAIN_OPTIONS.map((domain, index) => (
            <div
              key={domain}
              className="group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-sm text-[color:var(--text-secondary)] transition hover:border-[color:var(--panel-border)] hover:bg-[var(--control-bg)] hover:text-[color:var(--text-primary)]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--edge-emphasis)] opacity-75" />
              <span className="w-7 shrink-0 text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-muted)]">M0{index + 1}</span>
              <span className="min-w-0 truncate leading-6">{domain}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">最近复盘</div>
          <div className="text-xs text-[color:var(--text-muted)]">{recentReviews.length} 条</div>
        </div>
        <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-auto pr-1">
          {recentReviews.map((review) => (
            <button
              key={review.id}
              type="button"
              onClick={() => void openReview(review.id)}
              className={
                review.id === selectedReviewId && rightPanelMode === 'review'
                  ? 'block w-full rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-3 text-left shadow-[var(--shadow-node-neighbor)]'
                  : 'block w-full rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-[color:var(--panel-border)] hover:bg-[var(--control-bg)]'
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="truncate text-sm font-medium text-[color:var(--text-primary)]">{review.title}</div>
                <div className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  {dayjs(review.reviewDate).format('MM-DD')}
                </div>
              </div>
              <div className="mt-1.5 max-h-12 overflow-hidden text-xs leading-5 text-[color:var(--text-secondary)]">
                {review.contentMarkdown}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 shrink-0 rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 text-xs leading-5 text-[color:var(--text-secondary)]">
        <div className="uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Data Root</div>
        <div className="mt-2 break-all">{dataRoot || '初始化中...'}</div>
      </div>
    </ShellCard>
  )
}
