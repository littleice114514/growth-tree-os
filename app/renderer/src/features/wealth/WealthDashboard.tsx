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
import { WealthDashboardPreview } from '@/features/dashboard-preview'

type WealthView = 'overview' | 'income' | 'expenses' | 'assets' | 'evaluation'
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

const viewLabels: Record<WealthView, string> = {
  overview: 'Overview',
  income: 'Income',
  expenses: 'Expenses',
  assets: 'Assets',
  evaluation: 'Evaluation'
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

const incomeTypes: WealthRecordType[] = ['real_income', 'passive_income', 'system_income', 'stable_finance']
const expenseTypes: WealthRecordType[] = ['real_expense', 'ongoing_cost', 'experience_cost']

const statusTone: Record<WealthStatus, string> = {
  growth: 'border-emerald-400/25 bg-emerald-400/10 text-accent-green',
  balanced: 'border-cyan-400/25 bg-cyan-400/10 text-accent-cyan',
  light_overdraft: 'border-amber-400/25 bg-amber-400/10 text-accent-amber',
  future_money_burning: 'border-rose-400/25 bg-rose-400/10 text-accent-rose',
  system_risk: 'border-rose-400/30 bg-rose-500/15 text-accent-rose'
}

export function WealthDashboard() {
  const [records, setRecords] = useState<WealthRecord[]>(() => loadWealthRecords())
  const [baseConfig, setBaseConfig] = useState<WealthBaseConfig>(() => loadWealthBaseConfig())
  const [currentView, setCurrentView] = useState<WealthView>('overview')
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [draft, setDraft] = useState<RecordDraft>(() => createDraft())

  const summary = useMemo(() => summarizeWealthRecords(records, baseConfig.date, baseConfig), [records, baseConfig])
  const snapshot = useMemo(
    () => calculateDailyWealthSnapshot(buildDailyWealthInputFromRecords(records, baseConfig)),
    [records, baseConfig]
  )
  const recentRecords = records.slice(0, 8)

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
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--panel-border)] pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Wealth Dashboard</div>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">个人财富操作系统</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
              以财富事件、持续流血、睡后收入和自由度净变化为核心，不把记录降级成普通记账。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`rounded-2xl border px-4 py-3 ${statusTone[snapshot.status]}`}>
              <div className="text-xs uppercase tracking-[0.18em] opacity-75">今日状态</div>
              <div className="mt-1 text-xl font-semibold">{wealthStatusLabels[snapshot.status]}</div>
            </div>
            <button
              type="button"
              onClick={() => setIsRecorderOpen(true)}
              className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
            >
              新增财富记录
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {(Object.keys(viewLabels) as WealthView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setCurrentView(view)}
              className={
                currentView === view
                  ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-sm text-[color:var(--text-primary)] shadow-[var(--shadow-node-neighbor)]'
                  : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
              }
            >
              {viewLabels[view]}
            </button>
          ))}
        </nav>

        {currentView === 'overview' ? (
          <>
            <WealthDashboardPreview />
            <OverviewView
              snapshot={snapshot}
              summary={summary}
              recentRecords={recentRecords}
              baseConfig={baseConfig}
              onConfigChange={(patch) => setBaseConfig((current) => ({ ...current, ...patch }))}
              onSaveConfig={handleSaveConfig}
              onResetConfig={handleResetConfig}
              onDelete={removeRecord}
            />
          </>
        ) : null}
        {currentView === 'income' ? <IncomeView records={records} /> : null}
        {currentView === 'expenses' ? <ExpensesView records={records} monthlyPressure={summary.monthlyOngoingPressure} /> : null}
        {currentView === 'assets' ? <AssetsView records={records} assetBuckets={summary.assetBuckets} /> : null}
        {currentView === 'evaluation' ? <EvaluationView snapshot={snapshot} summary={summary} /> : null}
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

function OverviewView({
  snapshot,
  summary,
  recentRecords,
  baseConfig,
  onConfigChange,
  onSaveConfig,
  onResetConfig,
  onDelete
}: {
  snapshot: DailyWealthSnapshot
  summary: ReturnType<typeof summarizeWealthRecords>
  recentRecords: WealthRecord[]
  baseConfig: WealthBaseConfig
  onConfigChange: (patch: Partial<WealthBaseConfig>) => void
  onSaveConfig: () => void
  onResetConfig: () => void
  onDelete: (recordId: string) => void
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel title="今日财富状态卡" eyebrow={snapshot.date}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="今日收入" value={formatMoney(summary.totalIncome)} />
          <Metric label="今日支出" value={formatMoney(summary.totalExpense)} />
          <Metric label="自由度净变化" value={formatMoney(summary.freedomDelta)} tone={summary.freedomDelta >= 0 ? 'good' : 'bad'} />
          <Metric label="财富评分" value={`${snapshot.wealthScore}`} tone={snapshot.wealthScore >= 70 ? 'good' : 'warn'} />
          <Metric label="账户变化" value={formatMoney(snapshot.accountDelta)} tone={snapshot.accountDelta >= 0 ? 'good' : 'bad'} />
          <Metric label="可投资结余" value={formatMoney(snapshot.investableSurplus)} tone="good" />
          <Metric label="未来钱消耗" value={formatMoney(snapshot.futureMoneyUsed)} tone={snapshot.futureMoneyUsed > 0 ? 'bad' : 'good'} />
          <Metric label="支撑覆盖率" value={formatPercent(snapshot.supportCoverage)} />
        </div>
        <div className="mt-5 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">一句话诊断</div>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{snapshot.diagnosis}</p>
          <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{snapshot.priorityAction}</p>
        </div>
      </Panel>

      <Panel title="最近财富记录" eyebrow={`${recentRecords.length} recent`}>
        <RecordList records={recentRecords} onDelete={onDelete} />
      </Panel>

      <Panel title="Standards" eyebrow="Reality / Deserved">
        <LineItem label="Reality Standard" value={formatMoney(snapshot.realityStandard)} />
        <LineItem label="Deserved Standard" value={formatMoney(snapshot.deservedStandard)} />
        <LineItem label="Monthly Gap" value={formatMoney(snapshot.monthlyGap)} />
      </Panel>
      <Panel title="Real Summary" eyebrow="Today">
        <LineItem label="现实收入" value={formatMoney(summary.realIncome)} />
        <LineItem label="真实支出" value={formatMoney(summary.realExpense)} />
        <LineItem label="劳动依赖度" value={formatPercent(summary.laborDependency)} />
      </Panel>
      <Panel title="Alternative Self Income" eyebrow="Freedom Sources">
        <LineItem label="睡后收入" value={formatMoney(summary.passiveIncome)} />
        <LineItem label="系统收入" value={formatMoney(summary.systemIncome)} />
        <LineItem label="稳定理财" value={formatMoney(summary.stableFinance)} />
      </Panel>
      <Panel title="Cost Burden" eyebrow="Burn">
        <LineItem label="持续出血" value={formatMoney(summary.ongoingCost)} />
        <LineItem label="体验出血" value={formatMoney(summary.experienceCost)} />
        <LineItem label="月固定流血" value={formatMoney(summary.monthlyOngoingPressure)} />
      </Panel>

      <Panel title="基础配置" eyebrow="Config">
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
      </Panel>
    </div>
  )
}

function IncomeView({ records }: { records: WealthRecord[] }) {
  return (
    <GroupedRecordView
      title="Income"
      groups={incomeTypes}
      records={records}
      emptyText="还没有收入记录。先记录现实收入、睡后收入、系统收入或稳定理财。"
    />
  )
}

function ExpensesView({ records, monthlyPressure }: { records: WealthRecord[]; monthlyPressure: number }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <GroupedRecordView title="Expenses" groups={expenseTypes} records={records} emptyText="还没有支出记录。" />
      <Panel title="支出语义判断" eyebrow="Burden">
        <LineItem label="月固定流血压力" value={formatMoney(monthlyPressure)} />
        <LineItem
          label="持续出血提醒"
          value={monthlyPressure > 0 ? '优先进入 Plan 检查' : '暂无固定压力'}
        />
        <LineItem
          label="体验出血提醒"
          value={records.some((record) => record.type === 'experience_cost' && record.meta?.isDopamineLeak) ? '存在失控 / 多巴胺泄漏' : '未标记失控'}
        />
      </Panel>
    </div>
  )
}

function AssetsView({ records, assetBuckets }: { records: WealthRecord[]; assetBuckets: Record<string, number> }) {
  const assetRecords = records.filter((record) => record.type === 'asset_change')
  const bucketLabels: Record<string, string> = {
    cash: '现金',
    saving: '储蓄',
    investment: '投资',
    crypto: '数字资产',
    device: '设备',
    other: '其他'
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel title="资产变化记录" eyebrow="Assets">
        <RecordList records={assetRecords} />
      </Panel>
      <Panel title="资产分类占位" eyebrow="Buckets">
        {['cash', 'saving', 'investment', 'crypto', 'device', 'other'].map((key) => (
          <LineItem key={key} label={bucketLabels[key]} value={formatMoney(assetBuckets[key] ?? 0)} />
        ))}
      </Panel>
    </div>
  )
}

function EvaluationView({
  snapshot,
  summary
}: {
  snapshot: DailyWealthSnapshot
  summary: ReturnType<typeof summarizeWealthRecords>
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Evaluation" eyebrow="Judgement">
        <LineItem label="Reality Standard" value={formatMoney(snapshot.realityStandard)} />
        <LineItem label="Deserved Standard" value={formatMoney(snapshot.deservedStandard)} />
        <LineItem label="Monthly Gap" value={formatMoney(snapshot.monthlyGap)} />
        <LineItem label="Labor Dependency" value={formatPercent(snapshot.laborDependency)} />
        <LineItem label="Support Coverage" value={formatPercent(snapshot.supportCoverage)} />
        <LineItem label="Freedom Delta" value={formatMoney(summary.freedomDelta)} />
      </Panel>
      <Panel title="指标来源" eyebrow="Record Sources">
        <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
          Reality Standard 由现实收入、真实支出和资产变化辅助判断；Deserved Standard 由睡后收入、系统收入、稳定理财和支撑覆盖率辅助判断。
        </p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
          Labor Dependency 来自现实收入占总收入比例；Support Coverage 来自睡后收入、系统收入、稳定理财对真实支出和持续出血的覆盖。
        </p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
          Freedom Delta 来自睡后收入 + 系统收入 + 稳定理财 - 持续出血 - 体验出血。
        </p>
      </Panel>
    </div>
  )
}

function GroupedRecordView({
  title,
  groups,
  records,
  emptyText
}: {
  title: string
  groups: WealthRecordType[]
  records: WealthRecord[]
  emptyText: string
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groups.map((type) => {
        const groupRecords = records.filter((record) => record.type === type)
        const total = groupRecords.reduce((sum, record) => sum + record.amount, 0)
        return (
          <Panel key={type} title={wealthRecordTypeLabels[type]} eyebrow={title}>
            <LineItem label="小计" value={formatMoney(total)} />
            <RecordList records={groupRecords.slice(0, 6)} emptyText={emptyText} />
          </Panel>
        )
      })}
    </div>
  )
}

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

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{eyebrow}</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const toneClass = {
    neutral: 'text-[color:var(--text-primary)]',
    good: 'text-accent-green',
    warn: 'text-accent-amber',
    bad: 'text-accent-rose'
  }[tone]

  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="text-xs text-[color:var(--text-muted)]">{label}</div>
      <div className={`mt-2 text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  )
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--panel-border)] py-2 last:border-b-0">
      <span className="text-sm text-[color:var(--text-secondary)]">{label}</span>
      <span className="text-right text-sm font-medium text-[color:var(--text-primary)]">{value}</span>
    </div>
  )
}

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

function formatPercent(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(value)
}

export const wealthStorageLocation = wealthRecordsStorageKey
