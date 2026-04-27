import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { DailyVitalityCheck, VitalityCheckItem } from './lifeVitalityTreeTypes'
import {
  buildDailyVitalityCheck,
  createDefaultVitalityItems,
  vitalityPatternLabels,
  vitalitySeasonHints,
  vitalitySeasonLabels
} from './lifeVitalityTreeVitality'

type VitalityCheckPanelProps = {
  onChange?: (check: DailyVitalityCheck) => void
}

export function VitalityCheckPanel({ onChange }: VitalityCheckPanelProps) {
  const [items, setItems] = useState<VitalityCheckItem[]>(() => createDefaultVitalityItems())
  const check = useMemo(() => buildDailyVitalityCheck(items), [items])

  const updateItem = (dimension: VitalityCheckItem['dimension'], patch: Partial<VitalityCheckItem>) => {
    setItems((current) => {
      const next = current.map((item) => (item.dimension === dimension ? { ...item, ...patch } : item))
      onChange?.(buildDailyVitalityCheck(next))
      return next
    })
  }

  return (
    <aside className="min-h-0 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-5 shadow-panel backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">vitality check v0.4</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">今日生命力检查</h3>
          <p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">7 个维度，0-5 分。调整后会联动树状态、视觉气质和详情解释。</p>
        </div>
        <div className="rounded-[18px] border border-emerald-200/25 bg-emerald-200/10 px-3 py-2 text-right">
          <div className="text-xl font-semibold text-emerald-100">{check.totalScore} / 35</div>
          <div className="text-[11px] text-emerald-100/65">总分</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-[18px] border border-white/10 bg-black/10 p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[color:var(--text-muted)]">状态</span>
          <span className="font-medium text-[color:var(--text-primary)]">{vitalityPatternLabels[check.pattern]}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[color:var(--text-muted)]">季节反馈</span>
          <span className="font-medium text-[color:var(--text-primary)]">
            {vitalitySeasonLabels[check.season]} / {vitalitySeasonHints[check.season]}
          </span>
        </div>
        <p className="text-xs leading-5 text-[color:var(--text-secondary)]">{check.summary}</p>
      </div>

      <div className="mt-4 space-y-3">
        {check.items.map((item) => (
          <section key={item.dimension} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-[color:var(--text-primary)]">{item.label}</div>
                <p className="mt-1 text-xs leading-5 text-[color:var(--text-muted)]">{item.question}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-[color:var(--text-secondary)]">
                {item.score}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-1">
              {[0, 1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => updateItem(item.dimension, { score })}
                  className={clsx(
                    'h-8 rounded-xl border text-xs transition',
                    item.score === score
                      ? 'border-emerald-200/60 bg-emerald-200/18 text-white'
                      : 'border-white/10 bg-white/5 text-[color:var(--text-muted)] hover:border-emerald-200/35 hover:text-[color:var(--text-primary)]'
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
            <input
              value={item.note ?? ''}
              onChange={(event) => updateItem(item.dimension, { note: event.target.value })}
              placeholder="一句简短备注"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-emerald-200/45"
            />
          </section>
        ))}
      </div>

      <p className="mt-4 rounded-[18px] border border-white/10 bg-black/10 px-4 py-3 text-xs leading-5 text-[color:var(--text-muted)]">
        当前生命力检查为 v0.4 前端状态版本，暂未写入数据库。后续会设计 DailyVitalityCheck 的持久化、复盘关联和更细的叶子/果实/落叶规则。
      </p>
    </aside>
  )
}
