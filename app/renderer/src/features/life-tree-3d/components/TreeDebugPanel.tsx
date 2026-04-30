import type { QualityProfile, QualityProfileName } from '../contracts'
import type { ProceduralTreeLayoutNode } from '../layout'

export function TreeDebugPanel({
  selectedNode,
  selectedAt,
  qualityProfile,
  onClear
}: {
  selectedNode: ProceduralTreeLayoutNode | null
  selectedAt: string | null
  qualityProfile: QualityProfile | QualityProfileName
  onClear: () => void
}) {
  const qualityName = typeof qualityProfile === 'string' ? qualityProfile : qualityProfile.name

  if (!selectedNode) {
    return (
      <aside className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-4 text-sm text-[color:var(--text-secondary)] shadow-panel">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">debug selection</div>
        <p className="mt-3">Click trunk, branch, leaf, or fruit to inspect mock node details.</p>
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">ESC clears the current selection.</p>
      </aside>
    )
  }

  return (
    <aside className="rounded-[18px] border border-[color:var(--node-selected-border)] bg-[var(--panel-bg-strong)] p-4 text-sm text-[color:var(--text-secondary)] shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-accent-cyan">debug selection</div>
          <h2 className="mt-2 break-all text-base font-semibold text-[color:var(--text-primary)]">{selectedNode.nodeId}</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-[color:var(--input-border)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
        >
          Clear
        </button>
      </div>
      <dl className="mt-4 grid gap-2 text-xs">
        <DebugRow label="type" value={selectedNode.type} />
        <DebugRow label="branchId" value={selectedNode.branchId} />
        <DebugRow label="status" value={selectedNode.status} />
        <DebugRow label="sourceModule" value={selectedNode.sourceModule ?? 'mock metadata'} />
        <DebugRow label="intensity" value={selectedNode.intensity.toFixed(2)} />
        <DebugRow label="qualityProfile" value={qualityName} />
        <DebugRow label="selectedAt" value={selectedAt ?? '-'} />
      </dl>
    </aside>
  )
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3">
      <dt className="text-[color:var(--text-muted)]">{label}</dt>
      <dd className="break-all text-[color:var(--text-primary)]">{value}</dd>
    </div>
  )
}
