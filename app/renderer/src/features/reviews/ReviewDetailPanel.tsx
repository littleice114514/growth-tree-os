import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'
import { formatDateTime } from '@/services/time'

export function ReviewDetailPanel() {
  const detail = useWorkspaceStore((state) => state.selectedReviewDetail)
  const jumpToNode = useWorkspaceStore((state) => state.jumpToNode)

  if (!detail) {
    return (
      <ShellCard className="flex h-full min-h-0 flex-col justify-center bg-[var(--panel-bg)] p-6">
        <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">review detail</div>
        <h2 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">复盘详情</h2>
        <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
          点击左侧最近复盘，这里会展示复盘正文与本次复盘关联到的成长节点。
        </p>
      </ShellCard>
    )
  }

  return (
    <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--panel-bg)] p-6">
      <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">review detail</div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{detail.title}</div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1 text-[color:var(--text-secondary)]">{detail.reviewDate}</span>
        <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1 text-[color:var(--text-secondary)]">
          创建于 {formatDateTime(detail.createdAt)}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-4 py-4 text-sm leading-7 text-[color:var(--text-secondary)]">
        <pre className="whitespace-pre-wrap">{detail.contentMarkdown}</pre>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm font-medium text-[color:var(--text-primary)]">本次复盘关联节点</div>
        <div className="text-xs text-[color:var(--text-muted)]">{detail.relatedNodes.length} 条</div>
      </div>
      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {detail.relatedNodes.length > 0 ? (
          detail.relatedNodes.map((item) => (
            <button
              key={item.nodeId}
              type="button"
              onClick={() => void jumpToNode(item.nodeId)}
              className="block w-full rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-4 py-4 text-left transition hover:border-[color:var(--node-selected-border)] hover:bg-[var(--control-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-[color:var(--text-primary)]">{item.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1 text-[color:var(--text-secondary)]">{item.domain}</span>
                    <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1 text-[color:var(--text-secondary)]">{item.nodeType}</span>
                    <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1 text-[color:var(--text-secondary)]">{item.status}</span>
                  </div>
                </div>
                <div className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-1 text-xs text-[color:var(--text-secondary)]">
                  证据 {item.evidenceCount}
                </div>
              </div>
              <div className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{item.excerpt}</div>
              <div className="mt-3 text-xs text-[color:var(--text-muted)]">查看这个节点</div>
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] px-4 py-5 text-sm text-[color:var(--text-muted)]">
            这篇复盘暂时还没有关联到成长节点。
          </div>
        )}
      </div>
    </ShellCard>
  )
}
