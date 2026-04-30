import type { TimeDebtPlan } from '../timeDebtPlansStorage'
import type { CalendarBlock, CalendarDragPreview } from './calendarTypes'
import { formatPreviewRange, previewDeltaMinutes } from './calendarDragPreviewUtils'
import { calendarStatusLabel, formatTimeOnly } from './CalendarEventBlock'

export function CalendarEventDetailPanel({
  block,
  dragPreview,
  timerNow,
  onDelete,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer
}: {
  block: CalendarBlock | null
  dragPreview: CalendarDragPreview
  timerNow: number
  onDelete: (logId: string) => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: () => void
}) {
  if (!block) {
    return (
      <aside className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Detail</div>
        <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">时间块详情</h3>
        <p className="mt-4 rounded-2xl border border-dashed border-[color:var(--panel-border)] p-4 text-sm text-[color:var(--text-muted)]">点击日历中的时间块查看详情。</p>
      </aside>
    )
  }
  const canStart = block.plan ? canStartPlan(block.plan, timerNow) : false
  const activePreview = dragPreview?.blockId === block.id ? dragPreview : null
  const plannedRange = block.plan ? `${formatDateTimeReadable(block.plan.plannedStartTime)} - ${formatTimeOnly(block.plan.plannedEndTime)}` : ''
  const actualStart = block.log?.startTime ?? block.plan?.actualStartTime ?? (block.status === 'active' || block.status === 'completed' ? block.startTime : '')
  const actualEnd = block.log?.endTime ?? block.plan?.actualEndTime ?? (block.status === 'completed' ? block.endTime : '')
  return (
    <aside className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{activePreview ? 'Adjusting' : calendarStatusLabel(block.status)}</div>
      <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{block.title}</h3>
      {activePreview ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
          <div className="font-semibold text-[color:var(--text-primary)]">调整中</div>
          <div>原时间段：{formatTimeOnly(block.startTime)} - {formatTimeOnly(block.endTime)}</div>
          <div>预览时间段：{formatPreviewRange(activePreview)}</div>
          <div>变化量：{formatSignedMinutes(previewDeltaMinutes(activePreview))}</div>
          <div className="mt-1 text-[color:var(--text-muted)]">本轮仅预览，不保存真实数据。</div>
        </div>
      ) : null}
      <div className="mt-4 space-y-3 text-sm">
        <DetailRow label="状态" value={calendarStatusLabel(block.status)} />
        <DetailRow label="一级分类" value={block.primaryCategory} />
        <DetailRow label="二级项目" value={block.secondaryProject} />
        {block.plan ? <DetailRow label="计划时间" value={plannedRange} /> : null}
        {block.status === 'planned' && block.plan ? <DetailRow label="距离开始" value={formatDistanceToStart(block.plan.plannedStartTime, timerNow)} /> : null}
        {block.status === 'active' ? <DetailRow label="实际开始" value={formatDateTimeReadable(actualStart)} /> : null}
        {block.status === 'completed' ? <DetailRow label="实际开始" value={formatDateTimeReadable(actualStart)} /> : null}
        {block.status === 'completed' ? <DetailRow label="实际结束" value={formatDateTimeReadable(actualEnd)} /> : null}
        {!block.plan && block.status !== 'active' && block.status !== 'completed' ? <DetailRow label="开始时间" value={formatDateTimeReadable(block.startTime)} /> : null}
        {!block.plan && block.status !== 'active' && block.status !== 'completed' ? <DetailRow label="结束时间" value={formatDateTimeReadable(block.endTime)} /> : null}
        <DetailRow label={block.status === 'active' ? '当前已计时' : '实际时长'} value={formatMinutes(block.durationMinutes)} />
        <DetailRow label="AI 赋能比例" value={typeof block.aiEnableRatio === 'number' ? `${block.aiEnableRatio}%` : '待补'} />
        <DetailRow label="状态分" value={typeof block.statusScore === 'number' ? String(block.statusScore) : '待补'} />
        <DetailRow label="标签" value={block.tags?.length ? block.tags.join(' / ') : '无'} />
        <DetailRow label="干扰源" value={block.distractionSource || '无'} />
        {block.plan ? <DetailRow label="Reminder" value={block.status === 'active' ? '任务正在执行' : planReminderDetail(block.plan, timerNow)} /> : null}
        <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
          <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{block.log ? '结果记录' : '备注'}</div>
          {block.note || '无'}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {block.plan && (block.status === 'planned' || block.status === 'missed') ? (
            <>
              <button type="button" disabled={!canStart} onClick={() => onStartPlan(block.plan as TimeDebtPlan)} className={`${canStart ? primaryButtonClass : buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}>
                {block.status === 'missed' ? '现在开始' : '开始计时'}
              </button>
              {block.status === 'missed' ? (
                <>
                  <button type="button" onClick={() => onConvertPlanToManual(block.plan as TimeDebtPlan)} className={buttonClass}>转为补记</button>
                  <button type="button" onClick={() => onAbandonPlan((block.plan as TimeDebtPlan).id)} className={buttonClass}>忽略</button>
                </>
              ) : null}
            </>
          ) : null}
          {block.status === 'active' ? <button type="button" onClick={onFinishTimer} className={primaryButtonClass}>结束计时</button> : null}
          {block.log ? <button type="button" onClick={() => onDelete(block.log?.id ?? block.id)} className={buttonClass}>删除日志</button> : null}
        </div>
      </div>
    </aside>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[color:var(--panel-border)] pb-2 text-xs">
      <span className="text-[color:var(--text-muted)]">{label}</span>
      <span className="text-right text-[color:var(--text-primary)]">{value}</span>
    </div>
  )
}

function canStartPlan(plan: TimeDebtPlan, nowMs: number): boolean {
  const start = new Date(plan.plannedStartTime).getTime()
  const end = new Date(plan.plannedEndTime).getTime()
  return nowMs >= start || nowMs > end
}

function planReminderDetail(plan: TimeDebtPlan, nowMs: number): string {
  const start = new Date(plan.plannedStartTime).getTime()
  const end = new Date(plan.plannedEndTime).getTime()
  if (nowMs > end) return `计划已过 ${formatRelativeMinutes(nowMs - end)}。`
  if (nowMs >= start) return '计划时间已到，可以开始计时。'
  return `距离开始还有 ${formatRelativeMinutes(start - nowMs)}。`
}

function formatDistanceToStart(plannedStartTime: string, nowMs: number): string {
  const start = new Date(plannedStartTime).getTime()
  if (!Number.isFinite(start)) return '待补'
  if (nowMs >= start) return '已到开始时间'
  return formatRelativeMinutes(start - nowMs)
}

function formatRelativeMinutes(milliseconds: number): string {
  const totalMinutes = Math.max(1, Math.round(Math.abs(milliseconds) / 60000))
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours} 小时 ${minutes} 分钟` : `${hours} 小时`
  }
  return `${totalMinutes} 分钟`
}

function formatDateTimeReadable(value: string): string {
  if (!value) return '待补'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${formatTimeOnly(value)}`
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest > 0 ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`
  }
  return `${minutes} 分钟`
}

function formatSignedMinutes(minutes: number): string {
  if (minutes === 0) return '0 min'
  return `${minutes > 0 ? '+' : '-'}${Math.abs(minutes)} min`
}

const buttonClass = 'rounded-full border border-[color:var(--panel-border)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:text-[color:var(--text-primary)]'
const primaryButtonClass = 'rounded-full border border-[color:var(--node-selected-border)] bg-[var(--node-selected-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--node-selected-border)]'
