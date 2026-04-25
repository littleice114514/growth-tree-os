import {
  calculateDailyWealthSnapshot,
  wealthStatusLabels,
  type DailyWealthSnapshot,
  type DailyWealthSnapshotInput,
  type WealthStatus
} from '@shared/wealth'

const demoInput: DailyWealthSnapshotInput = {
  date: '2026-04-25',
  openingBalance: 42860,
  closingBalance: 43180,
  realIncomeToday: 960,
  passiveIncomeToday: 42,
  systemIncomeToday: 128,
  stableFinanceToday: 18,
  realExpensesToday: 360,
  ongoingCostToday: 118,
  experienceCostToday: 210,
  emergencyCostToday: 0,
  dailySafeLine: 260,
  monthlyRemainingDisposable: 4160,
  remainingDaysInMonth: 16,
  savingPoolBefore: 860,
  realityStandard: 9200,
  deservedStandard: 14800,
  monthlyGap: 5600,
  laborDependency: 0.72,
  supportCoverage: 0.19,
  consecutiveOverdraftDays: 0
}

const snapshot = calculateDailyWealthSnapshot(demoInput)

const statusTone: Record<WealthStatus, string> = {
  growth: 'border-emerald-400/25 bg-emerald-400/10 text-accent-green',
  balanced: 'border-cyan-400/25 bg-cyan-400/10 text-accent-cyan',
  light_overdraft: 'border-amber-400/25 bg-amber-400/10 text-accent-amber',
  future_money_burning: 'border-rose-400/25 bg-rose-400/10 text-accent-rose',
  system_risk: 'border-rose-400/30 bg-rose-500/15 text-accent-rose'
}

export function WealthDashboard() {
  const totalIncome = getTotalIncome(snapshot)
  const totalExpenses = getTotalExpenses(snapshot)
  const behaviorCashFlow = totalIncome - totalExpenses
  const passiveIncome = snapshot.passiveIncomeToday + snapshot.systemIncomeToday + snapshot.stableFinanceToday
  const investStatus = resolveInvestStatus(snapshot)
  const burnStatus = resolveBurnStatus(snapshot)

  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <section className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--panel-border)] pb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Wealth Dashboard</div>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">个人财富操作系统</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--text-secondary)]">
              以自由度、未来钱消耗和投资池为核心，不把财富模块降级成普通记账页。
            </p>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${statusTone[snapshot.status]}`}>
            <div className="text-xs uppercase tracking-[0.18em] opacity-75">今日状态</div>
            <div className="mt-1 text-xl font-semibold">{wealthStatusLabels[snapshot.status]}</div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel title="今日财富状态卡" eyebrow={snapshot.date}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="账户变化" value={formatMoney(snapshot.accountDelta)} tone={snapshot.accountDelta >= 0 ? 'good' : 'bad'} />
              <Metric label="今日收入" value={formatMoney(totalIncome)} />
              <Metric label="今日支出" value={formatMoney(totalExpenses)} />
              <Metric label="财富评分" value={`${snapshot.wealthScore}`} tone={snapshot.wealthScore >= 70 ? 'good' : 'warn'} />
              <Metric label="可投资结余" value={formatMoney(snapshot.investableSurplus)} tone="good" />
              <Metric label="未来钱消耗" value={formatMoney(snapshot.futureMoneyUsed)} tone={snapshot.futureMoneyUsed > 0 ? 'bad' : 'good'} />
              <Metric label="自由度净变化" value={formatMoney(snapshot.freedomDelta)} tone={snapshot.freedomDelta >= 0 ? 'good' : 'bad'} />
              <Metric label="支撑覆盖率" value={formatPercent(snapshot.supportCoverage)} />
            </div>
            <div className="mt-5 rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">一句话诊断</div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{snapshot.diagnosis}</p>
              <p className="mt-2 text-sm font-medium text-[color:var(--text-primary)]">{snapshot.priorityAction}</p>
            </div>
          </Panel>

          <Panel title="账户变化卡" eyebrow="Account Delta">
            <div className="space-y-3">
              <LineItem label="今日开始余额" value={formatMoney(snapshot.openingBalance)} />
              <LineItem label="今日结束余额" value={formatMoney(snapshot.closingBalance)} />
              <LineItem label="今日账户变化" value={formatMoney(snapshot.accountDelta)} />
              <LineItem label="行为现金流" value={formatMoney(behaviorCashFlow)} />
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Panel title="额度燃烧卡" eyebrow="Allowance Burn">
            <LineItem label="动态每日额度" value={formatMoney(snapshot.dynamicDailyAllowance)} />
            <LineItem label="今日超额支出" value={formatMoney(snapshot.todayOverspend)} />
            <LineItem label="本月剩余额度" value={formatMoney(demoInput.monthlyRemainingDisposable ?? 0)} />
            <LineItem label="消费速度状态" value={burnStatus} />
          </Panel>

          <Panel title="未来钱判断卡" eyebrow="Future Money">
            <LineItem label="节省池开始值" value={formatMoney(snapshot.savingPoolBefore)} />
            <LineItem label="节省池结束值" value={formatMoney(snapshot.savingPoolAfter)} />
            <LineItem label="未来钱消耗" value={formatMoney(snapshot.futureMoneyUsed)} />
            <LineItem label="补回建议" value={snapshot.futureMoneyUsed > 0 ? '先补未来钱，再恢复投资池' : '无需补回，维持额度纪律'} />
          </Panel>

          <Panel title="投资池卡" eyebrow="Investable Pool">
            <LineItem label="今日可投资结余" value={formatMoney(snapshot.investableSurplus)} />
            <LineItem label="本月累计可投资结余" value="待补充" />
            <LineItem label="投资状态" value={investStatus} />
            <LineItem label="入池规则" value="先扣未来钱，再看结余" />
          </Panel>

          <Panel title="持续流血卡" eyebrow="Ongoing Cost">
            <LineItem label="今日持续流血" value={formatMoney(snapshot.ongoingCostToday)} />
            <LineItem label="月固定流血占位" value="待补充" />
            <LineItem label="可砍项占位" value="待接入 Plan" />
            <LineItem label="风险线" value={snapshot.status === 'system_risk' ? '需要立刻处理' : '未触发系统风险'} />
          </Panel>

          <Panel title="睡后收入卡" eyebrow="After-Sleep Income">
            <LineItem label="今日睡后收入" value={formatMoney(passiveIncome)} />
            <LineItem label="系统收入" value={formatMoney(snapshot.systemIncomeToday)} />
            <LineItem label="稳定理财收入" value={formatMoney(snapshot.stableFinanceToday)} />
            <LineItem label="支撑覆盖率" value={formatPercent(snapshot.supportCoverage)} />
          </Panel>

          <Panel title="双轨标准卡" eyebrow="Dual Standard">
            <LineItem label="Reality Standard" value={formatMoney(snapshot.realityStandard)} />
            <LineItem label="Deserved Standard" value={formatMoney(snapshot.deservedStandard)} />
            <LineItem label="Monthly Gap" value={formatMoney(snapshot.monthlyGap)} />
            <LineItem label="Labor Dependency" value={formatPercent(snapshot.laborDependency)} />
            <LineItem label="Support Coverage" value={formatPercent(snapshot.supportCoverage)} />
            <p className="mt-4 text-sm leading-6 text-[color:var(--text-secondary)]">
              如果 Reality Standard 高，但 Deserved Standard 低，说明当前不是没钱，而是自由度不足。
            </p>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <SummarySlot title="Review 摘要占位" value="待接入每日复盘" detail="后续从 review 记录中提取财富诊断证据。" />
          <SummarySlot title="Plan 摘要占位" value="待接入砍项计划" detail="后续把持续流血和补回建议转成计划项。" />
          <SummarySlot title="Home 摘要占位" value="待接入首页总览" detail="后续给 Home 提供今日状态、评分和优先行动。" />
        </section>
      </div>
    </main>
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{eyebrow}</div>
          <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{title}</h3>
        </div>
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

function SummarySlot({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <section className="rounded-[18px] border border-dashed border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-4">
      <div className="text-sm font-semibold text-[color:var(--text-primary)]">{title}</div>
      <div className="mt-2 text-sm text-accent-cyan">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{detail}</p>
    </section>
  )
}

function getTotalIncome(item: DailyWealthSnapshot): number {
  return item.realIncomeToday + item.passiveIncomeToday + item.systemIncomeToday + item.stableFinanceToday
}

function getTotalExpenses(item: DailyWealthSnapshot): number {
  return item.realExpensesToday + item.ongoingCostToday + item.experienceCostToday + item.emergencyCostToday
}

function resolveInvestStatus(item: DailyWealthSnapshot): string {
  if (item.futureMoneyUsed > 0 || item.status === 'system_risk') {
    return '禁止'
  }
  if (item.investableSurplus <= 0) {
    return '暂缓'
  }
  return '可投'
}

function resolveBurnStatus(item: DailyWealthSnapshot): string {
  if (item.todayOverspend <= 0) {
    return '额度内'
  }
  if (item.futureMoneyUsed <= 0) {
    return '消耗节省池'
  }
  return '动用未来钱'
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
