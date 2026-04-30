import { useMemo, useState } from 'react'
import { LifeTreeCanvas, TreeDebugPanel, TreeQualityPanel, WebGLFallback, isWebGLAvailable } from '../components'
import type { QualityProfileName } from '../contracts'
import { useTreeKeyboardShortcuts, useTreeSelection } from '../interaction'
import { mockGrowthSimulationResult } from '../mock/mockGrowthSimulationResult'
import { mockTreeSnapshot } from '../mock/mockTreeSnapshot'
import { qualityProfiles, resolveDefaultQualityProfile } from '../performance'
import { RendererModeSwitch } from '../renderers'

export function LifeTree3DPreview() {
  const [qualityName, setQualityName] = useState<QualityProfileName>(() => resolveDefaultQualityProfile())
  const [webGLAvailable] = useState(() => isWebGLAvailable())
  const selection = useTreeSelection()
  const snapshot = mockGrowthSimulationResult.nextSnapshot ?? mockTreeSnapshot
  const qualityProfile = qualityProfiles[qualityName]

  useTreeKeyboardShortcuts({ active: true, onEscape: selection.clearSelection })

  const snapshotSummary = useMemo(
    () => ({
      branches: snapshot.branches.length,
      leaves: snapshot.leaves.length,
      fruits: snapshot.fruits.length,
      scars: snapshot.scars.length,
      vitality: snapshot.vitality.score
    }),
    [snapshot]
  )

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-4">
      <section className="min-h-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] px-4 py-3 shadow-panel">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent-cyan">M3D-3 procedural 3D POC</div>
            <h2 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">Life Tree 3D Preview</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[color:var(--text-secondary)]">
            <Pill text={`vitality ${snapshotSummary.vitality}`} />
            <Pill text={`${snapshotSummary.branches} branches`} />
            <Pill text={`${snapshotSummary.leaves} leaves`} />
            <Pill text={`${snapshotSummary.fruits} fruits`} />
            <Pill text={`${snapshotSummary.scars} scars`} />
          </div>
        </div>
        {webGLAvailable ? (
          <LifeTreeCanvas snapshot={snapshot} qualityProfile={qualityProfile} onSelectNode={selection.selectNode} />
        ) : (
          <WebGLFallback />
        )}
      </section>
      <aside className="flex min-h-0 flex-col gap-4 overflow-auto">
        <TreeQualityPanel value={qualityName} onChange={setQualityName} />
        <RendererModeSwitch value={snapshot.rendererModeHint} />
        <TreeDebugPanel
          selectedNode={selection.selectedNode}
          selectedAt={selection.selectedAt}
          qualityProfile={qualityProfile}
          onClear={selection.clearSelection}
        />
      </aside>
    </main>
  )
}

function Pill({ text }: { text: string }) {
  return <span className="rounded-full border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1">{text}</span>
}
