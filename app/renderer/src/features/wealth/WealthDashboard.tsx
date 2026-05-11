import { useMemo, useState } from 'react'
import {
  buildDailyWealthInputFromRecords,
  calculateDailyWealthSnapshot,
  summarizeWealthRecords,
  wealthRecordTypeDescriptions,
  wealthRecordTypeLabels,
  wealthStatusLabels,
  type DailyWealthSnapshot,
  type WealthBaseConfig,
  type WealthRecord,
  type WealthRecordType,
  type WealthStatus
} from '@shared/wealth'
import { appendWealthRecord, deleteWealthRecord, loadWealthRecords, wealthRecordsStorageKey } from './wealthStorage'
import {
  loadWealthBaseConfig,
  saveWealthBaseConfig,
  resetWealthBaseConfig,
  wealthConfigStorageKey
} from './wealthConfigStorage'
import { calculateOverdraftStreak, calculatePeriodOverdraftStreak, calculateCashflowTrend, periodLabels, type OverdraftStreak, type PeriodKey, type CashflowTrend } from './overdraftTracker'
import { WealthDashboardPreview } from '@/features/dashboard-preview'

type WealthTab = 'overview' | 'records' | 'config'
type RecordDraft = {
  date: string
  type: WealthRecordType
  amount: string
  source: string
  category: string
  title: string
  note: string
  cycle: 'daily' | 'weekly' | 'monthly' | 'yearly'
  isRigid: boolean
  cancelDifficulty: string
  stabilityScore: string
  laborDependencyScore: string
  systemType: 'content' | 'software' | 'automation' | 'project' | 'other'
  financeType: 'interest' | 'dividend' | 'fund' | 'crypto' | 'stock' | 'other'
  necessity: 'necessary' | 'optional'
  trigger: string
  isDopamineLeak: boolean
  assetName: string
  assetType: 'cash' | 'saving' | 'investment' | 'crypto' | 'device' | 'other'
  direction: 'increase' | 'decrease'
}

const today = new Date().toISOString().slice(0, 10)

const tabLabels: Record<WealthTab, string> = {
  overview: '总览',
  records: '记录',
  config: '参数'
}

const recordTypes: WealthRecordType[] = [
  'real_income',
  'passive_income',
  'system_income',
  'stable_finance',
  'real_expense',
  'ongoing_cost',
  'experience_cost',
  'asset_change'
]

const statusTone: Record<WealthStatus, string> = {
  growth: 'border-emerald-400/25 bg-emerald-400/10 text-accent-green',
  balanced: 'border-cyan-400/25 bg-cyan-400/10 text-accent-cyan',
  light_overdraft: 'border-amber-400/25 bg-amber-400/10 text-accent-amber',
  future_money_burning: 'border-rose-400/25 bg-rose-400/10 text-accent-rose',
  system_risk: 'border-rose-400/30 bg-rose-500/15 text-accent-rose'
}

const statusIcon: Record<WealthStatus, string> = {
  growth: '▲',
  balanced: '●',
  light_overdraft: '△',
  future_money_burning: '▽',
  system_risk: '✕'
}

export function WealthDashboard() {
  const [records, setRecords] = useState<WealthRecord[]>(() => loadWealthRecords())
  const [baseConfig, setBaseConfig] = useState<WealthBaseConfig>(() => loadWealthBaseConfig())
  const [currentTab, setCurrentTab] = useState<WealthTab>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('last7')
  const [trendPeriod, setTrendPeriod] = useState<'last7' | 'last30'>('last7')
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [draft, setDraft] = useState<RecordDraft>(() => createDraft())

  const overdraftStreak = useMemo(
    () => calculateOverdraftStreak(records, baseConfig.dailySafeLine, baseConfig.date),
    [records, baseConfig.dailySafeLine, baseConfig.date]
  )
  const periodStreak = useMemo(
    () => calculatePeriodOverdraftStreak(records, baseConfig.dailySafeLine, selectedPeriod, baseConfig.date),
    [records, baseConfig.dailySafeLine, selectedPeriod, baseConfig.date]
  )
  const cashflowTrend = useMemo(
    () => calculateCashflowTrend(records, baseConfig.dailySafeLine, trendPeriod, baseConfig.date),
    [records, baseConfig.dailySafeLine, trendPeriod, baseConfig.date]
  )
  const effectiveOverdraftDays = Math.max(baseConfig.consecutiveOverdraftDays ?? 0, overdraftStreak.current)
  const configForCalc = useMemo(
    () => ({ ...baseConfig, consecutiveOverdraftDays: effectiveOverdraftDays }),
    [baseConfig, effectiveOverdraftDays]
  )
  const summary = useMemo(() => summarizeWealthRecords(records, configForCalc.date, configForCalc), [records, configForCalc])
  const snapshot = useMemo(
    () => calculateDailyWealthSnapshot(buildDailyWealthInputFromRecords(records, configForCalc)),
    [records, configForCalc]
  )
  const recentRecords = records.slice(0, 5)

  const handleSaveConfig = () => {
    saveWealthBaseConfig(baseConfig)
  }

  const handleResetConfig = () => {
    const config = resetWealthBaseConfig()
    setBaseConfig(config)
  }

  const saveRecord = () => {
    const amount = Number(draft.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return
    }

    const timestamp = new Date().toISOString()
    const record: WealthRecord = {
      id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: draft.date,
      type: draft.type,
      amount,
      title: buildTitle(draft),
      category: draft.category.trim() || undefined,
      source: draft.source.trim() || undefined,
      note: draft.note.trim() || undefined,
      meta: buildMeta(draft),
      createdAt: timestamp,
      updatedAt: timestamp
    }

    setRecords(appendWealthRecord(record))
    setDraft(createDraft(draft.type))
    setIsRecorderOpen(false)
  }

  const removeRecord = (recordId: string) => {
    setRecords(deleteWealthRecord(recordId))
  }

  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--panel-border)] pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Wealth</div>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">财务生命体征</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsRecorderOpen(true)}
            className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
          >
            新增财富记录
          </button>
        </header>

        {/* Tab navigation */}
        <nav className="flex flex-wrap gap-2">
          {(Object.keys(tabLabels) as WealthTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCurrentTab(tab)}
              className={
                currentTab === tab
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'
                  : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {currentTab === 'overview' ? (
          <OverviewTab
            snapshot={snapshot}
            summary={summary}
            recentRecords={recentRecords}
            overdraftStreak={overdraftStreak}
            selectedPeriod={selectedPeriod}
            periodStreak={periodStreak}
            cashflowTrend={cashflowTrend}
            trendPeriod={trendPeriod}
            onPeriodChange={setSelectedPeriod}
            onTrendPeriodChange={setTrendPeriod}
            onDelete={removeRecord}
          />
        ) : null}

        {currentTab === 'records' ? (
          <RecordsTab records={records} onDelete={removeRecord} />
        ) : null}

        {currentTab === 'config' ? (
          <ConfigTab
            baseConfig={baseConfig}
            onConfigChange={(patch) => setBaseConfig((current) => ({ ...current, ...patch }))}
            onSaveConfig={handleSaveConfig}
            onResetConfig={handleResetConfig}
          />
        ) : null}
      </div>

      {isRecorderOpen ? (
        <RecordDialog
          draft={draft}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onClose={() => setIsRecorderOpen(false)}
          onSave={saveRecord}
        />
      ) : null}
    </main>
  )
}

/* ── Overview Tab ── */

function OverviewTab({
  snapshot,
  summary,
  recentRecords,
  overdraftStreak,
  selectedPeriod,
  periodStreak,
  cashflowTrend,
  trendPeriod,
  onPeriodChange,
  onTrendPeriodChange,
  onDelete
}: {
  snapshot: DailyWealthSnapshot
  summary: ReturnType<typeof summarizeWealthRecords>
  recentRecords: WealthRecord[]
  overdraftStreak: OverdraftStreak
  selectedPeriod: PeriodKey
  periodStreak: OverdraftStreak
  cashflowTrend: CashflowTrend
  trendPeriod: 'last7' | 'last30'
  onPeriodChange: (period: PeriodKey) => void
  onTrendPeriodChange: (period: 'last7' | 'last30') => void
  onDelete: (recordId: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* A. Hero: Vitals Card */}
      <VitalsHero snapshot={snapshot} summary={summary} overdraftStreak={overdraftStreak} />

      {/* B. Cashflow Trend (P3) */}
      <CashflowTrendPanel cashflowTrend={cashflowTrend} trendPeriod={trendPeriod} onTrendPeriodChange={onTrendPeriodChange} />

      {/* C. Period Slicer (P2) */}
      <PeriodSlicePanel
        selectedPeriod={selectedPeriod}
        periodStreak={periodStreak}
        onPeriodChange={onPeriodChange}
      />

      {/* D. Recent Records */}
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Recent</div>
            <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">最近财富记录</h3>
          </div>
          <div className="text-xs text-[color:var(--text-muted)]">完整列表在「记录」页</div>
        </div>
        <RecordList records={recentRecords} onDelete={onDelete} emptyText="暂无财富记录，点击右上角「新增财富记录」开始。" />
      </section>

      {/* E. Dashboard Preview */}
      <WealthDashboardPreview snapshot={snapshot} summary={summary} />
    </div>
  )
}

function VitalsHero({
  snapshot,
  summary,
  overdraftStreak
}: {
  snapshot: DailyWealthSnapshot
  summary: ReturnType<typeof summarizeWealthRecords>
  overdraftStreak: OverdraftStreak
}) {
  const toneClass = statusTone[snapshot.status]
  const icon = statusIcon[snapshot.status]
  const streakClass = overdraftStreak.riskTriggered
    ? 'text-accent-rose'
    : overdraftStreak.current > 0
      ? 'text-accent-amber'
      : 'text-accent-green'

  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Left: Status + Diagnosis */}
        <div>
          <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 ${toneClass}`}>
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-semibold">{wealthStatusLabels[snapshot.status]}</span>
          </div>
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">系统诊断</div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{snapshot.diagnosis}</p>
            <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{snapshot.priorityAction}</p>
          </div>
        </div>

        {/* Right: Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <HeroMetric
            label="连续透支"
            value={`${overdraftStreak.current} 天`}
            className={streakClass}
          />
          <HeroMetric
            label="自由度净变化"
            value={formatMoney(summary.freedomDelta)}
            className={summary.freedomDelta >= 0 ? 'text-accent-green' : 'text-accent-rose'}
          />
          <HeroMetric
            label="财富评分"
            value={`${snapshot.wealthScore}`}
            className={snapshot.wealthScore >= 70 ? 'text-accent-green' : snapshot.wealthScore >= 50 ? 'text-accent-amber' : 'text-accent-rose'}
          />
          <HeroMetric
            label="未来钱消耗"
            value={formatMoney(snapshot.futureMoneyUsed)}
            className={snapshot.futureMoneyUsed > 0 ? 'text-accent-rose' : 'text-accent-green'}
          />
        </div>
      </div>
    </section>
  )
}

function HeroMetric({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${className}`}>{value}</div>
    </div>
  )
}

function CashflowTrendPanel({
  cashflowTrend,
  trendPeriod,
  onTrendPeriodChange
}: {
  cashflowTrend: CashflowTrend
  trendPeriod: 'last7' | 'last30'
  onTrendPeriodChange: (period: 'last7' | 'last30') => void
}) {
  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Cashflow</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">现金流质量趋势</h3>
        </div>
        <div className="flex gap-2">
          {(['last7', 'last30'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => onTrendPeriodChange(period)}
              className={
                trendPeriod === period
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-1.5 text-xs text-[color:var(--text-primary)]'
                  : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {period === 'last7' ? '近 7 天' : '近 30 天'}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
        <div className="flex items-end gap-[3px]" style={{ height: '100px' }}>
          {cashflowTrend.days.map((day) => {
            const heightPercent = Math.max(2, day.expenseRatio * 100)
            return (
              <div key={day.date} className="group relative flex flex-1 flex-col items-center" title={`${day.date}: ${formatMoney(day.totalExpense)} / ${formatMoney(day.safeLine)}`}>
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <div
                    className={`w-full max-w-[20px] rounded-t-sm ${day.isOverdraft ? 'bg-rose-400/70' : 'bg-emerald-400/60'}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <div className="mt-1 truncate text-[8px] text-[color:var(--text-muted)]" style={{ maxWidth: '28px' }}>
                  {day.date.slice(5)}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-[color:var(--text-muted)]">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/60" />正常</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-rose-400/70" />透支</span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
        <p className="text-sm text-[color:var(--text-secondary)]">{cashflowTrend.summaryText}</p>
      </div>
    </section>
  )
}

function PeriodSlicePanel({
  selectedPeriod,
  periodStreak,
  onPeriodChange
}: {
  selectedPeriod: PeriodKey
  periodStreak: OverdraftStreak
  onPeriodChange: (period: PeriodKey) => void
}) {
  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Period</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">周期透支明细</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(periodLabels) as PeriodKey[]).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => onPeriodChange(period)}
            className={
              selectedPeriod === period
                ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-1.5 text-xs text-[color:var(--text-primary)]'
                : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
            }
          >
            {periodLabels[period]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className={`rounded-2xl border p-3 ${periodStreak.riskTriggered ? 'border-rose-400/30 bg-rose-500/15' : 'border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)]'}`}>
          <div className="text-xs text-[color:var(--text-muted)]">末尾连续透支</div>
          <div className={`mt-1 text-xl font-semibold ${periodStreak.riskTriggered ? 'text-accent-rose' : periodStreak.current > 0 ? 'text-accent-amber' : 'text-accent-green'}`}>
            {periodStreak.current} 天
          </div>
        </div>
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="text-xs text-[color:var(--text-muted)]">透支天数</div>
          <div className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">
            {periodStreak.days.filter((d) => d.isOverdraft).length} / {periodStreak.days.length}
          </div>
        </div>
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="text-xs text-[color:var(--text-muted)]">总支出</div>
          <div className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">
            {formatMoney(periodStreak.days.reduce((sum, d) => sum + d.totalExpense, 0))}
          </div>
        </div>
      </div>

      {periodStreak.days.length > 0 ? (
        <div className="mt-3">
          <div className="grid gap-1">
            {periodStreak.days.slice(-5).map((day) => (
              <div key={day.date} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--control-hover)]">
                <span className="text-[color:var(--text-secondary)]">{day.date}</span>
                <span className={day.isOverdraft ? 'text-accent-rose' : 'text-accent-green'}>
                  {formatMoney(day.totalExpense)} / {formatMoney(day.safeLine)} {day.isOverdraft ? '透支' : '正常'}
                </span>
              </div>
            ))}
          </div>
          {periodStreak.days.length > 5 ? (
            <div className="mt-1 text-center text-[10px] text-[color:var(--text-muted)]">
              共 {periodStreak.days.length} 天，显示最近 5 天
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--panel-border)] p-4 text-sm text-[color:var(--text-muted)]">
          {periodLabels[selectedPeriod]}暂无记录
        </div>
      )}
    </section>
  )
}

/* ── Records Tab ── */

function RecordsTab({ records, onDelete }: { records: WealthRecord[]; onDelete: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">All Records</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">全部财富记录</h3>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">共 {records.length} 条</p>
        </div>
        <RecordList records={records} onDelete={onDelete} emptyText="暂无财富记录。点击右上角「新增财富记录」开始记录。" />
      </section>
    </div>
  )
}

/* ── Config Tab ── */

function ConfigTab({
  baseConfig,
  onConfigChange,
  onSaveConfig,
  onResetConfig
}: {
  baseConfig: WealthBaseConfig
  onConfigChange: (patch: Partial<WealthBaseConfig>) => void
  onSaveConfig: () => void
  onResetConfig: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Base Config</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">基础参数配置</h3>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">修改后点击保存，配置将持久化到本地。</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ConfigField label="期初余额" value={String(baseConfig.openingBalance)} onChange={(v) => onConfigChange({ openingBalance: Number(v) || 0 })} />
          <ConfigField label="每日安全线" value={String(baseConfig.dailySafeLine)} onChange={(v) => onConfigChange({ dailySafeLine: Number(v) || 0 })} />
          <ConfigField label="节省池" value={String(baseConfig.savingPoolBefore)} onChange={(v) => onConfigChange({ savingPoolBefore: Number(v) || 0 })} />
          <ConfigField label="Reality Standard" value={String(baseConfig.realityStandard)} onChange={(v) => onConfigChange({ realityStandard: Number(v) || 0 })} />
          <ConfigField label="Deserved Standard" value={String(baseConfig.deservedStandard)} onChange={(v) => onConfigChange({ deservedStandard: Number(v) || 0 })} />
          <ConfigField label="月可支配余额" value={String(baseConfig.monthlyRemainingDisposable ?? '')} onChange={(v) => onConfigChange({ monthlyRemainingDisposable: v ? Number(v) : undefined })} />
          <ConfigField label="本月剩余天数" value={String(baseConfig.remainingDaysInMonth ?? '')} onChange={(v) => onConfigChange({ remainingDaysInMonth: v ? Number(v) : undefined })} />
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onSaveConfig} className="rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]">
            保存配置
          </button>
          <button type="button" onClick={onResetConfig} className="rounded-2xl border border-[color:var(--input-border)] px-5 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]">
            恢复默认
          </button>
        </div>
      </section>

      {/* WealthDashboardPreview in config for reference */}
      <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Preview</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">配置预览</h3>
        </div>
        <p className="text-xs text-[color:var(--text-muted)]">配置参数影响总览页面的计算结果。修改后可在此查看 preview。</p>
      </section>
    </div>
  )
}

/* ── Shared Components ── */

function RecordList({ records, emptyText = '暂无财富记录', onDelete }: { records: WealthRecord[]; emptyText?: string; onDelete?: (recordId: string) => void }) {
  if (records.length === 0) {
    return <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] p-4 text-sm text-[color:var(--text-muted)]">{emptyText}</div>
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div key={record.id} className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">{wealthRecordTypeLabels[record.type]}</span>
                <span className="text-sm text-accent-cyan">{formatMoney(record.amount)}</span>
              </div>
              <div className="mt-1 truncate text-xs text-[color:var(--text-muted)]">
                {record.date} / {record.title ?? record.source ?? record.category ?? record.meta?.assetType ?? '未命名记录'}
              </div>
              {record.meta?.isDopamineLeak ? <div className="mt-2 text-xs text-accent-rose">已标记失控 / 多巴胺泄漏</div> : null}
              {record.type === 'ongoing_cost' ? <div className="mt-2 text-xs text-accent-amber">周期：{record.meta?.cycle ?? 'monthly'}</div> : null}
              {record.note ? <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{record.note}</p> : null}
            </div>
            {onDelete ? (
              <button type="button" onClick={() => onDelete(record.id)} className="shrink-0 rounded-xl border border-[color:var(--input-border)] px-2 py-1 text-xs text-[color:var(--text-muted)] transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-accent-rose">
                删除
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Record Dialog ── */

function RecordDialog({
  draft,
  onChange,
  onClose,
  onSave
}: {
  draft: RecordDraft
  onChange: (patch: Partial<RecordDraft>) => void
  onClose: () => void
  onSave: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--panel-border)] pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Semantic Record</div>
            <h3 className="mt-1 text-xl font-semibold">新增财富记录</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              先选择财富事件类型，再记录金额和语义字段。
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-[color:var(--input-border)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]">
            关闭
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {recordTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ type })}
              className={
                draft.type === type
                  ? 'rounded-2xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] p-3 text-left text-sm text-[color:var(--text-primary)]'
                  : 'rounded-2xl border border-[color:var(--panel-border)] bg-[var(--control-bg)] p-3 text-left text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              <div className="font-semibold">{wealthRecordTypeLabels[type]}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-[color:var(--text-muted)]">{wealthRecordTypeDescriptions[type]}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
          <p className="text-sm leading-6 text-[color:var(--text-secondary)]">{wealthRecordTypeDescriptions[draft.type]}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="日期">
              <input value={draft.date} onChange={(event) => onChange({ date: event.target.value })} type="date" className={inputClass} />
            </Field>
            <Field label="金额">
              <input value={draft.amount} onChange={(event) => onChange({ amount: event.target.value })} type="number" min="0" className={inputClass} />
            </Field>
            {renderTypeFields(draft, onChange)}
            <Field label="备注">
              <textarea value={draft.note} onChange={(event) => onChange({ note: event.target.value })} rows={3} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-[color:var(--input-border)] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]">
            取消
          </button>
          <button type="button" onClick={onSave} className="rounded-2xl bg-[var(--button-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]">
            保存记录
          </button>
        </div>
      </section>
    </div>
  )
}

function renderTypeFields(draft: RecordDraft, onChange: (patch: Partial<RecordDraft>) => void) {
  if (draft.type === 'real_income') {
    return (
      <>
        <TextField label="来源" value={draft.source} onChange={(source) => onChange({ source })} />
        <TextField label="标题" value={draft.title} onChange={(title) => onChange({ title })} />
      </>
    )
  }
  if (draft.type === 'passive_income') {
    return (
      <>
        <TextField label="来源" value={draft.source} onChange={(source) => onChange({ source })} />
        <TextField label="稳定度 0-10" value={draft.stabilityScore} onChange={(stabilityScore) => onChange({ stabilityScore })} type="number" />
        <TextField label="劳动依赖度 0-10" value={draft.laborDependencyScore} onChange={(laborDependencyScore) => onChange({ laborDependencyScore })} type="number" />
      </>
    )
  }
  if (draft.type === 'system_income') {
    return (
      <>
        <TextField label="来源" value={draft.source} onChange={(source) => onChange({ source })} />
        <SelectField label="系统类型" value={draft.systemType} onChange={(systemType) => onChange({ systemType: systemType as RecordDraft['systemType'] })} options={['content', 'software', 'automation', 'project', 'other']} />
      </>
    )
  }
  if (draft.type === 'stable_finance') {
    return (
      <>
        <TextField label="来源" value={draft.source} onChange={(source) => onChange({ source })} />
        <SelectField label="理财类型" value={draft.financeType} onChange={(financeType) => onChange({ financeType: financeType as RecordDraft['financeType'] })} options={['interest', 'dividend', 'fund', 'crypto', 'stock', 'other']} />
      </>
    )
  }
  if (draft.type === 'real_expense') {
    return (
      <>
        <TextField label="分类" value={draft.category} onChange={(category) => onChange({ category })} />
        <SelectField label="必要性" value={draft.necessity} onChange={(necessity) => onChange({ necessity: necessity as RecordDraft['necessity'] })} options={['necessary', 'optional']} />
      </>
    )
  }
  if (draft.type === 'ongoing_cost') {
    return (
      <>
        <TextField label="持续项目名称" value={draft.title} onChange={(title) => onChange({ title })} />
        <SelectField label="周期" value={draft.cycle} onChange={(cycle) => onChange({ cycle: cycle as RecordDraft['cycle'] })} options={['daily', 'weekly', 'monthly', 'yearly']} />
        <TextField label="取消难度 0-10" value={draft.cancelDifficulty} onChange={(cancelDifficulty) => onChange({ cancelDifficulty })} type="number" />
        <CheckboxField label="刚性支出" checked={draft.isRigid} onChange={(isRigid) => onChange({ isRigid })} />
      </>
    )
  }
  if (draft.type === 'experience_cost') {
    return (
      <>
        <TextField label="分类" value={draft.category} onChange={(category) => onChange({ category })} />
        <TextField label="触发器" value={draft.trigger} onChange={(trigger) => onChange({ trigger })} />
        <CheckboxField label="失控 / 多巴胺泄漏" checked={draft.isDopamineLeak} onChange={(isDopamineLeak) => onChange({ isDopamineLeak })} />
      </>
    )
  }

  return (
    <>
      <TextField label="资产名称" value={draft.assetName} onChange={(assetName) => onChange({ assetName })} />
      <SelectField label="方向" value={draft.direction} onChange={(direction) => onChange({ direction: direction as RecordDraft['direction'] })} options={['increase', 'decrease']} />
      <SelectField label="资产类型" value={draft.assetType} onChange={(assetType) => onChange({ assetType: assetType as RecordDraft['assetType'] })} options={['cash', 'saving', 'investment', 'crypto', 'device', 'other']} />
    </>
  )
}

/* ── Form Field Components ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-[color:var(--text-muted)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} className={inputClass} />
    </Field>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-3 text-sm text-[color:var(--text-secondary)]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}

function ConfigField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} type="number" className={inputClass} />
    </Field>
  )
}

const inputClass =
  'w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]'

/* ── Helpers ── */

function createDraft(type: WealthRecordType = 'real_income'): RecordDraft {
  return {
    date: today,
    type,
    amount: '',
    source: '',
    category: '',
    title: '',
    note: '',
    cycle: 'monthly',
    isRigid: false,
    cancelDifficulty: '',
    stabilityScore: '',
    laborDependencyScore: '',
    systemType: 'other',
    financeType: 'other',
    necessity: 'necessary',
    trigger: '',
    isDopamineLeak: false,
    assetName: '',
    assetType: 'cash',
    direction: 'increase'
  }
}

function buildTitle(draft: RecordDraft): string | undefined {
  if (draft.type === 'asset_change') {
    return draft.assetName.trim() || undefined
  }
  return draft.title.trim() || draft.source.trim() || draft.category.trim() || undefined
}

function buildMeta(draft: RecordDraft): WealthRecord['meta'] {
  if (draft.type === 'passive_income') {
    return {
      stabilityScore: optionalNumber(draft.stabilityScore),
      laborDependencyScore: optionalNumber(draft.laborDependencyScore)
    }
  }
  if (draft.type === 'system_income') {
    return { systemType: draft.systemType }
  }
  if (draft.type === 'stable_finance') {
    return { financeType: draft.financeType }
  }
  if (draft.type === 'real_expense') {
    return { necessity: draft.necessity }
  }
  if (draft.type === 'ongoing_cost') {
    return {
      cycle: draft.cycle,
      isRigid: draft.isRigid,
      cancelDifficulty: optionalNumber(draft.cancelDifficulty)
    }
  }
  if (draft.type === 'experience_cost') {
    return {
      trigger: draft.trigger.trim() || undefined,
      isDopamineLeak: draft.isDopamineLeak
    }
  }
  if (draft.type === 'asset_change') {
    return {
      assetType: draft.assetType,
      direction: draft.direction
    }
  }
  return {}
}

function optionalNumber(value: string): number | undefined {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0
  }).format(value)
}

export const wealthStorageLocation = wealthRecordsStorageKey
