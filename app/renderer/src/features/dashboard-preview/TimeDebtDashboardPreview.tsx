import {
  ActionSuggestionCard,
  CapsuleProgressBar,
  MetricCard,
  MiniTrendStrip,
  PreviewShell,
  StatusCard
} from './DashboardPreviewComponents'
import { InteractiveStackedBar, type StackedBarSegment } from '@/components/charts/InteractiveStackedBar'
import { timeDebtMock } from './dashboardPreviewData'

const timeStructureMeta: Record<string, Pick<StackedBarSegment, 'colorClass' | 'description'>> = {
  工作: {
    colorClass: 'bg-cyan-300/80',
    description: '投入到生产性任务的时间'
  },
  学习: {
    colorClass: 'bg-emerald-300/80',
    description: '用于能力增长的时间'
  },
  生活: {
    colorClass: 'bg-sky-300/75',
    description: '生活维护与必要事务'
  },
  运动: {
    colorClass: 'bg-lime-300/75',
    description: '身体恢复与能量补给'
  },
  空转: {
    colorClass: 'bg-slate-300/70',
    description: '低回流或无明确收益时间'
  }
}

export function TimeDebtDashboardPreview() {
  const workMax = Math.max(timeDebtMock.actualWorkMinutes, timeDebtMock.standardWorkMinutes)
  const timeStructureSegments: StackedBarSegment[] = timeDebtMock.timeStructure.map((item) => {
    const meta = timeStructureMeta[item.label] ?? {
      colorClass: 'bg-slate-300/70',
      description: '时间结构中的其他部分'
    }
    return {
      id: item.label,
      label: item.label,
      value: item.minutes,
      unit: 'min',
      colorClass: meta.colorClass,
      description: meta.description
    }
  })
  const timeDebtBattleSegments: StackedBarSegment[] = [
    {
      id: 'debt',
      label: '负债',
      value: timeDebtMock.debtValue,
      unit: 'min',
      colorClass: 'bg-rose-300/75',
      description: '超过承受线或低回流消耗'
    },
    {
      id: 'nourishment',
      label: '滋养',
      value: timeDebtMock.nourishmentValue,
      unit: 'min',
      colorClass: 'bg-emerald-300/75',
      description: '恢复精力或产生长期价值的时间'
    }
  ]

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
          <InteractiveStackedBar segments={timeStructureSegments} />
        </section>

        <section className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
          <div className="mb-4 text-sm font-semibold text-[color:var(--text-primary)]">时间负债对抗</div>
          <InteractiveStackedBar segments={timeDebtBattleSegments} compact />
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
