import dayjs from 'dayjs'
import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'
import type { WeeklyReviewItem } from '@shared/contracts'

export function WeeklyReviewPanel() {
  const weeklyReview = useWorkspaceStore((state) => state.weeklyReview)
  const jumpToNode = useWorkspaceStore((state) => state.jumpToNode)

  if (!weeklyReview) {
    return (
      <ShellCard className="flex h-full items-center justify-center p-6 text-base-400">
        周回看统计加载中...
      </ShellCard>
    )
  }

  const metrics = [
    ['本周新增节点数', weeklyReview.newNodesCount],
    ['本周更新节点数', weeklyReview.updatedNodesCount],
    ['本周 stable 节点数', weeklyReview.stableNodesCount],
    ['本周 dormant 节点数', weeklyReview.dormantNodesCount],
    ['本周 restarted 节点数', weeklyReview.restartedNodesCount],
    ['本周新增复盘数', weeklyReview.newReviewsCount]
  ]

  return (
    <ShellCard className="flex h-full min-h-0 flex-col overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-base-500">weekly review</div>
          <h2 className="mt-2 text-2xl font-semibold text-base-100">最近 7 天回看</h2>
        </div>
        <div className="text-sm text-base-400">
          {dayjs(weeklyReview.windowStart).format('MM-DD')} - {dayjs(weeklyReview.windowEnd).format('MM-DD')}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-white/8 bg-base-850/70 px-5 py-5"
          >
            <div className="text-sm text-base-400">{label}</div>
            <div className="mt-3 text-3xl font-semibold text-base-100">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 min-h-0 flex-1 overflow-auto pr-1">
        <div className="grid gap-8 xl:grid-cols-2">
          <ReviewList
            title="本周新增节点"
            items={weeklyReview.newNodes}
            emptyText="最近 7 天没有新增节点。"
            onJump={jumpToNode}
          />
          <ReviewList
            title="本周重复问题"
            items={weeklyReview.repeatProblems}
            emptyText="最近 7 天没有命中重复问题。"
            onJump={jumpToNode}
          />
          <ReviewList
            title="本周 dormant 节点"
            items={weeklyReview.dormantNodes}
            emptyText="最近 7 天没有进入 dormant 的节点。"
            onJump={jumpToNode}
          />
          <ReviewList
            title="本周 restarted 节点"
            items={weeklyReview.restartedNodes}
            emptyText="最近 7 天没有重新激活的节点。"
            onJump={jumpToNode}
          />
        </div>
      </div>
    </ShellCard>
  )
}

function ReviewList({
  title,
  items,
  emptyText,
  onJump
}: {
  title: string
  items: WeeklyReviewItem[]
  emptyText: string
  onJump: (nodeId: string) => Promise<void>
}) {
  return (
    <section>
      <div className="text-sm font-medium text-base-200">{title}</div>
      <div className="mt-4 grid gap-4">
        {items.length > 0 ? (
          items.map((item) => (
            <button
              key={`${title}-${item.nodeId}`}
              type="button"
              onClick={() => void onJump(item.nodeId)}
              className="block w-full rounded-3xl border border-white/8 bg-base-850/70 px-5 py-5 text-left transition hover:border-white/14"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xl font-semibold text-base-100">{item.title}</div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-base-300">
                  {item.status}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">{item.domain}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">点击后定位到节点</span>
              </div>
              <div className="mt-4 text-sm leading-7 text-base-300">{item.reason}</div>
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-6 py-10 text-sm leading-7 text-base-500">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  )
}
