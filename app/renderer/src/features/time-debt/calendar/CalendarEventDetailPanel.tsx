import { useEffect, useState } from 'react'
import type { TimeDebtPlan } from '../timeDebtPlansStorage'
import type { CalendarBlock, CalendarDragPreview, CalendarResizePreview } from './calendarTypes'
import { calendarStatusLabel, formatTimeOnly } from './CalendarEventBlock'

export function CalendarEventDetailPanel({
  block,
  dragPreview,
  resizePreview,
  timerNow,
  onDelete,
  onStartPlan,
  onConvertPlanToManual,
  onAbandonPlan,
  onFinishTimer,
  onEditTimeRange
}: {
  block: CalendarBlock | null
  dragPreview: CalendarDragPreview
  resizePreview: CalendarResizePreview
  timerNow: number
  onDelete: (logId: string) => void
  onStartPlan: (plan: TimeDebtPlan) => void
  onConvertPlanToManual: (plan: TimeDebtPlan) => void
  onAbandonPlan: (planId: string) => void
  onFinishTimer: () => void
  onEditTimeRange: (blockId: string, nextStartTime: string, nextEndTime: string) => void
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
  const activePreview = dragPreview?.blockId === block.id ? dragPreview : resizePreview?.blockId === block.id ? resizePreview : null
  const plannedRange = block.plan ? `${formatDateTimeReadable(block.plan.plannedStartTime)} - ${formatTimeOnly(block.plan.plannedEndTime)}` : ''
  const actualStart = block.log?.startTime ?? block.plan?.actualStartTime ?? (block.status === 'active' || block.status === 'completed' ? block.startTime : '')
  const actualEnd = block.log?.endTime ?? block.plan?.actualEndTime ?? (block.status === 'completed' ? block.endTime : '')
  const editableLabel = block.status === 'completed' ? '实际时间段' : block.plan && (block.status === 'planned' || block.status === 'missed') ? '计划时间段' : null
  return (
    <aside className="rounded-[18px] border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{activePreview ? 'Adjusting' : calendarStatusLabel(block.status)}</div>
      <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)]">{block.title}</h3>
      {activePreview ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-xs leading-6 text-[color:var(--text-secondary)]">
          <div className="font-semibold text-[color:var(--text-primary)]">调整中</div>
          <div>原时间段：{formatTimeOnly(block.startTime)} - {formatTimeOnly(block.endTime)}</div>
          <div>预览时间段：{formatMinutesAsTime(activePreview.startMinutes)} - {formatMinutesAsTime(activePreview.endMinutes)}</div>
          <div>时长变化：{formatSignedMinutes(activePreview.endMinutes - activePreview.startMinutes - (activePreview.originalEndMinutes - activePreview.originalStartMinutes))}</div>
          <div className="mt-1 text-[color:var(--text-muted)]">松手后保存到当前时间块。</div>
        </div>
      ) : null}
      <div className="mt-4 space-y-3 text-sm">
        <DetailRow label="状态" value={calendarStatusLabel(block.status)} />
        <DetailRow label="一级分类" value={block.primaryCategory} />
        <DetailRow label="二级项目" value={block.secondaryProject} />
        {block.plan ? <DetailRow label="计划时间" value={plannedRange} /> : null}
        {block.status === 'planned' && block.plan ? <DetailRow label="距离开始" value={formatDistanceToStart(block.plan.plannedStartTime, timerNow)} /> : null}
        {editableLabel ? <TimeRangeEditor label={editableLabel} block={block} onSave={onEditTimeRange} /> : null}
        {block.status === 'active' ? <ActiveTimeEditNotice /> : null}
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

function TimeRangeEditor({
  label,
  block,
  onSave
}: {
  label: string
  block: CalendarBlock
  onSave: (blockId: string, nextStartTime: string, nextEndTime: string) => void
}) {
  const [draft, setDraft] = useState(() => ({ startTime: block.startTime, endTime: block.endTime }))
  const startId = `${block.id}-start-time`
  const endId = `${block.id}-end-time`
  const duration = calculateDurationMinutes(draft.startTime, draft.endTime)
  const canSave = duration >= 15

  useEffect(() => {
    setDraft({ startTime: block.startTime, endTime: block.endTime })
  }, [block.endTime, block.id, block.startTime])

  const saveDraft = () => {
    if (!canSave) return
    if (draft.startTime === block.startTime && draft.endTime === block.endTime) return
    onSave(block.id, draft.startTime, draft.endTime)
  }
  const updateStartTime = (value: string) => setDraft((current) => ({ ...current, startTime: value }))
  const updateEndTime = (value: string) => setDraft((current) => ({ ...current, endTime: value }))

  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--inspector-section-bg)] p-3">
      <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{label}</div>
      <div className="grid gap-2">
        <label className="grid gap-1 text-[11px] text-[color:var(--text-muted)]" htmlFor={startId}>
          开始时间
          <input
            id={startId}
            type="datetime-local"
            value={draft.startTime}
            onBlur={saveDraft}
            onInput={(event) => updateStartTime(event.currentTarget.value)}
            onChange={(event) => updateStartTime(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1 text-[11px] text-[color:var(--text-muted)]" htmlFor={endId}>
          结束时间
          <input
            id={endId}
            type="datetime-local"
            value={draft.endTime}
            onBlur={saveDraft}
            onInput={(event) => updateEndTime(event.currentTarget.value)}
            onChange={(event) => updateEndTime(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <button type="button" disabled={!canSave} onClick={saveDraft} className={`mt-3 ${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}>
        保存时间段
      </button>
      <div className={`mt-2 text-xs ${canSave ? 'text-[color:var(--text-secondary)]' : 'text-rose-300'}`}>
        {canSave ? `当前时长 ${formatMinutes(duration)}` : '时间段至少需要 15 分钟。'}
      </div>
      {block.plan ? <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">TODO：后续同步检查 reminder 更复杂的提醒策略。</div> : null}
    </div>
  )
}

function ActiveTimeEditNotice() {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-5 text-[color:var(--text-secondary)]">
      进行中任务不能直接修改时间段，请先结束计时后再编辑。
    </div>
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

function formatMinutesAsTime(minutes: number): string {
  const safeMinutes = Math.max(0, Math.min(24 * 60, minutes))
  const hour = Math.floor(safeMinutes / 60)
  const minute = safeMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }
  return Math.round((end - start) / 60000)
}

const buttonClass = 'rounded-full border border-[color:var(--panel-border)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:border-[color:var(--node-selected-border)] hover:text-[color:var(--text-primary)]'
const primaryButtonClass = 'rounded-full border border-[color:var(--node-selected-border)] bg-[var(--node-selected-bg)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--node-selected-border)]'
const inputClass = 'w-full rounded-xl border border-[color:var(--panel-border)] bg-[var(--control-bg)] px-3 py-2 text-xs tabular-nums text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--node-selected-border)]'
