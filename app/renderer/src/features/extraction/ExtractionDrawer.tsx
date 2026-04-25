import { useEffect, useState } from 'react'
import { DOMAIN_OPTIONS, NODE_TYPE_OPTIONS } from '@shared/contracts'
import clsx from 'clsx'
import { ShellCard } from '@/components/ShellCard'
import { api } from '@/services/api'
import { useWorkspaceStore } from '@/app/store'

export function ExtractionDrawer() {
  const extractionReview = useWorkspaceStore((state) => state.extractionReview)
  const drafts = useWorkspaceStore((state) => state.extractionDrafts)
  const updateDraft = useWorkspaceStore((state) => state.updateExtractionDraft)
  const addDraft = useWorkspaceStore((state) => state.addExtractionDraft)
  const removeDraft = useWorkspaceStore((state) => state.removeExtractionDraft)
  const closeExtraction = useWorkspaceStore((state) => state.closeExtraction)
  const submitExtraction = useWorkspaceStore((state) => state.submitExtraction)
  const [options, setOptions] = useState<Record<string, Awaited<ReturnType<typeof api.searchNodes>>>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const tasks = drafts
      .filter((draft) => draft.mode === 'bind')
      .map(async (draft) => {
        const result = await api.searchNodes(draft.bindQuery)
        return [draft.key, result] as const
      })

    void Promise.all(tasks).then((entries) => {
      setOptions(Object.fromEntries(entries))
    })
  }, [drafts])

  if (!extractionReview) {
    return null
  }

  return (
    <div className="absolute inset-y-0 right-0 z-20 w-[420px] border-l border-white/8 bg-base-950/95 p-5 backdrop-blur-xl">
      <ShellCard className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-base-500">structure updates</div>
            <h2 className="mt-2 text-xl font-semibold text-base-100">结构更新录入面板</h2>
            <p className="mt-2 text-sm leading-6 text-base-300">
              从这篇复盘里手动确认 1 到 3 条进入成长树的结构更新。
            </p>
          </div>
          <button
            type="button"
            onClick={closeExtraction}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-base-300"
          >
            关闭
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-base-850/70 px-4 py-4 text-sm text-base-300">
          <div className="font-medium text-base-100">{extractionReview.title}</div>
          <div className="mt-2 max-h-40 overflow-hidden whitespace-pre-wrap text-sm leading-6">
            {extractionReview.contentMarkdown}
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-auto pr-1">
          {drafts.map((draft, index) => (
            <article
              key={draft.key}
              className="rounded-3xl border border-white/8 bg-white/3 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-base-100">候选 {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeDraft(draft.key)}
                  className="text-xs text-base-500"
                >
                  删除
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateDraft(draft.key, { mode: 'create', bindNodeId: undefined })}
                  className={clsx(
                    'rounded-2xl border px-3 py-2 text-sm',
                    draft.mode === 'create'
                      ? 'border-accent-cyan bg-accent-cyan/15 text-base-100'
                      : 'border-white/8 text-base-400'
                  )}
                >
                  新建节点
                </button>
                <button
                  type="button"
                  onClick={() => updateDraft(draft.key, { mode: 'bind' })}
                  className={clsx(
                    'rounded-2xl border px-3 py-2 text-sm',
                    draft.mode === 'bind'
                      ? 'border-accent-cyan bg-accent-cyan/15 text-base-100'
                      : 'border-white/8 text-base-400'
                  )}
                >
                  绑定已有节点
                </button>
              </div>

              <label className="mt-3 block space-y-2 text-sm text-base-300">
                <span>标题</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft(draft.key, { title: event.target.value })}
                  className="w-full rounded-2xl border border-white/8 bg-base-850 px-3 py-3 text-base-100 outline-none"
                />
              </label>

              {draft.mode === 'bind' ? (
                <label className="mt-3 block space-y-2 text-sm text-base-300">
                  <span>搜索已有节点</span>
                  <input
                    value={draft.bindQuery}
                    onChange={(event) => updateDraft(draft.key, { bindQuery: event.target.value })}
                    placeholder="输入节点标题关键词"
                    className="w-full rounded-2xl border border-white/8 bg-base-850 px-3 py-3 text-base-100 outline-none"
                  />
                  <select
                    value={draft.bindNodeId ?? ''}
                    onChange={(event) => {
                      const selected = options[draft.key]?.find((item) => item.id === event.target.value)
                      updateDraft(draft.key, {
                        bindNodeId: event.target.value || undefined,
                        title: selected?.title ?? draft.title,
                        domain: selected?.domain ?? draft.domain
                      })
                    }}
                    className="w-full rounded-2xl border border-white/8 bg-base-850 px-3 py-3 text-base-100 outline-none"
                  >
                    <option value="">选择绑定目标</option>
                    {(options[draft.key] ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} / {item.domain}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-base-300">
                  <span>类型</span>
                  <select
                    value={draft.nodeType}
                    onChange={(event) =>
                      updateDraft(draft.key, {
                        nodeType: event.target.value as (typeof draft)['nodeType']
                      })
                    }
                    className="w-full rounded-2xl border border-white/8 bg-base-850 px-3 py-3 text-base-100 outline-none"
                  >
                    {NODE_TYPE_OPTIONS.filter((item) => item !== 'mainline').map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-base-300">
                  <span>所属主线</span>
                  <select
                    value={draft.domain}
                    onChange={(event) =>
                      updateDraft(draft.key, {
                        domain: event.target.value as (typeof draft)['domain']
                      })
                    }
                    className="w-full rounded-2xl border border-white/8 bg-base-850 px-3 py-3 text-base-100 outline-none"
                  >
                    {DOMAIN_OPTIONS.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-3 block space-y-2 text-sm text-base-300">
                <span>简短说明 / 证据摘录</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => updateDraft(draft.key, { description: event.target.value })}
                  className="min-h-24 w-full rounded-2xl border border-white/8 bg-base-850 px-3 py-3 text-base-100 outline-none"
                />
              </label>

              <label className="mt-3 flex items-center gap-3 text-sm text-base-200">
                <input
                  type="checkbox"
                  checked={draft.addEvidence}
                  onChange={(event) => updateDraft(draft.key, { addEvidence: event.target.checked })}
                />
                记为节点证据
              </label>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={addDraft}
            disabled={drafts.length >= 3}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-base-100 disabled:opacity-50"
          >
            再加一条
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true)
              try {
                await submitExtraction()
              } finally {
                setIsSaving(false)
              }
            }}
            className="rounded-2xl bg-accent-cyan px-4 py-3 text-sm font-semibold text-base-950"
          >
            {isSaving ? '提交中...' : '提交结构更新'}
          </button>
        </div>
      </ShellCard>
    </div>
  )
}
