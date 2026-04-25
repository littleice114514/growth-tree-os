import { useState } from 'react'
import dayjs from 'dayjs'
import { ShellCard } from '@/components/ShellCard'
import { useWorkspaceStore } from '@/app/store'

export function ReviewComposer() {
  const closeReviewComposer = useWorkspaceStore((state) => state.closeReviewComposer)
  const createReview = useWorkspaceStore((state) => state.createReview)
  const [reviewDate, setReviewDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [title, setTitle] = useState('今天有哪些结构变化值得留下？')
  const [contentMarkdown, setContentMarkdown] = useState(
    '# 每日复盘\n\n今天发生了什么？哪些地方更稳定，哪些地方仍然卡住？\n\n- '
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await createReview({ reviewDate, title, contentMarkdown })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-base-950/55 p-8 backdrop-blur-sm">
      <ShellCard className="w-full max-w-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-base-500">daily review</div>
            <h2 className="mt-2 text-2xl font-semibold text-base-100">新建每日复盘</h2>
            <p className="mt-2 text-sm leading-6 text-base-300">
              先自由复盘，再进入结构更新面板。这里不强迫结构化，允许先把原始内容写完整。
            </p>
          </div>
          <button
            type="button"
            onClick={closeReviewComposer}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-base-300"
          >
            关闭
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[180px_1fr]">
          <label className="space-y-2 text-sm text-base-300">
            <span>复盘日期</span>
            <input
              type="date"
              value={reviewDate}
              onChange={(event) => setReviewDate(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-base-850 px-4 py-3 text-base-100 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm text-base-300">
            <span>标题</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-base-850 px-4 py-3 text-base-100 outline-none"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-sm text-base-300">
          <span>Markdown 复盘正文</span>
          <textarea
            value={contentMarkdown}
            onChange={(event) => setContentMarkdown(event.target.value)}
            className="min-h-[340px] w-full rounded-3xl border border-white/10 bg-base-850 px-4 py-4 text-sm leading-7 text-base-100 outline-none"
          />
        </label>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-base-500">保存后会自动进入结构更新录入面板。</div>
          <button
            type="button"
            disabled={isSaving || !contentMarkdown.trim()}
            onClick={handleSave}
            className="rounded-2xl bg-accent-cyan px-5 py-3 text-sm font-semibold text-base-950 disabled:opacity-50"
          >
            {isSaving ? '正在保存...' : '保存并进入结构更新'}
          </button>
        </div>
      </ShellCard>
    </div>
  )
}
