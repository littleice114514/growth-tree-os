import type { LifeScenarioCurve, LifeScenarioCurveKey } from './lifeScenarioCurves'

export function LifeScenarioCurveLegend({
  curves,
  visibleKeys,
  onToggle
}: {
  curves: LifeScenarioCurve[]
  visibleKeys: LifeScenarioCurveKey[]
  onToggle: (key: LifeScenarioCurveKey) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {curves.map((curve) => {
        const isVisible = visibleKeys.includes(curve.key)
        return (
          <button
            key={curve.key}
            type="button"
            onClick={() => onToggle(curve.key)}
            className={
              isVisible
                ? 'rounded-2xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-sm font-medium text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'
                : 'rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
            }
            title={curve.description}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: curve.color }} />
              {curve.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
