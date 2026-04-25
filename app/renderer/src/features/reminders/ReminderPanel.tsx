import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'
import { formatDateTime } from '@/services/time'

const typeLabel = {
  dormant: '沉寂提醒',
  repeat_problem: '重复问题',
  review_due: '回看提醒'
} as const

export function ReminderPanel() {
  const reminders = useWorkspaceStore((state) => state.reminders)
  const completeReminder = useWorkspaceStore((state) => state.completeReminder)
  const jumpToNode = useWorkspaceStore((state) => state.jumpToNode)
  const openReminders = reminders.filter((item) => item.status === 'open')
  const doneReminders = reminders.filter((item) => item.status === 'done')

  return (
    <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-base-500">reminders</div>
          <h2 className="mt-2 text-2xl font-semibold text-base-100">提醒面板</h2>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-2 text-sm text-base-300">
          {openReminders.length} 条待处理 / {doneReminders.length} 条已处理
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-auto pr-1">
        <SectionTitle title="待处理提醒" count={openReminders.length} />
        <div className="mt-4 grid gap-4">
          {openReminders.length > 0 ? (
            openReminders.map((reminder) => (
              <article
                key={reminder.id}
                className="rounded-3xl border border-white/8 bg-base-850/65 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-base-500">
                      {typeLabel[reminder.reminderType]}
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
                  <button
                    type="button"
                    onClick={() =>
                      void completeReminder(
                        reminder.id,
                        reminder.reminderType === 'review_due' ? 'reviewed' : 'complete'
                      )
                    }
                    className="rounded-2xl bg-base-100 px-4 py-2 text-sm font-medium text-base-950"
                  >
                    处理完成
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-base-300">{reminder.reason}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-base-500">due {formatDateTime(reminder.dueAt)}</div>
                  <button
                    type="button"
                    onClick={() => void jumpToNode(reminder.nodeId)}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-base-200"
                  >
                    查看节点
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-6 py-10 text-sm leading-7 text-base-500">
              当前没有待处理提醒。节点进入沉寂、重复问题或回看周期后会出现在这里。
            </div>
          )}
        </div>

        <SectionTitle title="已处理提醒" count={doneReminders.length} className="mt-8" />
        <div className="mt-4 grid gap-4">
          {doneReminders.length > 0 ? (
            doneReminders.map((reminder) => (
              <article
                key={reminder.id}
                className="rounded-3xl border border-white/8 bg-base-850/45 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-base-500">
                      {typeLabel[reminder.reminderType]} · 已处理
                    </div>
                    <div className="mt-2 text-lg font-semibold text-base-100">{reminder.nodeTitle}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{reminder.domain}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">
                        处理时间 {reminder.processedAt ? formatDateTime(reminder.processedAt) : '-'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void jumpToNode(reminder.nodeId)}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-base-200"
                  >
                    查看节点
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-base-300">{reminder.reason}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-6 py-10 text-sm leading-7 text-base-500">
              处理过的提醒会保留在这里，方便之后回看。
            </div>
          )}
        </div>
      </div>
    </ShellCard>
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
