import type { RendererMode } from '../contracts'

export function RendererModeSwitch({ value }: { value: RendererMode }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3 text-sm text-[color:var(--text-secondary)] shadow-panel">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">renderer mode</div>
      <div className="mt-1 font-medium text-[color:var(--text-primary)]">{value}</div>
      <div className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">M3D-3 only enables procedural mode. Model-backed modes stay reserved.</div>
    </div>
  )
}
