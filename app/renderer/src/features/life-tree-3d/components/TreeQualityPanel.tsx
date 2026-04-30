import type { QualityProfileName } from '../contracts'
import { qualityProfiles } from '../performance'

const qualityOptions: QualityProfileName[] = ['low', 'medium', 'high']

export function TreeQualityPanel({
  value,
  onChange
}: {
  value: QualityProfileName
  onChange: (value: QualityProfileName) => void
}) {
  const profile = qualityProfiles[value]

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">quality profile</div>
          <div className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Leaves {profile.maxLeaves} / Fruits {profile.maxFruits}
          </div>
        </div>
        <div className="flex rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] p-1">
          {qualityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={
                value === option
                  ? 'rounded-xl bg-[var(--button-bg)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--button-text)]'
                  : 'rounded-xl px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
