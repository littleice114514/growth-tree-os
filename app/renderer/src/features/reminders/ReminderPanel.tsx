import { useEffect, useMemo, useState } from 'react'
import type { ReminderRecord } from '@shared/contracts'
import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'
import { formatDateTime } from '@/services/time'
import { updateTimeDebtPlan } from '@/features/time-debt/timeDebtPlansStorage'
import {
  archiveTimePlanReminderBySource,
  isArchivedTimePlanReminder,
  loadTimePlanReminders,
  resolveTimePlanReminderStatus,
  updateTimePlanReminderBySource,
  writeTimeDebtNavigationIntent,
  type TimePlanReminder,
  type TimePlanReminderStatus
} from './timePlanReminderStorage'

const typeLabel = {
  dormant: '沉寂提醒',
  repeat_problem: '重复问题',
  review_due: '回看提醒'
} as const

type WorkbenchItem =
  | {
      kind: 'time-plan'
      reminder: TimePlanReminder
      status: TimePlanReminderStatus
    }
  | {
      kind: 'node-maintenance'
      reminder: ReminderRecord
    }

export function ReminderPanel() {
  const reminders = useWorkspaceStore((state) => state.reminders)
  const completeReminder = useWorkspaceStore((state) => state.completeReminder)
  const jumpToNode = useWorkspaceStore((state) => state.jumpToNode)
  const setCurrentView = useWorkspaceStore((state) => state.setCurrentView)
  const [timePlanReminders, setTimePlanReminders] = useState<TimePlanReminder[]>(() => loadTimePlanReminders())
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [archiveOpen, setArchiveOpen] = useState(false)

  const reloadTimePlanReminders = () => setTimePlanReminders(loadTimePlanReminders())

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 30000)
    const handleReminderChange = () => reloadTimePlanReminders()
    window.addEventListener('time-plan-reminders-change', handleReminderChange)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('time-plan-reminders-change', handleReminderChange)
    }
  }, [])

  const nodeOpenReminders = reminders.filter((item) => item.status === 'open')
  const nodeDoneReminders = reminders.filter((item) => item.status === 'done')
  const timePlanItems = useMemo(
    () =>
      timePlanReminders.map((reminder) => ({
        kind: 'time-plan' as const,
        reminder,
        status: resolveTimePlanReminderStatus(reminder, nowMs)
      })),
    [nowMs, timePlanReminders]
  )
  const activeTimePlanItems = timePlanItems.filter((item) => !isArchivedTimePlanReminder(item.reminder))
  const archivedTimePlanItems = timePlanItems.filter((item) => isArchivedTimePlanReminder(item.reminder))
  const pendingItems: WorkbenchItem[] = [
    ...activeTimePlanItems,
    ...nodeOpenReminders.map((reminder) => ({ kind: 'node-maintenance' as const, reminder }))
  ].sort(compareWorkbenchItems)
  const todayPlanCount = timePlanReminders.filter((reminder) => getDatePart(reminder.plannedStart) === getDatePart(new Date(nowMs).toISOString())).length
  const dueCount = activeTimePlanItems.filter((item) => item.status === 'due' || item.status === 'missed').length
  const archivedCount = archivedTimePlanItems.length + nodeDoneReminders.length

  const navigateToTimeDebt = async (sourceId: string, mode: 'focus' | 'start' | 'manual') => {
    writeTimeDebtNavigationIntent({ sourceId, mode })
    await setCurrentView('timeDebt')
  }

  const snoozeReminder = (reminder: TimePlanReminder) => {
    const nextStart = addMinutes(reminder.plannedStart, 10)
    const nextEnd = addMinutes(reminder.plannedEnd, 10)
    updateTimeDebtPlan(reminder.sourceId, {
      plannedStartTime: nextStart,
      plannedEndTime: nextEnd
    })
    updateTimePlanReminderBySource(reminder.sourceId, {
      plannedStart: nextStart,
      plannedEnd: nextEnd,
      snoozedUntil: nextStart,
      snoozeCount: reminder.snoozeCount + 1,
      originalPlannedStart: reminder.originalPlannedStart || reminder.plannedStart,
      status: 'pending'
    })
    reloadTimePlanReminders()
  }

  const dismissReminder = (sourceId: string) => {
    archiveTimePlanReminderBySource(sourceId, 'dismissed')
    reloadTimePlanReminders()
  }

  return (
    <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-base-500">reminder workbench</div>
          <h2 className="mt-2 text-2xl font-semibold text-base-100">提醒工作台</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-400">
            今日计划、节点维护和固定事项统一收口到这里；计划任务只在你明确开始后进入计时。
          </p>
        </div>
        <div className="grid min-w-[420px] grid-cols-4 gap-2">
          <OverviewMetric label="待处理" value={pendingItems.length} />
          <OverviewMetric label="已到点" value={dueCount} tone="due" />
          <OverviewMetric label="今日计划" value={todayPlanCount} />
          <OverviewMetric label="已归档" value={archivedCount} />
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-auto pr-1">
        <SectionTitle title="待处理提醒" count={pendingItems.length} />
        <div className="mt-4 grid gap-4">
          {pendingItems.length > 0 ? (
            pendingItems.map((item) =>
              item.kind === 'time-plan' ? (
                <TimePlanReminderCard
                  key={item.reminder.id}
                  reminder={item.reminder}
                  status={item.status}
                  nowMs={nowMs}
                  onFocus={() => void navigateToTimeDebt(item.reminder.sourceId, 'focus')}
                  onStart={() => void navigateToTimeDebt(item.reminder.sourceId, 'start')}
                  onSnooze={() => snoozeReminder(item.reminder)}
                  onManual={() => void navigateToTimeDebt(item.reminder.sourceId, 'manual')}
                  onDismiss={() => dismissReminder(item.reminder.sourceId)}
                />
              ) : (
                <NodeReminderCard
                  key={item.reminder.id}
                  reminder={item.reminder}
                  onComplete={() =>
                    void completeReminder(
                      item.reminder.id,
                      item.reminder.reminderType === 'review_due' ? 'reviewed' : 'complete'
                    )
                  }
                  onJump={() => void jumpToNode(item.reminder.nodeId)}
                />
              )
            )
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-6 py-10 text-sm leading-7 text-base-500">
              当前没有待处理提醒。Time Debt 规划任务、沉寂节点或周期回看会出现在这里。
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <SectionTitle title="已归档提醒" count={archivedCount} />
          <button type="button" onClick={() => setArchiveOpen((current) => !current)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-base-200">
            {archiveOpen ? '收起归档' : '查看归档'}
          </button>
        </div>
        {archiveOpen ? (
          <div className="mt-4 grid gap-4">
            <ArchiveSummary timePlanItems={archivedTimePlanItems} nodeDoneReminders={nodeDoneReminders} nowMs={nowMs} />
            {archivedTimePlanItems.map((item) => (
              <ArchivedTimePlanCard key={item.reminder.id} reminder={item.reminder} status={item.status} />
            ))}
            {nodeDoneReminders.map((reminder) => (
              <ArchivedNodeReminderCard key={reminder.id} reminder={reminder} onJump={() => void jumpToNode(reminder.nodeId)} />
            ))}
            {archivedCount === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-6 py-10 text-sm leading-7 text-base-500">
                已完成、忽略或处理过的提醒会保留在这里，方便之后回看。
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ShellCard>
  )
}

function TimePlanReminderCard({
  reminder,
  status,
  nowMs,
  onFocus,
  onStart,
  onSnooze,
  onManual,
  onDismiss
}: {
  reminder: TimePlanReminder
  status: TimePlanReminderStatus
  nowMs: number
  onFocus: () => void
  onStart: () => void
  onSnooze: () => void
  onManual: () => void
  onDismiss: () => void
}) {
  const canStart = status === 'due' || status === 'missed'
  return (
    <article className={`rounded-3xl border p-5 ${timePlanCardClass(status)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-accent-amber">
              time-plan
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] ${statusPillClass(status)}`}>{statusLabel(status, reminder, nowMs)}</span>
            {reminder.snoozeCount > 0 ? (
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-base-400">已延后 {reminder.snoozeCount} 次</span>
            ) : null}
          </div>
          <div className="mt-3 text-xl font-semibold text-base-100">{reminder.title}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
              {formatTimeOnly(reminder.plannedStart)} - {formatTimeOnly(reminder.plannedEnd)}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.primaryCategory}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.secondaryProject}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-base-300">{statusDetail(status, reminder, nowMs)}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={onFocus} className={secondaryActionClass}>
          去处理
        </button>
        <button type="button" onClick={onStart} disabled={!canStart} className={`${primaryActionClass} disabled:cursor-not-allowed disabled:opacity-45`}>
          {canStart ? (status === 'missed' ? '现在开始' : '开始计时') : '未到开始时间'}
        </button>
        <button type="button" onClick={onSnooze} className={secondaryActionClass}>
          延后 10 分钟
        </button>
        <button type="button" onClick={onManual} className={secondaryActionClass}>
          转为补记
        </button>
        <button type="button" onClick={onDismiss} className={secondaryActionClass}>
          忽略
        </button>
      </div>
    </article>
  )
}

function NodeReminderCard({
  reminder,
  onComplete,
  onJump
}: {
  reminder: ReminderRecord
  onComplete: () => void
  onJump: () => void
}) {
  return (
    <article className="rounded-3xl border border-white/8 bg-base-850/65 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-base-500">
            node-maintenance / {typeLabel[reminder.reminderType]}
          </div>
          <div className="mt-2 text-xl font-semibold text-base-100">{reminder.nodeTitle}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.domain}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.nodeStatus}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
              最近活跃 {formatDateTime(reminder.lastActiveAt)}
            </span>
          </div>
        </div>
        <button type="button" onClick={onComplete} className={primaryActionClass}>
          处理完成
        </button>
      </div>
      <p className="mt-4 text-sm leading-7 text-base-300">{reminder.reason}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-base-500">due {formatDateTime(reminder.dueAt)}</div>
        <button type="button" onClick={onJump} className={secondaryActionClass}>
          查看节点
        </button>
      </div>
    </article>
  )
}

function ArchivedTimePlanCard({ reminder, status }: { reminder: TimePlanReminder; status: TimePlanReminderStatus }) {
  return (
    <article className="rounded-3xl border border-white/8 bg-base-850/45 p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-base-500">time-plan / {archiveStatusLabel(status)}</div>
      <div className="mt-2 text-lg font-semibold text-base-100">{reminder.title}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
          原计划 {formatTimeOnly(reminder.originalPlannedStart || reminder.plannedStart)} - {formatTimeOnly(reminder.plannedEnd)}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.primaryCategory}</span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
          归档 {reminder.archivedAt ? formatDateTime(reminder.archivedAt) : '已保存'}
        </span>
      </div>
    </article>
  )
}

function ArchivedNodeReminderCard({ reminder, onJump }: { reminder: ReminderRecord; onJump: () => void }) {
  return (
    <article className="rounded-3xl border border-white/8 bg-base-850/45 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-base-500">
            node-maintenance / {typeLabel[reminder.reminderType]} / 已处理
          </div>
          <div className="mt-2 text-lg font-semibold text-base-100">{reminder.nodeTitle}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.domain}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
              处理时间 {reminder.processedAt ? formatDateTime(reminder.processedAt) : '-'}
            </span>
          </div>
        </div>
        <button type="button" onClick={onJump} className={secondaryActionClass}>
          查看节点
        </button>
      </div>
      <p className="mt-4 text-sm leading-7 text-base-300">{reminder.reason}</p>
    </article>
  )
}

function ArchiveSummary({
  timePlanItems,
  nodeDoneReminders,
  nowMs
}: {
  timePlanItems: Array<{ kind: 'time-plan'; reminder: TimePlanReminder; status: TimePlanReminderStatus }>
  nodeDoneReminders: ReminderRecord[]
  nowMs: number
}) {
  const today = getDatePart(new Date(nowMs).toISOString())
  const weekStartMs = nowMs - 7 * 24 * 60 * 60000
  const todayDone = timePlanItems.filter((item) => getDatePart(item.reminder.archivedAt || item.reminder.updatedAt) === today).length
  const weekArchived = timePlanItems.filter((item) => new Date(item.reminder.archivedAt || item.reminder.updatedAt).getTime() >= weekStartMs).length + nodeDoneReminders.length
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <OverviewMetric label="今日已完成" value={todayDone} />
      <OverviewMetric label="本周归档" value={weekArchived} />
      <OverviewMetric label="全部归档" value={timePlanItems.length + nodeDoneReminders.length} />
    </div>
  )
}

function OverviewMetric({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'due' }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 ${tone === 'due' ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-white/8 bg-white/4'}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-base-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-base-100">{value}</div>
    </div>
  )
}

function SectionTitle({ title, count, className = '' }: { title: string; count: number; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`.trim()}>
      <div className="text-sm font-medium text-base-200">{title}</div>
      <div className="text-xs text-base-500">{count} 条</div>
    </div>
  )
}

function compareWorkbenchItems(first: WorkbenchItem, second: WorkbenchItem): number {
  return workbenchRank(first) - workbenchRank(second)
}

function workbenchRank(item: WorkbenchItem): number {
  if (item.kind === 'node-maintenance') {
    return 6
  }
  return {
    due: 0,
    missed: 1,
    active: 2,
    pending: 4,
    completed: 7,
    dismissed: 7,
    archived: 7
  }[item.status]
}

function statusLabel(status: TimePlanReminderStatus, reminder: TimePlanReminder, nowMs: number): string {
  if (status === 'missed') return '已错过'
  if (status === 'due') return '已到点'
  if (status === 'active') return '进行中'
  if (status === 'completed') return '已完成'
  const startMs = new Date(reminder.snoozedUntil || reminder.plannedStart).getTime()
  if (Number.isFinite(startMs) && startMs - nowMs <= 10 * 60000) {
    return '即将开始'
  }
  return '计划中'
}

function statusDetail(status: TimePlanReminderStatus, reminder: TimePlanReminder, nowMs: number): string {
  const startMs = new Date(reminder.snoozedUntil || reminder.plannedStart).getTime()
  const endMs = new Date(reminder.plannedEnd).getTime()
  if (status === 'missed') return `计划已过 ${formatRelativeMinutes(nowMs - endMs)}，可以转为补记、现在开始或忽略。`
  if (status === 'due') return '计划时间已到，点击开始计时后才会写入真实开始时间。'
  if (status === 'active') return '任务正在执行，回到 Time Debt 可以结束计时并生成日志。'
  if (Number.isFinite(startMs)) return `距离开始还有 ${formatRelativeMinutes(startMs - nowMs)}。`
  return '计划时间待确认。'
}

function archiveStatusLabel(status: TimePlanReminderStatus): string {
  if (status === 'completed') return '已完成'
  if (status === 'dismissed') return '已忽略'
  if (status === 'missed') return '已错过'
  return '已归档'
}

function statusPillClass(status: TimePlanReminderStatus): string {
  if (status === 'due' || status === 'active') return 'border-emerald-400/35 text-accent-green'
  if (status === 'missed') return 'border-rose-400/30 text-accent-rose'
  if (status === 'completed') return 'border-cyan-400/30 text-cyan-200'
  return 'border-white/10 text-base-400'
}

function timePlanCardClass(status: TimePlanReminderStatus): string {
  if (status === 'due' || status === 'active') return 'border-emerald-400/25 bg-emerald-400/10'
  if (status === 'missed') return 'border-rose-400/25 bg-rose-400/10'
  return 'border-white/8 bg-base-850/65'
}

function addMinutes(value: string, minutes: number): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  date.setMinutes(date.getMinutes() + minutes)
  return formatLocalDateTimeInput(date)
}

function formatLocalDateTimeInput(date: Date): string {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatTimeOnly(value: string): string {
  if (!value) {
    return '--:--'
  }
  return value.slice(11, 16)
}

function getDatePart(value: string): string {
  return value.slice(0, 10)
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

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

const primaryActionClass = 'rounded-2xl bg-base-100 px-4 py-2 text-sm font-medium text-base-950'
const secondaryActionClass = 'rounded-2xl border border-white/10 px-4 py-2 text-sm text-base-200 transition hover:bg-white/5'
