import { useMemo, useState } from 'react'
import {
  type InvestmentRecord,
  type InvestmentRecordDraft,
  type InvestmentAssetType,
  type InvestmentStatus,
  type RecurringFrequency,
  investmentAssetTypeLabels,
  investmentStatusLabels,
  recurringFrequencyLabels,
  createInvestmentDraft,
  appendInvestmentRecord,
  updateInvestmentRecord,
  deleteInvestmentRecord,
  computeCurrentValue,
  computeNextRecurringDate
} from './investmentStorage'
import { PositionPieChart, PnlLineChart } from './InvestmentCharts'

export function InvestmentRecordsPanel({
  records,
  onRecordsChange,
  investableSurplus,
  dailySafeLine
}: {
  records: InvestmentRecord[]
  onRecordsChange: (records: InvestmentRecord[]) => void
  investableSurplus: number
  dailySafeLine: number
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<InvestmentRecordDraft>(() => createInvestmentDraft())

  const handleOpenNew = () => {
    setEditingId(null)
    setDraft(createInvestmentDraft())
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (record: InvestmentRecord) => {
    setEditingId(record.id)
    setDraft({
      assetName: record.assetName,
      assetType: record.assetType,
      marketSymbol: record.marketSymbol ?? '',
      principal: String(record.principal),
      quantity: record.quantity != null ? String(record.quantity) : '',
      recurringAmount: String(record.recurringAmount),
      recurringFrequency: record.recurringFrequency,
      recurringStartDate: record.recurringStartDate ?? '',
      recurringDay: record.recurringDay != null ? String(record.recurringDay) : '',
      firstBuyDate: record.firstBuyDate ?? '',
      status: record.status,
      note: record.note
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const principal = Number(draft.principal) || 0
    const quantity = draft.quantity ? Number(draft.quantity) : undefined
    const recurringAmount = Number(draft.recurringAmount) || 0
    const assetName = draft.assetName.trim()
    if (!assetName) return

    const marketSymbol = draft.marketSymbol.trim() || undefined
    const averageCost = quantity && quantity > 0 ? principal / quantity : undefined
    const recurringDay = draft.recurringDay ? Number(draft.recurringDay) : undefined
    const nextRecurringDate = computeNextRecurringDate(
      draft.recurringStartDate || undefined,
      draft.recurringFrequency,
      recurringDay
    )

    const timestamp = new Date().toISOString()
    const existingRecord = editingId ? records.find((r) => r.id === editingId) : undefined

    // currentValue fallback: if no quantity/latestPrice, use existing or principal
    const currentValue = existingRecord?.currentValue ?? principal

    const base: InvestmentRecord = {
      id: editingId ?? `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      assetName,
      assetType: draft.assetType,
      marketSymbol,
      principal,
      quantity,
      averageCost,
      currentValue,
      latestPrice: existingRecord?.latestPrice,
      firstBuyDate: draft.firstBuyDate || undefined,
      recurringAmount,
      recurringFrequency: draft.recurringFrequency,
      recurringStartDate: draft.recurringStartDate || undefined,
      recurringDay,
      nextRecurringDate,
      status: draft.status,
      note: draft.note.trim(),
      createdAt: existingRecord?.createdAt ?? timestamp,
      updatedAt: timestamp
    }

    if (editingId) {
      onRecordsChange(updateInvestmentRecord(base))
    } else {
      onRecordsChange(appendInvestmentRecord(base))
    }

    setIsDialogOpen(false)
    setEditingId(null)
  }

  const handleDelete = (recordId: string) => {
    onRecordsChange(deleteInvestmentRecord(recordId))
  }

  const summary = useMemo(() => {
    const totalPrincipal = records.reduce((sum, r) => sum + r.principal, 0)
    const totalCurrentValue = records.reduce((sum, r) => sum + computeCurrentValue(r).value, 0)
    const floatingPnl = totalCurrentValue - totalPrincipal
    const floatingPnlRate = totalPrincipal > 0 ? floatingPnl / totalPrincipal : 0
    const assetCount = records.length
    const activeRecurring = records.filter((r) => r.status === 'active' && r.recurringAmount > 0 && r.recurringFrequency !== 'none')
    const activeRecurringCount = activeRecurring.length
    const monthlyRecurring = activeRecurring.reduce((sum, r) => {
      if (r.recurringFrequency === 'daily') return sum + r.recurringAmount * 30
      if (r.recurringFrequency === 'weekly') return sum + r.recurringAmount * 4
      if (r.recurringFrequency === 'monthly') return sum + r.recurringAmount
      return sum
    }, 0)

    const byType: Record<string, number> = {}
    for (const r of records) {
      const base = computeCurrentValue(r).value
      byType[r.assetType] = (byType[r.assetType] ?? 0) + base
    }

    const activeCount = records.filter((r) => r.status === 'active').length
    const pausedCount = records.filter((r) => r.status === 'paused').length
    const autoValuedCount = records.filter((r) => computeCurrentValue(r).isAutoValued).length

    return {
      totalPrincipal,
      totalCurrentValue,
      floatingPnl,
      floatingPnlRate,
      assetCount,
      activeRecurringCount,
      monthlyRecurring,
      byType,
      activeCount,
      pausedCount,
      autoValuedCount
    }
  }, [records])

  const constraints = useMemo(() => {
    if (records.length === 0) return []

    const items: { level: 'normal' | 'watch' | 'risk'; title: string; detail: string; basis: string }[] = []

    // A. Safety line constraint
    if (investableSurplus <= 0) {
      items.push({
        level: 'risk',
        title: '当前无可投资结余',
        detail: '当前没有可用于投资的结余资金，建议先保证生活现金流和安全线，再考虑继续投资。',
        basis: `可投资结余 ${formatMoney(investableSurplus)}，每日安全线 ${formatMoney(dailySafeLine)}`
      })
    } else if (investableSurplus < dailySafeLine * 3) {
      items.push({
        level: 'watch',
        title: '可投资结余偏低',
        detail: '当前可投资结余不足 3 天安全线，需要关注现金流稳定性。',
        basis: `可投资结余 ${formatMoney(investableSurplus)}，3 日安全线 ${formatMoney(dailySafeLine * 3)}`
      })
    } else {
      items.push({
        level: 'normal',
        title: '安全线约束正常',
        detail: '当前可投资结余充足，现金流安全。',
        basis: `可投资结余 ${formatMoney(investableSurplus)}，每日安全线 ${formatMoney(dailySafeLine)}`
      })
    }

    // B. Recurring pressure constraint
    if (summary.monthlyRecurring > 0) {
      if (investableSurplus > 0 && summary.monthlyRecurring > investableSurplus) {
        items.push({
          level: 'risk',
          title: '定投压力偏高',
          detail: '当前每月预计定投金额超过可投资结余，可能挤压生活现金流。',
          basis: `每月预计定投 ${formatMoney(summary.monthlyRecurring)}，可投资结余 ${formatMoney(investableSurplus)}`
        })
      } else if (investableSurplus > 0 && summary.monthlyRecurring > investableSurplus * 0.7) {
        items.push({
          level: 'watch',
          title: '定投压力需要关注',
          detail: '当前每月预计定投金额接近可投资结余的 70%，建议结合现金流确认可持续性。',
          basis: `每月预计定投 ${formatMoney(summary.monthlyRecurring)}，可投资结余 ${formatMoney(investableSurplus)}`
        })
      } else if (investableSurplus <= 0) {
        items.push({
          level: 'risk',
          title: '定投需要复核',
          detail: '当前无可投资结余，请结合现金流确认定投是否可持续。',
          basis: `每月预计定投 ${formatMoney(summary.monthlyRecurring)}，可投资结余 ${formatMoney(investableSurplus)}`
        })
      }
    }

    // C. Concentration constraint
    const typeEntries = Object.entries(summary.byType).filter(([, v]) => v > 0)
    const typeTotal = typeEntries.reduce((sum, [, v]) => sum + v, 0)
    if (typeTotal > 0 && typeEntries.length > 1) {
      const maxEntry = typeEntries.reduce((max, entry) => entry[1] > max[1] ? entry : max, typeEntries[0])
      const maxPct = (maxEntry[1] / typeTotal) * 100
      if (maxPct >= 80) {
        items.push({
          level: 'risk',
          title: '资产高度集中',
          detail: `单一资产类型占比达到 ${maxPct.toFixed(1)}%，集中度极高，需要关注分散风险。`,
          basis: `${investmentAssetTypeLabels[maxEntry[0] as InvestmentAssetType] ?? maxEntry[0]} 占比 ${maxPct.toFixed(1)}%`
        })
      } else if (maxPct >= 60) {
        items.push({
          level: 'watch',
          title: '资产集中度偏高',
          detail: `单一资产类型占比达到 ${maxPct.toFixed(1)}%，需要关注资产分散。`,
          basis: `${investmentAssetTypeLabels[maxEntry[0] as InvestmentAssetType] ?? maxEntry[0]} 占比 ${maxPct.toFixed(1)}%`
        })
      }
    }

    // D. Discipline constraint
    if (summary.activeCount === summary.assetCount && summary.activeRecurringCount > 0 && investableSurplus <= 0) {
      items.push({
        level: 'watch',
        title: '定投纪律需要复核',
        detail: '所有投资都处于进行中状态，但当前无可投资结余，建议重新检查定投节奏。',
        basis: `进行中投资 ${summary.activeCount} 项，可投资结余 ${formatMoney(investableSurplus)}`
      })
    }
    if (summary.pausedCount > 0 && summary.pausedCount === summary.assetCount) {
      items.push({
        level: 'normal',
        title: '当前处于保守状态',
        detail: '所有投资均已暂停，当前处于保守观察状态。',
        basis: `暂停投资 ${summary.pausedCount} 项`
      })
    }

    return items
  }, [records, summary, investableSurplus, dailySafeLine])

  return (
    <div className="flex flex-col gap-5">
      {/* Investment Structure Dashboard */}
      <InvestmentSummaryPanel summary={summary} />

      {/* Position Pie + P&L Line */}
      {records.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <PositionPieChart records={records} />
          <PnlLineChart records={records} />
        </div>
      ) : null}

      {/* Investment Constraints */}
      <InvestmentConstraintPanel constraints={constraints} />

      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Investment</div>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">投资记录</h3>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              共 {records.length} 条，{records.filter((r) => r.status === 'active').length} 项进行中
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenNew}
            className="rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
          >
            新增投资记录
          </button>
        </div>

        {records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-6 text-center">
            <div className="text-sm font-medium text-[color:var(--text-secondary)]">还没有投资记录</div>
            <p className="mt-2 text-xs text-[color:var(--text-muted)]">
              点击「新增投资记录」开始记录你的投资资产。
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <InvestmentRecordCard
                key={record.id}
                record={record}
                onEdit={() => handleOpenEdit(record)}
                onDelete={() => handleDelete(record.id)}
              />
            ))}
          </div>
        )}
      </section>

      {isDialogOpen ? (
        <InvestmentDialog
          draft={draft}
          isEditing={editingId !== null}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onClose={() => { setIsDialogOpen(false); setEditingId(null) }}
          onSave={handleSave}
        />
      ) : null}
    </div>
  )
}

function InvestmentSummaryPanel({
  summary
}: {
  summary: {
    totalPrincipal: number
    totalCurrentValue: number
    floatingPnl: number
    floatingPnlRate: number
    assetCount: number
    activeRecurringCount: number
    monthlyRecurring: number
    byType: Record<string, number>
    activeCount: number
    pausedCount: number
    autoValuedCount: number
  }
}) {
  if (summary.assetCount === 0) return null

  const typeEntries = Object.entries(summary.byType)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
  const typeTotal = typeEntries.reduce((sum, [, v]) => sum + v, 0)

  // Chinese market convention: red = profit, green = loss
  const pnlColor = summary.floatingPnl >= 0 ? 'text-accent-rose' : 'text-accent-green'
  const pnlSign = summary.floatingPnl >= 0 ? '+' : ''
  const rateColor = summary.floatingPnlRate >= 0 ? 'text-accent-rose' : 'text-accent-green'

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Dashboard</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">投资收益看板</h3>
      </div>

      {/* Big P&L Numbers */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Total P&L */}
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
          <div className="text-xs text-[color:var(--text-muted)]">总收益 / 总亏损</div>
          <div className={`mt-1 text-3xl font-bold ${pnlColor}`}>
            {pnlSign}{formatMoney(summary.floatingPnl)}
          </div>
          <div className={`mt-1 text-sm font-medium ${rateColor}`}>
            {pnlSign}{(summary.floatingPnlRate * 100).toFixed(2)}%
          </div>
        </div>

        {/* Market Value & Principal */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
            <div className="text-[10px] text-[color:var(--text-muted)]">当前总市值</div>
            <div className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">{formatMoney(summary.totalCurrentValue)}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
            <div className="text-[10px] text-[color:var(--text-muted)]">投入本金</div>
            <div className="mt-1 text-lg font-semibold text-[color:var(--text-secondary)]">{formatMoney(summary.totalPrincipal)}</div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryMetric
          label="持仓数量"
          value={`${summary.assetCount} 项`}
          className="text-[color:var(--text-primary)]"
        />
        <SummaryMetric
          label="市价估值"
          value={`${summary.autoValuedCount} / ${summary.assetCount}`}
          className="text-accent-cyan"
        />
        <SummaryMetric
          label="进行中定投"
          value={`${summary.activeRecurringCount} 项`}
          className="text-[color:var(--text-primary)]"
        />
        <SummaryMetric
          label="每月预计定投"
          value={summary.monthlyRecurring > 0 ? formatMoney(summary.monthlyRecurring) : '--'}
          className="text-[color:var(--text-secondary)]"
        />
      </div>

      {/* Asset Type Distribution */}
      {typeEntries.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="mb-2 text-xs font-semibold text-[color:var(--text-secondary)]">资产类型分布</div>
          <div className="space-y-2">
            {typeEntries.map(([type, value]) => {
              const pct = typeTotal > 0 ? (value / typeTotal) * 100 : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs text-[color:var(--text-muted)]">
                    {investmentAssetTypeLabels[type as InvestmentAssetType] ?? type}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-[var(--control-bg)]">
                      <div
                        className="h-2 rounded-full bg-accent-cyan/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-[color:var(--text-secondary)]">
                    {pct.toFixed(1)}%
                  </span>
                  <span className="w-24 shrink-0 text-right text-xs text-[color:var(--text-muted)]">
                    {formatMoney(value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Safety Reminder */}
      <div className="mt-3 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
        <p className="text-xs leading-5 text-[color:var(--text-muted)]">
          红色 = 收益增加，绿色 = 亏损。投资记录用于观察资产结构和定投纪律，不提供买卖建议。
        </p>
      </div>
    </section>
  )
}

const constraintLevelStyle: Record<string, string> = {
  normal: 'border-emerald-400/25 bg-emerald-400/10',
  watch: 'border-amber-400/25 bg-amber-400/10',
  risk: 'border-rose-400/25 bg-rose-400/10'
}

const constraintLevelLabel: Record<string, string> = {
  normal: '正常',
  watch: '关注',
  risk: '风险'
}

const constraintLevelTextColor: Record<string, string> = {
  normal: 'text-accent-green',
  watch: 'text-accent-amber',
  risk: 'text-accent-rose'
}

function InvestmentConstraintPanel({
  constraints
}: {
  constraints: { level: 'normal' | 'watch' | 'risk'; title: string; detail: string; basis: string }[]
}) {
  if (constraints.length === 0) {
    return (
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Constraints</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">投资约束提醒</h3>
        </div>
        <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-4 text-sm text-[color:var(--text-muted)]">
          暂无投资约束提醒。先添加投资记录后，系统会根据资产结构和定投计划生成约束提醒。
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Constraints</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">投资约束提醒</h3>
      </div>
      <div className="space-y-2">
        {constraints.map((item, index) => (
          <div key={index} className={`rounded-2xl border p-3 ${constraintLevelStyle[item.level]}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${constraintLevelTextColor[item.level]}`}>
                {constraintLevelLabel[item.level]}
              </span>
              <span className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">{item.detail}</p>
            <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">依据：{item.basis}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SummaryMetric({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${className}`}>{value}</div>
    </div>
  )
}

function InvestmentRecordCard({
  record,
  onEdit,
  onDelete
}: {
  record: InvestmentRecord
  onEdit: () => void
  onDelete: () => void
}) {
  const cv = computeCurrentValue(record)
  const pnl = cv.value - record.principal
  const pnlPercent = record.principal > 0 ? ((pnl / record.principal) * 100).toFixed(1) : '0.0'

  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[color:var(--text-primary)]">{record.assetName}</span>
            <span className="rounded-lg border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2 py-0.5 text-[10px] text-[color:var(--text-muted)]">
              {investmentAssetTypeLabels[record.assetType]}
            </span>
            <span className={`rounded-lg px-2 py-0.5 text-[10px] ${
              record.status === 'active'
                ? 'border border-emerald-400/25 bg-emerald-400/10 text-accent-green'
                : 'border border-[color:var(--input-border)] bg-[var(--control-bg)] text-[color:var(--text-muted)]'
            }`}>
              {investmentStatusLabels[record.status]}
            </span>
            {cv.isAutoValued ? (
              <span className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-accent-cyan">
                市价估值
              </span>
            ) : null}
            {record.marketSymbol ? (
              <span className="rounded-lg border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2 py-0.5 text-[10px] text-[color:var(--text-muted)]">
                {record.marketSymbol}
              </span>
            ) : null}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
            <div>
              <span className="text-[color:var(--text-muted)]">本金 </span>
              <span className="text-[color:var(--text-secondary)]">{formatMoney(record.principal)}</span>
            </div>
            <div>
              <span className="text-[color:var(--text-muted)]">{cv.isAutoValued ? '市价估值' : '估值'} </span>
              <span className="text-[color:var(--text-secondary)]">{formatMoney(cv.value)}</span>
            </div>
            <div>
              <span className="text-[color:var(--text-muted)]">盈亏 </span>
              <span className={pnl >= 0 ? 'text-accent-green' : 'text-accent-rose'}>
                {formatMoney(pnl)} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
              </span>
            </div>
            {record.recurringAmount > 0 && record.recurringFrequency !== 'none' ? (
              <div>
                <span className="text-[color:var(--text-muted)]">定投 </span>
                <span className="text-[color:var(--text-secondary)]">
                  {formatMoney(record.recurringAmount)} / {recurringFrequencyLabels[record.recurringFrequency]}
                </span>
              </div>
            ) : null}
          </div>
          {record.quantity != null ? (
            <div className="mt-1 text-[10px] text-[color:var(--text-muted)]">
              持有 {record.quantity}
              {record.averageCost != null ? ` · 均价 ${formatMoney(record.averageCost)}` : ''}
              {cv.latestPrice != null ? ` · 市价 ${formatMoney(cv.latestPrice)}` : ''}
            </div>
          ) : null}
          {record.nextRecurringDate && record.status === 'active' ? (
            <div className="mt-1 text-[10px] text-accent-cyan">
              下次定投：{record.nextRecurringDate}
            </div>
          ) : null}
          {record.note ? (
            <p className="mt-2 text-xs leading-5 text-[color:var(--text-muted)]">{record.note}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-[color:var(--input-border)] px-2 py-1 text-xs text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-[color:var(--input-border)] px-2 py-1 text-xs text-[color:var(--text-muted)] transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-accent-rose"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

function InvestmentDialog({
  draft,
  isEditing,
  onChange,
  onClose,
  onSave
}: {
  draft: InvestmentRecordDraft
  isEditing: boolean
  onChange: (patch: Partial<InvestmentRecordDraft>) => void
  onClose: () => void
  onSave: () => void
}) {
  const assetTypes: InvestmentAssetType[] = ['cash', 'saving', 'investment', 'fund', 'crypto', 'stock', 'other']
  const frequencies: RecurringFrequency[] = ['none', 'daily', 'weekly', 'monthly']
  const statuses: InvestmentStatus[] = ['active', 'paused']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <section className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--panel-border)] pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Investment</div>
            <h3 className="mt-1 text-xl font-semibold">{isEditing ? '编辑投资记录' : '新增投资记录'}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-[color:var(--input-border)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]">
            关闭
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InvestField label="资产名称">
            <input
              value={draft.assetName}
              onChange={(e) => onChange({ assetName: e.target.value })}
              placeholder="例：沪深300指数基金"
              className={inputClass}
            />
          </InvestField>

          <InvestField label="市场代码">
            <input
              value={draft.marketSymbol}
              onChange={(e) => onChange({ marketSymbol: e.target.value })}
              placeholder="例：SPY、000300、BTC-USD"
              className={inputClass}
            />
          </InvestField>

          <InvestField label="资产类型">
            <select
              value={draft.assetType}
              onChange={(e) => onChange({ assetType: e.target.value as InvestmentAssetType })}
              className={inputClass}
            >
              {assetTypes.map((t) => (
                <option key={t} value={t}>{investmentAssetTypeLabels[t]}</option>
              ))}
            </select>
          </InvestField>

          <InvestField label="投入本金">
            <input
              value={draft.principal}
              onChange={(e) => onChange({ principal: e.target.value })}
              type="number"
              min="0"
              placeholder="0"
              className={inputClass}
            />
          </InvestField>

          <InvestField label="持有数量">
            <input
              value={draft.quantity}
              onChange={(e) => onChange({ quantity: e.target.value })}
              type="number"
              min="0"
              step="any"
              placeholder="选填，用于市价自动估值"
              className={inputClass}
            />
          </InvestField>

          <InvestField label="买入日期">
            <input
              value={draft.firstBuyDate}
              onChange={(e) => onChange({ firstBuyDate: e.target.value })}
              type="date"
              className={inputClass}
            />
          </InvestField>

          <InvestField label="定投金额">
            <input
              value={draft.recurringAmount}
              onChange={(e) => onChange({ recurringAmount: e.target.value })}
              type="number"
              min="0"
              placeholder="0"
              className={inputClass}
            />
          </InvestField>

          <InvestField label="定投频率">
            <select
              value={draft.recurringFrequency}
              onChange={(e) => onChange({ recurringFrequency: e.target.value as RecurringFrequency })}
              className={inputClass}
            >
              {frequencies.map((f) => (
                <option key={f} value={f}>{recurringFrequencyLabels[f]}</option>
              ))}
            </select>
          </InvestField>

          {draft.recurringFrequency !== 'none' ? (
            <>
              <InvestField label="定投开始日期">
                <input
                  value={draft.recurringStartDate}
                  onChange={(e) => onChange({ recurringStartDate: e.target.value })}
                  type="date"
                  className={inputClass}
                />
              </InvestField>

              <InvestField label="定投日">
                <input
                  value={draft.recurringDay}
                  onChange={(e) => onChange({ recurringDay: e.target.value })}
                  type="number"
                  min="1"
                  max="31"
                  placeholder="选填，默认取开始日期"
                  className={inputClass}
                />
              </InvestField>
            </>
          ) : null}

          <InvestField label="状态">
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ status: s })}
                  className={
                    draft.status === s
                      ? 'flex-1 rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-sm text-[color:var(--text-primary)]'
                      : 'flex-1 rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]'
                  }
                >
                  {investmentStatusLabels[s]}
                </button>
              ))}
            </div>
          </InvestField>

          <InvestField label="备注">
            <textarea
              value={draft.note}
              onChange={(e) => onChange({ note: e.target.value })}
              rows={2}
              placeholder="选填"
              className={inputClass}
            />
          </InvestField>
        </div>

        <div className="mt-3 rounded-xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] px-3 py-2 text-[10px] text-[color:var(--text-muted)]">
          当前估值由「持有数量 × 市场市价」自动计算。填写市场代码后，如果行情数据可用，估值会自动更新。
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-[color:var(--input-border)] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]">
            取消
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!draft.assetName.trim()}
            className="rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)] disabled:opacity-40"
          >
            {isEditing ? '保存修改' : '保存记录'}
          </button>
        </div>
      </section>
    </div>
  )
}

function InvestField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-[color:var(--text-muted)]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const inputClass =
  'w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]'

function formatMoney(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0
  }).format(value)
}
