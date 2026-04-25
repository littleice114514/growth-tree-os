import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'
import { formatDateTime } from '@/services/time'

export function NodeDetailPanel() {
  const detail = useWorkspaceStore((state) => state.selectedNodeDetail)
  const markNodeReviewed = useWorkspaceStore((state) => state.markNodeReviewed)
  const completeReminder = useWorkspaceStore((state) => state.completeReminder)

  if (!detail) {
    return (
      <ShellCard className="flex h-full min-h-0 flex-col justify-center bg-[var(--panel-bg)] p-5">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">node inspector</div>
        <h2 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">节点详情</h2>
        <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
          点击成长树中的任意节点，这里会展示名称、状态、时间信息和最近证据摘录。
        </p>
      </ShellCard>
    )
  }

  return (
    <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--panel-bg)] p-5">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">node inspector</div>
      <div className="mt-2 text-xl font-semibold leading-7 text-[color:var(--text-primary)]">{detail.title}</div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-2.5 py-1 text-[color:var(--text-primary)]">
          {detail.nodeType}
        </span>
        <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-2.5 py-1 text-[color:var(--text-secondary)]">
          {detail.domain}
        </span>
        <span className="rounded-full border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-2.5 py-1 text-[color:var(--text-secondary)]">
          {detail.status}
        </span>
      </div>

      <p className="mt-5 border-l border-[color:var(--node-selected-border)] bg-[var(--inspector-section-bg)] px-4 py-3 text-sm leading-7 text-[color:var(--text-secondary)]">
        {detail.description}
      </p>

      <div className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Properties</div>
      <dl className="mt-2 grid gap-1 text-sm text-[color:var(--text-secondary)]">
        <Row label="建立时间" value={formatDateTime(detail.createdAt)} />
        <Row label="更新时间" value={formatDateTime(detail.updatedAt)} />
        <Row label="最近活跃时间" value={formatDateTime(detail.lastActiveAt)} />
        <Row label="首次出现" value={formatDateTime(detail.firstSeenAt)} />
        <Row label="上次更新距今天数" value={`${detail.daysSinceLastActive} 天`} />
        <Row label="当前状态" value={detail.status} />
        <Row label="是否待回看" value={detail.isReviewDue ? '是' : '否'} />
        <Row label="是否存在提醒" value={detail.activeReminders.length > 0 ? '是' : '否'} />
        <Row label="证据数" value={`${detail.evidenceCount}`} />
        <Row label="权重分数" value={`${detail.weightScore}`} />
      </dl>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => void markNodeReviewed(detail.id)}
          className="rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-4 py-2.5 text-sm text-[color:var(--text-primary)] transition hover:bg-[var(--button-hover)] hover:text-[color:var(--button-text)]"
        >
          这条我看过了
        </button>
        {detail.activeReminders.map((reminder) => (
          <button
            key={reminder.id}
            type="button"
            onClick={() => void completeReminder(reminder.id, reminder.reminderType === 'review_due' ? 'reviewed' : 'complete')}
            className="rounded-xl border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-4 py-2.5 text-left text-sm text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:bg-[var(--control-hover)]"
          >
            处理这条提醒 · {reminder.reminderType}
          </button>
        ))}
      </div>

      <div className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">最近证据摘录</div>
      <div className="mt-2 min-h-0 space-y-2 overflow-auto">
        {detail.recentEvidence.length > 0 ? (
          detail.recentEvidence.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-3 text-sm leading-6 text-[color:var(--text-secondary)]"
            >
              <div>{item.excerpt}</div>
              <div className="mt-2 text-xs text-[color:var(--text-muted)]">{formatDateTime(item.createdAt)}</div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[color:var(--panel-border)] px-4 py-5 text-sm text-[color:var(--text-muted)]">
            这个节点还没有证据摘录。
          </div>
        )}
      </div>
    </ShellCard>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 border-b border-[color:var(--panel-border)] px-1 py-2 last:border-b-0">
      <dt className="text-xs text-[color:var(--text-muted)]">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm text-[color:var(--text-primary)]">{value}</dd>
    </div>
  )
}
