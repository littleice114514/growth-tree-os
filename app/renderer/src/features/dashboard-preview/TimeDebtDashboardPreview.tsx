import {
  ActionSuggestionCard,
  CapsuleProgressBar,
  MetricCard,
  MiniTrendStrip,
  PreviewShell,
  StackedRatioBar,
  StatusCard,
  TugOfWarBar
} from './DashboardPreviewComponents'
import { timeDebtMock } from './dashboardPreviewData'

export function TimeDebtDashboardPreview() {
  const workMax = Math.max(timeDebtMock.actualWorkMinutes, timeDebtMock.standardWorkMinutes)
  return (
    <PreviewShell
      eyebrow="time debt preview"
      title="Time Debt Dashboard Preview"
      description="先用 mock 数据看时间负债仪表盘的产品形态：状态、结构、对抗和下一步动作。"
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <StatusCard title="今日时间状态" status={timeDebtMock.status} diagnosis={timeDebtMock.diagnosis} suggestion={timeDebtMock.suggestion} tone="warn" />

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="工时差额" value={`+${timeDebtMock.workMinuteDelta} min`} detail="实际工作时长超过今日标准" tone="warn" />
          <MetricCard label="净时间价值" value={`${timeDebtMock.netTimeValue}`} detail="高消耗低回流信号" tone="bad" />
          <MetricCard label="AI 杠杆率" value={`${Math.round(timeDebtMock.aiEnableRatio * 100)}%`} detail="仍有自动化空间" tone="info" />
          <MetricCard label="任务数量" value={`${timeDebtMock.topTasks.length}`} detail="只展示最高影响任务" />
        </div>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">标准工时 vs 实际工时</div>
          <div className="space-y-4">
            <CapsuleProgressBar label="标准工时" value={timeDebtMock.standardWorkMinutes} max={workMax} tone="good" />
            <CapsuleProgressBar label="实际工时" value={timeDebtMock.actualWorkMinutes} max={workMax} tone="warn" />
          </div>
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">时间结构</div>
          <StackedRatioBar
            items={timeDebtMock.timeStructure.map((item, index) => ({
              label: item.label,
              value: item.minutes,
              color: ['bg-cyan-300/80', 'bg-emerald-300/80', 'bg-sky-300/75', 'bg-lime-300/75', 'bg-rose-300/70'][index] ?? 'bg-slate-300/70'
            }))}
          />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">时间负债对抗</div>
          <TugOfWarBar leftLabel="负债" leftValue={timeDebtMock.debtValue} rightLabel="滋养" rightValue={timeDebtMock.nourishmentValue} />
          <ActionSuggestionCard title="明日动作" body="先压低低回流工作时长，再给身体和复盘留出恢复窗口。" />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">最近 7 天趋势</div>
          <MiniTrendStrip values={timeDebtMock.trend7d} />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4 xl:col-span-2">
          <div className="mb-3 text-sm font-semibold text-[color:var(--text-primary)]">效率与 AI 杠杆</div>
          <div className="grid gap-3 md:grid-cols-3">
            {timeDebtMock.topTasks.map((task) => (
              <div key={task.title} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <div className="text-sm font-medium text-[color:var(--text-primary)]">{task.title}</div>
                <div className="mt-2 text-xs leading-5 text-[color:var(--text-secondary)]">
                  {task.duration} min / {task.efficiency} / 状态 {task.statusScore}
                </div>
                <CapsuleProgressBar label="AI 杠杆" value={task.aiRatio * 100} max={100} tone={task.aiRatio > 0.5 ? 'good' : 'info'} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </PreviewShell>
  )
}
