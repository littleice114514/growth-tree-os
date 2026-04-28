import {
  ActionSuggestionCard,
  CapsuleProgressBar,
  MetricCard,
  PreviewShell,
  StatusCard
} from './DashboardPreviewComponents'
import type { TimeDebtOverview } from '@shared/timeDebt'
import { InteractiveStackedBar } from '@/components/charts/InteractiveStackedBar'

export function TimeDebtDashboardPreview({ overview }: { overview: TimeDebtOverview }) {
  const workMax = Math.max(overview.actualWorkMinutes, overview.standardWorkMinutes, 1)
  const hasTodayLogs = overview.totalMinutes > 0
  const statusTone = overview.status === 'debt' ? 'bad' : overview.status === 'warning' ? 'warn' : overview.status === 'healthy' ? 'good' : 'info'

  return (
    <PreviewShell
      eyebrow="time debt preview"
      title="Time Debt Overview"
      description="基于本地时间日志、标准工时和负债参数生成今日时间结构，不再使用今日 mock 数据。"
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <StatusCard title="今日时间状态" status={overview.statusLabel} diagnosis={overview.diagnosis} suggestion={overview.nextAction} tone={statusTone} />

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="总记录时间" value={formatMinutes(overview.totalMinutes)} detail={hasTodayLogs ? '来自今日时间日志' : '今日暂无时间日志'} tone={hasTodayLogs ? 'neutral' : 'info'} />
          <MetricCard label="工时差额" value={formatSignedMinutes(overview.workDeltaMinutes)} detail="实际工时 - 标准工时" tone={overview.workDeltaMinutes > 0 ? 'warn' : 'info'} />
          <MetricCard label="净时间价值" value={formatNumber(overview.netTimeValue)} detail="沿用 Time Debt V1 价值规则" tone={overview.netTimeValue >= 0 ? 'good' : 'bad'} />
          <MetricCard label="今日日志" value={`${overview.stats.totalLogs}`} detail="本地 localStorage 聚合" />
        </div>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">标准工时 vs 实际工时</div>
          <div className="space-y-4">
            <CapsuleProgressBar label="标准工时" value={overview.standardWorkMinutes} max={workMax} tone="good" />
            <CapsuleProgressBar label="实际工时" value={overview.actualWorkMinutes} max={workMax} tone={overview.actualWorkMinutes > overview.standardWorkMinutes ? 'warn' : 'info'} />
          </div>
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">时间结构</div>
          <InteractiveStackedBar segments={hasTodayLogs ? overview.timeStructureSegments : []} />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">时间负债对抗</div>
          <InteractiveStackedBar segments={hasTodayLogs ? overview.battleSegments : []} compact />
          <ActionSuggestionCard title={hasTodayLogs ? '下一步动作' : '空状态提示'} body={hasTodayLogs ? overview.nextAction : '先记录一条时间块，系统会自动生成时间结构。'} />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">最近 7 天趋势</div>
          <EmptyPreview text="7 日趋势需要按日期聚合 logs，本轮先接今日 Overview 真实数据。" />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4 xl:col-span-2">
          <div className="mb-3 text-sm font-semibold text-[color:var(--text-primary)]">效率与 AI 杠杆</div>
          <EmptyPreview text="Top tasks 需要独立 selector 按影响排序，本轮不继续使用 mock 任务。" />
        </section>
      </div>
    </PreviewShell>
  )
}

function EmptyPreview({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[color:var(--panel-border)] bg-black/10 p-4 text-sm leading-6 text-[color:var(--text-muted)]">{text}</div>
}

function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)} min`
}

function formatSignedMinutes(minutes: number): string {
  return `${minutes >= 0 ? '+' : ''}${Math.round(minutes)} min`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2
  }).format(value)
}
