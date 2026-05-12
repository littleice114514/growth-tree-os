import { useMemo, useState } from 'react'
import { runSystemXMockAnalysis } from './systemxMockEngine'
import { appendSystemXRecord, clearSystemXRecords, loadSystemXRecords, systemXRecordsStorageKey } from './systemxStorage'
import {
  systemXInputTypeLabels,
  systemXInputTypes,
  systemXSystemTagLabels,
  type SystemXActionCandidate,
  type SystemXInput,
  type SystemXInputType,
  type SystemXPrincipleCandidate,
  type SystemXRecord
} from './types'

const inputClass =
  'w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]'

const panelClass = 'min-h-0 rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-panel'
const pillClass = 'rounded-full border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1 text-xs text-[color:var(--text-secondary)]'

export function SystemXPage() {
  const [inputType, setInputType] = useState<SystemXInputType>('decision')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [records, setRecords] = useState<SystemXRecord[]>(() => loadSystemXRecords())
  const [selectedRecord, setSelectedRecord] = useState<SystemXRecord | null>(() => loadSystemXRecords()[0] ?? null)
  const [notice, setNotice] = useState('')

  const selectedAnalysis = selectedRecord?.analysis ?? null
  const recordCountText = useMemo(() => `${records.length}/100 local records`, [records.length])

  const runAnalysis = () => {
    const nextTitle = title.trim()
    const nextContent = content.trim()

    if (!nextTitle || !nextContent) {
      setNotice('请先填写标题和正文，再开始系统感知分析。')
      return
    }

    const now = new Date().toISOString()
    const input: SystemXInput = {
      id: createSystemXId('input'),
      title: nextTitle,
      content: nextContent,
      type: inputType,
      sourceModule: 'manual',
      createdAt: now
    }
    const record = {
      input,
      analysis: runSystemXMockAnalysis(input)
    }
    const nextRecords = appendSystemXRecord(record)

    setRecords(nextRecords)
    setSelectedRecord(record)
    setNotice('已生成一条 mock 系统感知分析，并保存到本地历史。')
  }

  const clearInput = () => {
    setTitle('')
    setContent('')
    setNotice('')
  }

  const clearHistory = () => {
    const confirmed = window.confirm('确认清空 SystemX 历史记录？此操作只会清除本地 localStorage。')
    if (!confirmed) {
      return
    }

    clearSystemXRecords()
    setRecords([])
    setSelectedRecord(null)
    setNotice('SystemX 历史记录已清空。')
  }

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[minmax(340px,0.88fr)_minmax(0,1.35fr)] gap-4 overflow-hidden xl:grid-cols-[minmax(360px,0.78fr)_minmax(0,1.22fr)]">
      <section className="flex min-h-0 flex-col gap-4 overflow-auto pr-1">
        <div className={panelClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">SystemX MVP</div>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">SystemX｜系统感知台</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">
                把反思、决策、项目日志和财富判断转化为原则、行动和反馈。
              </p>
            </div>
            <span className={pillClass}>Mock Engine / localStorage</span>
          </div>
        </div>

        <div className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Input</div>
              <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">输入区</h3>
            </div>
            <span className={pillClass}>{recordCountText}</span>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[color:var(--text-secondary)]">输入类型</span>
              <select value={inputType} onChange={(event) => setInputType(event.target.value as SystemXInputType)} className={inputClass}>
                {systemXInputTypes.map((type) => (
                  <option key={type} value={type}>
                    {systemXInputTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[color:var(--text-secondary)]">标题</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：是否继续推进 SystemX MVP" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[color:var(--text-secondary)]">正文</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="写下事实、判断、阻塞、情绪或想法。SystemX 会先用 mock engine 生成结构化分析。"
                className={`${inputClass} min-h-[220px] resize-y leading-6`}
              />
            </label>
            {notice ? <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-sm text-sky-100">{notice}</div> : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={runAnalysis} className="rounded-2xl border border-emerald-400/35 bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-accent-green transition hover:bg-emerald-400/20">
                开始系统感知分析
              </button>
              <button type="button" onClick={clearInput} className="rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]">
                清空输入
              </button>
            </div>
          </div>
        </div>

        <HistoryPanel records={records} selectedRecord={selectedRecord} onSelect={setSelectedRecord} onClear={clearHistory} />
      </section>

      <section className="min-h-0 overflow-auto">
        <div className={`${panelClass} min-h-full`}>
          {selectedAnalysis && selectedRecord ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Analysis</div>
                  <h3 className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{selectedRecord.input.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={pillClass}>{systemXInputTypeLabels[selectedRecord.input.type]}</span>
                    <span className={pillClass}>{formatDateTime(selectedRecord.input.createdAt)}</span>
                  </div>
                </div>
              </div>

              <ResultSection title="摘要">
                <p className="text-sm leading-6 text-[color:var(--text-secondary)]">{selectedAnalysis.summary}</p>
              </ResultSection>
              <ResultSection title="核心事实">
                <BulletList items={selectedAnalysis.facts} />
              </ResultSection>
              <ResultSection title="暴露模式">
                <BulletList items={selectedAnalysis.patterns} />
              </ResultSection>
              <ResultSection title="可沉淀原则">
                <div className="grid gap-3">
                  {selectedAnalysis.principles.map((principle) => (
                    <PrincipleCard key={principle.id} principle={principle} />
                  ))}
                </div>
              </ResultSection>
              <ResultSection title="可执行行动">
                <div className="grid gap-3">
                  {selectedAnalysis.actions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              </ResultSection>
              <ResultSection title="风险提醒">
                <BulletList items={selectedAnalysis.risks} tone="risk" />
              </ResultSection>
              <ResultSection title="下一次验证方式">
                <p className="text-sm leading-6 text-[color:var(--text-secondary)]">{selectedAnalysis.feedbackRule}</p>
              </ResultSection>
              <ResultSection title="系统标签">
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.systemTags.map((tag) => (
                    <span key={tag} className={pillClass}>
                      {systemXSystemTagLabels[tag]}
                    </span>
                  ))}
                </div>
              </ResultSection>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[20px] border border-dashed border-[color:var(--panel-border)] px-6 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">No Analysis</div>
                <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--text-secondary)]">还没有系统感知记录。先输入一条反思、决策或项目日志。</p>
              </div>
            </div>
          )}
          <div className="mt-5 text-xs text-[color:var(--text-muted)]">localStorage key: {systemXRecordsStorageKey}</div>
        </div>
      </section>
    </main>
  )
}

function HistoryPanel({
  records,
  selectedRecord,
  onSelect,
  onClear
}: {
  records: SystemXRecord[]
  selectedRecord: SystemXRecord | null
  onSelect: (record: SystemXRecord) => void
  onClear: () => void
}) {
  return (
    <div className={panelClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">History</div>
          <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">历史记录</h3>
        </div>
        <button type="button" onClick={onClear} disabled={records.length === 0} className="rounded-2xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-2 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40">
          清空历史
        </button>
      </div>
      {records.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[color:var(--panel-border)] px-4 py-6 text-sm leading-6 text-[color:var(--text-muted)]">
          还没有系统感知记录。先输入一条反思、决策或项目日志。
        </p>
      ) : (
        <div className="grid gap-3">
          {records.map((record) => {
            const selected = selectedRecord?.input.id === record.input.id
            return (
              <button
                key={record.input.id}
                type="button"
                onClick={() => onSelect(record)}
                className={
                  selected
                    ? 'rounded-2xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] p-3 text-left shadow-[var(--shadow-node-neighbor)]'
                    : 'rounded-2xl border border-[color:var(--panel-border)] bg-[var(--control-bg)] p-3 text-left transition hover:bg-[var(--control-hover)]'
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{record.input.title}</div>
                    <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                      {systemXInputTypeLabels[record.input.type]} / {formatDateTime(record.input.createdAt)}
                    </div>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[color:var(--text-secondary)]">{record.analysis.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {record.analysis.systemTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[color:var(--input-border)] px-2 py-0.5 text-[10px] text-[color:var(--text-muted)]">
                      {systemXSystemTagLabels[tag]}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[color:var(--panel-border)] bg-[var(--control-bg)] p-4">
      <h4 className="mb-3 text-sm font-semibold text-[color:var(--text-primary)]">{title}</h4>
      {children}
    </section>
  )
}

function BulletList({ items, tone = 'default' }: { items: string[]; tone?: 'default' | 'risk' }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-[color:var(--text-secondary)]">
          <span className={tone === 'risk' ? 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-300' : 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300'} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function PrincipleCard({ principle }: { principle: SystemXPrincipleCandidate }) {
  return (
    <article className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-semibold text-[color:var(--text-primary)]">{principle.title}</h5>
        <span className={pillClass}>{principle.status}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{principle.statement}</p>
      <div className="mt-3 grid gap-2 text-xs leading-5 text-[color:var(--text-muted)] md:grid-cols-2">
        <MetaLine label="触发条件" value={principle.triggerCondition} />
        <MetaLine label="使用场景" value={principle.useCase} />
        <MetaLine label="反例" value={principle.counterExample} />
        <MetaLine label="验证方式" value={principle.verificationMethod} />
      </div>
    </article>
  )
}

function ActionCard({ action }: { action: SystemXActionCandidate }) {
  return (
    <article className="rounded-2xl border border-[color:var(--panel-border)] bg-[var(--panel-bg)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h5 className="text-sm font-semibold text-[color:var(--text-primary)]">{action.title}</h5>
        <div className="flex flex-wrap gap-2">
          <span className={pillClass}>{action.priority}</span>
          <span className={pillClass}>{action.effort}</span>
          <span className={pillClass}>{action.status}</span>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{action.description}</p>
      {action.evidence ? <p className="mt-3 text-xs leading-5 text-[color:var(--text-muted)]">证据：{action.evidence}</p> : null}
    </article>
  )
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[color:var(--text-secondary)]">{label}：</span>
      {value}
    </div>
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function createSystemXId(scope: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `systemx-${scope}-${crypto.randomUUID()}`
  }
  return `systemx-${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
