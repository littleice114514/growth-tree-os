import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useWorkspaceStore } from '@/app/store'
import { buildLifeCurveScoresFromReviews, lifeCurveLineMeta } from './lifeCurveRules'
import { buildLifeScenarioCurves } from './lifeScenarioCurves'
import { LifeScenarioCurveChart } from './LifeScenarioCurveChart'
import type { LifeCurveDailyScore, LifeCurveLineId, LifeCurveRiskLevel } from './lifeCurveTypes'

const riskStyles: Record<LifeCurveRiskLevel, string> = {
  low: 'border-emerald-400/25 bg-emerald-400/10 text-accent-green',
  medium: 'border-amber-400/25 bg-amber-400/10 text-accent-amber',
  high: 'border-rose-400/25 bg-rose-400/10 text-accent-rose'
}

const riskLabels: Record<LifeCurveRiskLevel, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险'
}

const lineTone: Record<LifeCurveLineId, string> = {
  personalAbility: 'bg-cyan-400',
  projectPulse: 'bg-emerald-400',
  aiLeverage: 'bg-violet-400',
  wealthSafety: 'bg-amber-400',
  healthVitality: 'bg-rose-400'
}

export function LifeCurveDashboard() {
  const recentReviews = useWorkspaceStore((state) => state.recentReviews)
  const scores = useMemo(() => buildLifeCurveScoresFromReviews(recentReviews, 7), [recentReviews])
  const scenarioCurves = useMemo(() => buildLifeScenarioCurves(), [])
  const latest = scores.at(-1)
  const isMock = latest?.sourceLabel === 'mock'
  const strongest = latest ? getStrongestLine(latest) : lifeCurveLineMeta[0]
  const weakest = latest ? getWeakestLine(latest) : lifeCurveLineMeta[0]

  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--panel-border)] pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Life Curve V0</div>
            <h2 className="mt-2 text-2xl font-semibold">人生曲线</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
              生长树看结构，人生曲线看趋势。当前由最近复盘前端规则派生，暂未写入数据库，不做未来预测。
            </p>
          </div>
          {latest ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="今日复合分" value={latest.scores.composite.toFixed(1)} />
              <Metric label="变强的线" value={strongest.label} />
              <Metric label="最该补的线" value={weakest.label} />
            </div>
          ) : null}
        </header>

        <LifeScenarioCurveChart curves={scenarioCurves} />

        {latest ? (
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel title="今日曲线判断" eyebrow={latest.date}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="趋势" value={latest.trend.label} />
                <Metric label="底线状态" value={latest.trend.floorStatus} />
                <div className={`rounded-2xl border px-4 py-3 ${riskStyles[latest.trend.riskLevel]}`}>
                  <div className="text-xs uppercase tracking-[0.18em] opacity-75">风险等级</div>
                  <div className="mt-1 text-xl font-semibold">{riskLabels[latest.trend.riskLevel]}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {lifeCurveLineMeta.map((line) => (
                  <LineScore key={line.id} score={latest} lineId={line.id} />
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4 text-sm leading-6 text-[color:var(--text-secondary)]">
                {latest.nextFocus}
              </p>
            </Panel>

            <Panel title="最近 7 天复合趋势" eyebrow={isMock ? 'Mock fallback' : 'Recent reviews'}>
              <div className="flex h-40 items-end gap-2 border-b border-[color:var(--panel-border)] pb-3">
                {scores.map((item) => (
                  <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end rounded-xl bg-[var(--inspector-section-bg)] px-2 pb-2">
                      <div
                        className="w-full rounded-lg bg-accent-green/80"
                        style={{ height: `${Math.max(8, (item.scores.composite / 5) * 100)}%` }}
                        title={`${item.date} / ${item.scores.composite}`}
                      />
                    </div>
                    <div className="w-full truncate text-center text-[11px] text-[color:var(--text-muted)]">{item.date.slice(5)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {lifeCurveLineMeta.map((line) => (
                  <TrendRow key={line.id} lineId={line.id} scores={scores} />
                ))}
              </div>
            </Panel>
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="五条线解释" eyebrow="Scoring Template">
            <div className="grid gap-3">
              {lifeCurveLineMeta.map((line) => (
                <div key={line.id} className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{line.label}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{Math.round(line.weight * 100)}%</div>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{line.treeLink}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="每日证据与风险" eyebrow="Daily Score Cards">
            <div className="grid gap-3">
              {scores
                .slice()
                .reverse()
                .map((score) => (
                  <DailyScoreCard key={score.date} score={score} />
                ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-5 shadow-panel backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{eyebrow}</div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}

function LineScore({ score, lineId }: { score: LifeCurveDailyScore; lineId: LifeCurveLineId }) {
  const line = lifeCurveLineMeta.find((item) => item.id === lineId) ?? lifeCurveLineMeta[0]
  const value = score.scores[lineId]
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{line.shortLabel}</span>
        <span className="text-sm text-[color:var(--text-secondary)]">{value}/5</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${lineTone[lineId]}`} style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  )
}

function TrendRow({ lineId, scores }: { lineId: LifeCurveLineId; scores: LifeCurveDailyScore[] }) {
  const line = lifeCurveLineMeta.find((item) => item.id === lineId) ?? lifeCurveLineMeta[0]
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
      <div className="text-xs text-[color:var(--text-muted)]">{line.shortLabel}</div>
      <div className="flex gap-1">
        {scores.map((score) => (
          <div key={`${score.date}-${lineId}`} className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full ${lineTone[lineId]}`} style={{ width: `${(score.scores[lineId] / 5) * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyScoreCard({ score }: { score: LifeCurveDailyScore }) {
  return (
    <article className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-medium">{score.date}</div>
          <div className="mt-1 text-sm text-[color:var(--text-secondary)]">
            {score.trend.label} / 复合分 {score.scores.composite.toFixed(1)}
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${riskStyles[score.trend.riskLevel]}`}>{riskLabels[score.trend.riskLevel]}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {lifeCurveLineMeta.map((line) => (
          <div key={line.id} className="rounded-xl bg-black/10 p-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{line.label}</span>
              <span className="text-[color:var(--text-secondary)]">{score.scores[line.id]}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-[color:var(--text-muted)]">
              {score.evidence[line.id].slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {score.risks.length > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
          {score.risks.join('；')}
        </div>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{score.nextFocus}</p>
    </article>
  )
}

function getStrongestLine(score: LifeCurveDailyScore) {
  return lifeCurveLineMeta.reduce((current, line) => (score.scores[line.id] > score.scores[current.id] ? line : current), lifeCurveLineMeta[0])
}

function getWeakestLine(score: LifeCurveDailyScore) {
  return lifeCurveLineMeta.reduce((current, line) => (score.scores[line.id] < score.scores[current.id] ? line : current), lifeCurveLineMeta[0])
}
