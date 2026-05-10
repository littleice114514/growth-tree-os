import {
  ActionSuggestionCard,
  CapsuleProgressBar,
  MetricCard,
  PreviewShell,
  StatusCard
} from './DashboardPreviewComponents'
import { InteractiveStackedBar, type StackedBarSegment } from '@/components/charts/InteractiveStackedBar'
import { wealthMock } from './dashboardPreviewData'
import { wealthStatusLabels, type DailyWealthSnapshot, type WealthRecordSummary } from '@shared/wealth'

const cashFlowQualityMeta: Record<string, Pick<StackedBarSegment, 'colorClass' | 'description'>> = {
  现实收入: {
    colorClass: 'bg-emerald-300/80',
    description: '来自现实劳动或当日确定到账的收入'
  },
  睡后收入: {
    colorClass: 'bg-lime-300/80',
    description: '不直接依赖当下劳动的收入回流'
  },
  系统收入: {
    colorClass: 'bg-cyan-300/80',
    description: '由内容、软件、自动化或项目系统带来的收入'
  },
  真实支出: {
    colorClass: 'bg-amber-300/75',
    description: '当日现实生活中的必要或普通支出'
  },
  持续出血: {
    colorClass: 'bg-rose-300/65',
    description: '订阅、固定压力或不易取消的持续消耗'
  },
  体验出血: {
    colorClass: 'bg-fuchsia-300/65',
    description: '为了短期刺激、体验或状态补偿产生的消耗'
  }
}

type WealthPreviewData = {
  status: string
  diagnosis: string
  suggestion: string
  accountDelta: number
  incomeToday: number
  expenseToday: number
  investableSurplus: number
  futureMoneyUsed: number
  savingPoolBefore: number
  savingPoolAfter: number
  ongoingCostToday: number
  passiveIncomeToday: number
  supportCoverage: number
  laborDependency: number
  upgradeGate: string
  cashFlowQuality: { label: string; value: number }[]
}

function snapshotToPreviewData(snapshot: DailyWealthSnapshot, summary: WealthRecordSummary): WealthPreviewData {
  return {
    status: wealthStatusLabels[snapshot.status],
    diagnosis: snapshot.diagnosis,
    suggestion: snapshot.priorityAction,
    accountDelta: snapshot.accountDelta,
    incomeToday: snapshot.realIncomeToday + snapshot.passiveIncomeToday + snapshot.systemIncomeToday + snapshot.stableFinanceToday,
    expenseToday: snapshot.realExpensesToday + snapshot.ongoingCostToday + snapshot.experienceCostToday,
    investableSurplus: snapshot.investableSurplus,
    futureMoneyUsed: snapshot.futureMoneyUsed,
    savingPoolBefore: snapshot.savingPoolBefore,
    savingPoolAfter: snapshot.savingPoolAfter,
    ongoingCostToday: snapshot.ongoingCostToday,
    passiveIncomeToday: snapshot.passiveIncomeToday,
    supportCoverage: snapshot.supportCoverage,
    laborDependency: snapshot.laborDependency,
    upgradeGate: snapshot.status === 'growth' ? '通过' : '暂缓',
    cashFlowQuality: [
      { label: '现实收入', value: summary.realIncome },
      { label: '睡后收入', value: summary.passiveIncome },
      { label: '系统收入', value: summary.systemIncome },
      { label: '真实支出', value: summary.realExpense },
      { label: '持续出血', value: summary.ongoingCost },
      { label: '体验出血', value: summary.experienceCost }
    ]
  }
}

export function WealthDashboardPreview({ snapshot, summary }: { snapshot?: DailyWealthSnapshot; summary?: WealthRecordSummary }) {
  const data: WealthPreviewData = snapshot && summary ? snapshotToPreviewData(snapshot, summary) : wealthMock

  const cashFlowQualitySegments: StackedBarSegment[] = data.cashFlowQuality.map((item) => {
    const meta = cashFlowQualityMeta[item.label] ?? {
      colorClass: 'bg-slate-300/70',
      description: '现金流质量中的其他部分'
    }
    return {
      id: item.label,
      label: item.label,
      value: item.value,
      unit: '¥',
      colorClass: meta.colorClass,
      description: meta.description
    }
  })

  return (
    <PreviewShell
      eyebrow="wealth preview"
      title="Wealth Dashboard Preview"
      description={snapshot ? '基于真实 base config 数据展示。' : '先把财富系统做成状态判断页，而不是普通记账页；mock 数据只用于看页面质感。'}
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <StatusCard title="今日财富状态" status={data.status} diagnosis={data.diagnosis} suggestion={data.suggestion} tone="warn" />

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="账户变化" value={`¥${data.accountDelta}`} detail="今日现金流轻微下压" tone="bad" />
          <MetricCard label="未来钱消耗" value={`¥${data.futureMoneyUsed}`} detail="未触发系统风险" tone="warn" />
          <MetricCard label="可投资结余" value={`¥${data.investableSurplus}`} detail="今日暂不扩大投入" />
          <MetricCard label="升级资格" value={data.upgradeGate} detail="先补回节省池" tone="info" />
        </div>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">现金流质量</div>
          <InteractiveStackedBar segments={cashFlowQualitySegments} />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">节省池 / 未来钱判断</div>
          <div className="space-y-4">
            <CapsuleProgressBar label="节省池消耗后" value={data.savingPoolAfter} max={data.savingPoolBefore || 1} tone="warn" />
            <CapsuleProgressBar label="未来钱使用" value={data.futureMoneyUsed} max={100} tone="bad" />
          </div>
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">持续流血</div>
          <MetricCard label="今日持续流血" value={`¥${data.ongoingCostToday}`} detail="订阅 / 固定压力先进入观察" tone="warn" />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">睡后收入覆盖</div>
          <CapsuleProgressBar label="覆盖率" value={data.supportCoverage * 100} max={100} tone="info" />
          <div className="mt-3 text-xs text-[color:var(--text-secondary)]">
            睡后收入 ¥{data.passiveIncomeToday} / 劳动依赖 {Math.round(data.laborDependency * 100)}%
          </div>
        </section>

        <div className="xl:col-span-2">
          <ActionSuggestionCard title="财富下一步动作" body={data.suggestion} />
        </div>
      </div>
    </PreviewShell>
  )
}
