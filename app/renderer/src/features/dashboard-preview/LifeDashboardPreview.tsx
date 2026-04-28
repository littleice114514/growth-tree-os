import { ActionSuggestionCard, MetricCard, PreviewShell, StatusCard } from './DashboardPreviewComponents'
import { lifeDashboardMock } from './dashboardPreviewData'

export function LifeDashboardPreview() {
  return (
    <main className="min-h-0 flex-1 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
        <PreviewShell
          eyebrow="life operating dashboard"
          title="Life Dashboard Preview"
          description="Life Dashboard 目前为 Preview，占位用于后续接入真实 Time Debt + Wealth 数据。"
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <StatusCard
              title="综合状态"
              status={lifeDashboardMock.systemStatus}
              diagnosis={lifeDashboardMock.coreContradiction}
              suggestion={lifeDashboardMock.nextAction}
              tone="warn"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="时间轴状态" value={lifeDashboardMock.timeAxis} detail="来自 Time Debt Preview" tone="bad" />
              <MetricCard label="财富轴状态" value={lifeDashboardMock.wealthAxis} detail="来自 Wealth Preview" tone="warn" />
              <MetricCard label="当前阶段" value="Preview" detail="暂不做四象限真实计算" tone="info" />
              <MetricCard label="数据来源" value="Mock" detail="后续接 records/store" />
            </div>
            <div className="xl:col-span-2">
              <ActionSuggestionCard title="今日关键矛盾 / 下一步动作" body={`${lifeDashboardMock.coreContradiction} ${lifeDashboardMock.nextAction}`} />
            </div>
          </div>
        </PreviewShell>
      </div>
    </main>
  )
}
