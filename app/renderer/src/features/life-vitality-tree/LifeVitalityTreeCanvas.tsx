import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { useWorkspaceStore } from '@/app/store'
import { ShellCard } from '@/components/ShellCard'
import { formatDateTime } from '@/services/time'
import { lifeVitalityTreeMockData } from './lifeVitalityTreeMockData'
import { buildLifeVitalityTreeFromAppData } from './lifeVitalityTreeMapper'
import type {
  DailyVitalityCheck,
  LifeTreeNode,
  LifeTreeNodeKind,
  LifeTreeStatus,
  LifeTreeViewMode,
  LifeTreeVisualState,
  TreeVisualTone
} from './lifeVitalityTreeTypes'
import { VitalityCheckPanel } from './VitalityCheckPanel'
import { buildDailyVitalityCheck, createDefaultVitalityItems, vitalitySeasonHints, vitalitySeasonLabels } from './lifeVitalityTreeVitality'
import { buildLifeTreeVisualState, getNodeVitalityHint } from './lifeVitalityTreeVisualState'

const viewModes: Array<{ id: LifeTreeViewMode; label: string; hint: string }> = [
  { id: 'overview', label: '远景视角', hint: '整棵树、季节、生命力比例' },
  { id: 'structure', label: '结构视角', hint: '树干筋络、大枝、根系和对象摘要' },
  { id: 'module', label: '模块视角', hint: '进入枝干，看小枝、叶、花、果' },
  { id: 'detail', label: '细节视角', hint: '查看对象路径、状态、来源和下一步' },
  { id: 'rings', label: '年轮视角', hint: '年度主线、成果、伤痕和总结' }
]

const kindLabels: Record<LifeTreeNodeKind, string> = {
  tree: '整树',
  root: '树根',
  trunk: '树干',
  trunk_vein: '筋络',
  major_branch: '大枝',
  minor_branch: '小枝',
  leaf: '叶子',
  flower: '花',
  fruit: '果实',
  withered_leaf: '枯叶',
  fallen_leaf: '落叶',
  soil: '土壤',
  annual_ring: '年轮'
}

const statusLabels: Record<LifeTreeStatus, string> = {
  growing: '生长中',
  stable: '稳定',
  paused: '暂停',
  repairing: '修复中',
  harvesting: '结果中',
  withered: '衰退信号',
  unknown: '未知'
}

const statusStyles: Record<LifeTreeStatus, string> = {
  growing: 'border-emerald-300/50 bg-emerald-300/15 text-emerald-100',
  stable: 'border-sky-300/45 bg-sky-300/15 text-sky-100',
  paused: 'border-zinc-300/35 bg-zinc-300/10 text-zinc-200',
  repairing: 'border-cyan-300/45 bg-cyan-300/15 text-cyan-100',
  harvesting: 'border-amber-300/55 bg-amber-300/20 text-amber-100',
  withered: 'border-rose-300/45 bg-rose-300/15 text-rose-100',
  unknown: 'border-slate-300/35 bg-slate-300/10 text-slate-200'
}

const nodeStyles: Record<LifeTreeNodeKind, string> = {
  tree: 'h-12 w-36 rounded-[20px] border-emerald-200/50 bg-emerald-200/15 text-emerald-50',
  root: 'h-10 w-28 rounded-full border-cyan-200/45 bg-cyan-200/15 text-cyan-50',
  trunk: 'h-12 w-32 rounded-[22px] border-lime-200/45 bg-lime-200/15 text-lime-50',
  trunk_vein: 'h-8 w-28 rounded-full border-teal-200/45 bg-teal-200/15 text-teal-50',
  major_branch: 'h-10 w-32 rounded-[18px] border-emerald-200/45 bg-emerald-200/15 text-emerald-50',
  minor_branch: 'h-9 w-28 rounded-[18px] border-sky-200/45 bg-sky-200/15 text-sky-50',
  leaf: 'h-8 w-28 rounded-full border-green-200/45 bg-green-200/15 text-green-50',
  flower: 'h-9 w-28 rounded-full border-fuchsia-200/45 bg-fuchsia-200/15 text-fuchsia-50',
  fruit: 'h-9 w-28 rounded-full border-amber-200/55 bg-amber-200/20 text-amber-50',
  withered_leaf: 'h-8 w-28 rounded-full border-orange-200/45 bg-orange-200/15 text-orange-50',
  fallen_leaf: 'h-8 w-32 rounded-full border-rose-200/45 bg-rose-200/15 text-rose-50',
  soil: 'h-9 w-28 rounded-full border-stone-200/35 bg-stone-200/15 text-stone-100',
  annual_ring: 'h-9 w-30 rounded-full border-indigo-200/45 bg-indigo-200/15 text-indigo-50'
}

const activeNodesByMode: Record<LifeTreeViewMode, LifeTreeNodeKind[]> = {
  overview: ['tree', 'root', 'trunk', 'major_branch', 'fruit', 'withered_leaf', 'fallen_leaf', 'annual_ring'],
  structure: ['root', 'soil', 'trunk', 'trunk_vein', 'major_branch', 'annual_ring'],
  module: ['major_branch', 'minor_branch', 'leaf', 'flower', 'fruit', 'withered_leaf', 'fallen_leaf'],
  detail: [
    'tree',
    'root',
    'soil',
    'trunk',
    'trunk_vein',
    'major_branch',
    'minor_branch',
    'leaf',
    'flower',
    'fruit',
    'withered_leaf',
    'fallen_leaf',
    'annual_ring'
  ],
  rings: ['annual_ring', 'trunk']
}

const treeToneStyles: Record<TreeVisualTone, string> = {
  fresh:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(36,148,107,0.34),transparent_34%),linear-gradient(180deg,rgba(8,18,24,0.94),rgba(12,28,19,0.96))]',
  lush:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(76,175,80,0.38),transparent_35%),linear-gradient(180deg,rgba(8,20,16,0.94),rgba(10,38,23,0.96))]',
  harvest:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.32),transparent_36%),linear-gradient(180deg,rgba(28,20,8,0.94),rgba(35,24,10,0.96))]',
  quiet:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(125,211,252,0.18),transparent_34%),linear-gradient(180deg,rgba(9,16,22,0.95),rgba(12,22,28,0.97))]',
  burning:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(248,113,113,0.34),transparent_34%),radial-gradient(circle_at_70%_52%,rgba(245,158,11,0.2),transparent_28%),linear-gradient(180deg,rgba(30,12,10,0.94),rgba(30,18,10,0.97))]',
  dim:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(148,163,184,0.16),transparent_34%),linear-gradient(180deg,rgba(9,11,16,0.96),rgba(13,15,20,0.98))]',
  scattered:
    'bg-[radial-gradient(circle_at_25%_24%,rgba(56,189,248,0.18),transparent_24%),radial-gradient(circle_at_75%_42%,rgba(244,114,182,0.18),transparent_24%),linear-gradient(180deg,rgba(12,16,24,0.95),rgba(20,18,30,0.97))]',
  unknown:
    'bg-[radial-gradient(circle_at_50%_20%,rgba(36,148,107,0.22),transparent_34%),linear-gradient(180deg,rgba(8,18,24,0.94),rgba(12,22,18,0.96))]'
}

function nodeModeOpacity(node: LifeTreeNode, viewMode: LifeTreeViewMode) {
  if (activeNodesByMode[viewMode].includes(node.kind)) {
    return 'opacity-100'
  }
  return viewMode === 'detail' ? 'opacity-100' : 'opacity-35'
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2 text-xs last:border-b-0">
      <span className="shrink-0 text-[color:var(--text-muted)]">{label}</span>
      <span className="text-right text-[color:var(--text-secondary)]">{value}</span>
    </div>
  )
}

function LifeTreeDetail({ node, visualState }: { node: LifeTreeNode; visualState: LifeTreeVisualState }) {
  return (
    <aside className="min-h-0 rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-5 shadow-panel backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">selected object</div>
      <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">{node.title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[color:var(--text-secondary)]">
          {kindLabels[node.kind]}
        </span>
        <span className={clsx('rounded-full border px-2.5 py-1 text-xs', statusStyles[node.status])}>{statusLabels[node.status]}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[color:var(--text-secondary)]">{node.detail}</p>
      <div className="mt-5 rounded-[18px] border border-white/10 bg-black/10 px-4 py-2">
        <MetadataRow label="所属路径" value={node.path.join(' / ')} />
        <MetadataRow label="创建时间" value={formatDateTime(node.createdAt)} />
        <MetadataRow label="最近更新" value={formatDateTime(node.updatedAt)} />
        <MetadataRow label="当前状态" value={statusLabels[node.status]} />
        <MetadataRow label="来源" value={node.sourceType ? `${node.sourceType}${node.sourceId ? ` / ${node.sourceId}` : ''}` : 'mock'} />
      </div>
      <div className="mt-5 border-l border-emerald-200/40 pl-4">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">next</div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{node.nextStep}</p>
      </div>
      <div className="mt-5 rounded-[18px] border border-emerald-200/20 bg-emerald-200/8 px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">今日生命力影响</div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{getNodeVitalityHint(node.kind, visualState)}</p>
      </div>
    </aside>
  )
}

function DataSourceSummary({ data }: { data: { dataSource?: NonNullable<ReturnType<typeof buildLifeVitalityTreeFromAppData>['dataSource']> } }) {
  const source = data.dataSource
  if (!source) {
    return null
  }

  return (
    <div className="mt-4 rounded-[18px] border border-white/10 bg-black/10 px-4 py-2">
      <MetadataRow label="数据来源" value={source.label} />
      <MetadataRow label="节点数" value={String(source.nodeCount)} />
      <MetadataRow label="叶子" value={String(source.leafCount)} />
      <MetadataRow label="果实" value={String(source.fruitCount)} />
      <MetadataRow label="落叶" value={String(source.fallenLeafCount)} />
      <MetadataRow label="最近更新" value={formatDateTime(source.latestUpdatedAt)} />
    </div>
  )
}

export function LifeVitalityTreeCanvas() {
  const [viewMode, setViewMode] = useState<LifeTreeViewMode>('overview')
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('tree-core')
  const [vitalityCheck, setVitalityCheck] = useState<DailyVitalityCheck>(() => buildDailyVitalityCheck(createDefaultVitalityItems()))
  const tree = useWorkspaceStore((state) => state.tree)
  const recentReviews = useWorkspaceStore((state) => state.recentReviews)
  const weeklyReview = useWorkspaceStore((state) => state.weeklyReview)
  const mappedData = useMemo(
    () => buildLifeVitalityTreeFromAppData({ tree, recentReviews, weeklyReview }),
    [recentReviews, tree, weeklyReview]
  )
  const data = mappedData.nodes.length > 0 ? mappedData : lifeVitalityTreeMockData
  const isUsingFallback = data.dataSource?.mode === 'mock'
  const selectedNode = useMemo(
    () => data.nodes.find((node) => node.id === selectedNodeId) ?? data.nodes[0],
    [data.nodes, selectedNodeId]
  )
  const hoveredNode = useMemo(() => data.nodes.find((node) => node.id === hoveredNodeId) ?? null, [data.nodes, hoveredNodeId])
  const activeView = viewModes.find((mode) => mode.id === viewMode) ?? viewModes[0]
  const visualState = useMemo(() => buildLifeTreeVisualState(vitalityCheck), [vitalityCheck])

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4">
      <ShellCard className={clsx('relative min-h-0 overflow-hidden border-[color:var(--panel-border)] transition-colors duration-300', treeToneStyles[visualState.tone])}>
        <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-black/10 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-100/60">{data.title}</div>
              <div className="mt-1 flex flex-wrap items-end gap-3">
                <h2 className="text-xl font-semibold text-white">{data.headline}</h2>
                <span className="pb-1 text-xs text-emerald-100/65">
                  今日状态：{vitalitySeasonLabels[vitalityCheck.season]}｜{vitalitySeasonHints[vitalityCheck.season]}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/70">{data.description}</p>
              <div className="mt-3 rounded-[18px] border border-white/10 bg-black/15 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/50">今日树状态</div>
                <div className="mt-1 text-sm font-medium text-white">
                  {vitalitySeasonLabels[visualState.season]}｜{visualState.summary}
                </div>
                {visualState.warnings.length > 0 ? (
                  <div className="mt-2 text-xs leading-5 text-amber-100/80">风险：{visualState.warnings.join('、')}</div>
                ) : null}
                {visualState.highlights.length > 0 ? (
                  <div className="mt-1 text-xs leading-5 text-emerald-100/75">亮点：{visualState.highlights.join('、')}</div>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.metrics.map((metric) => (
                <div key={metric.label} className="min-w-24 border-l border-emerald-200/25 pl-3">
                  <div className="text-lg font-semibold text-white">{metric.value}</div>
                  <div className="text-xs text-emerald-100/60">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id)}
                className={clsx(
                  'rounded-2xl border px-3 py-2 text-sm transition',
                  viewMode === mode.id
                    ? 'border-emerald-200/55 bg-emerald-200/16 text-white shadow-[0_0_24px_rgba(110,231,183,0.16)]'
                    : 'border-white/10 bg-white/5 text-emerald-50/65 hover:border-emerald-200/35 hover:bg-white/10 hover:text-white'
                )}
                title={mode.hint}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-full min-h-[620px] pt-[178px]">
          <div className="absolute left-5 top-[198px] z-10 max-w-xs rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-emerald-50/70 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/50">current view</div>
            <div className="mt-1 font-medium text-white">{activeView.label}</div>
            <div className="mt-1 text-xs leading-5">{activeView.hint}</div>
          </div>

          <svg className="absolute inset-x-0 bottom-0 top-[140px] h-[calc(100%-140px)] w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lifeTreeTrunk" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(175, 230, 162, 0.62)" />
                <stop offset="100%" stopColor="rgba(92, 62, 35, 0.62)" />
              </linearGradient>
              <linearGradient id="lifeTreeSoil" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(97, 67, 42, 0.2)" />
                <stop offset="50%" stopColor="rgba(120, 83, 52, 0.58)" />
                <stop offset="100%" stopColor="rgba(97, 67, 42, 0.2)" />
              </linearGradient>
            </defs>
            <path d="M17 75 C28 69 39 67 50 70 C61 67 73 69 84 75 L84 91 C62 95 39 95 17 91 Z" fill="url(#lifeTreeSoil)" />
            <path d="M49 72 C48 62 49 51 50 39 C51 30 51 22 50 13" stroke="url(#lifeTreeTrunk)" strokeWidth="8" strokeLinecap="round" fill="none" />
            <path d="M50 41 C41 36 34 31 25 23" stroke="rgba(111, 204, 151, 0.48)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M51 38 C62 34 70 28 78 20" stroke="rgba(185, 218, 129, 0.5)" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M49 55 C39 55 31 52 22 47" stroke="rgba(69, 191, 164, 0.42)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M51 54 C61 55 70 53 79 49" stroke="rgba(249, 207, 111, 0.4)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M50 73 C43 81 36 85 29 88" stroke="rgba(125, 211, 252, 0.3)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M50 73 C58 82 65 86 73 88" stroke="rgba(125, 211, 252, 0.3)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M50 73 C49 83 49 88 49 94" stroke="rgba(125, 211, 252, 0.24)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <circle cx="58" cy="52" r="5.5" fill="none" stroke="rgba(165, 180, 252, 0.35)" strokeWidth="1.2" />
            <circle cx="58" cy="52" r="3.3" fill="none" stroke="rgba(165, 180, 252, 0.22)" strokeWidth="1" />
          </svg>

          <div className="absolute inset-x-0 bottom-0 top-[140px]">
            {data.nodes.map((node) => {
              const isSelected = selectedNode.id === node.id
              const isHovered = hoveredNode?.id === node.id
              return (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onFocus={() => setHoveredNodeId(node.id)}
                  onBlur={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={clsx(
                    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border px-2 text-center text-[11px] font-medium leading-tight shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-200',
                    nodeStyles[node.kind],
                    nodeModeOpacity(node, viewMode),
                    isSelected ? 'scale-110 ring-2 ring-white/55' : '',
                    isHovered ? 'scale-105 border-white/70' : ''
                  )}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <span className="line-clamp-2">{node.title}</span>
                </button>
              )
            })}
          </div>

          {hoveredNode ? (
            <div
              className="pointer-events-none absolute z-30 w-72 rounded-[20px] border border-emerald-200/35 bg-[rgba(4,16,14,0.88)] px-4 py-3 text-sm shadow-panel backdrop-blur-2xl"
              style={{
                left: `${Math.min(Math.max(hoveredNode.x, 18), 82)}%`,
                top: `${Math.max(hoveredNode.y - 5, 24)}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{hoveredNode.title}</div>
                  <div className="mt-1 text-xs text-emerald-100/60">
                    {kindLabels[hoveredNode.kind]} / {statusLabels[hoveredNode.status]}
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-emerald-100/70">
                  hover
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-emerald-50/75">{hoveredNode.summary}</p>
              <div className="mt-3 grid gap-1 text-[11px] text-emerald-50/55">
                <span>路径：{hoveredNode.path.join(' / ')}</span>
                <span>创建：{formatDateTime(hoveredNode.createdAt)}</span>
                <span>更新：{formatDateTime(hoveredNode.updatedAt)}</span>
              </div>
            </div>
          ) : null}
        </div>
      </ShellCard>

      <div className="grid min-h-0 grid-rows-[minmax(0,0.85fr)_minmax(0,1.15fr)_auto] gap-4">
        {viewMode === 'rings' ? (
          <aside className="min-h-0 overflow-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-5 shadow-panel backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">annual rings</div>
            <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">年轮视角</h3>
            <div className="mt-4 space-y-3">
              {data.rings.map((ring) => (
                <button
                  key={ring.id}
                  type="button"
                  onClick={() => setSelectedNodeId('ring-2026')}
                  className="block w-full rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-indigo-200/45 hover:bg-indigo-200/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-[color:var(--text-primary)]">{ring.year}</span>
                    <span className={clsx('rounded-full border px-2 py-1 text-[11px]', statusStyles[ring.status])}>{statusLabels[ring.status]}</span>
                  </div>
                  <div className="mt-2 text-sm text-[color:var(--text-secondary)]">{ring.title}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ring.keywords.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-[color:var(--text-muted)]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[color:var(--text-muted)]">{ring.summary}</p>
                </button>
              ))}
            </div>
          </aside>
        ) : (
          <LifeTreeDetail node={selectedNode} visualState={visualState} />
        )}

        <VitalityCheckPanel onChange={setVitalityCheck} />

        <aside className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-5 shadow-panel backdrop-blur-xl">
          <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">boundary</div>
          <DataSourceSummary data={data} />
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            <li>{isUsingFallback ? '当前没有可用 TreeSnapshot，已回退静态 mock。' : '当前为半真实映射，来自现有 TreeSnapshot / reviews / weekly review。'}</li>
            <li>不新增 SQLite 表，不改 IPC 主链路。</li>
            <li>旧 Obsidian Graph 文件保留为归档支线；本轮不做真实 3D。</li>
          </ul>
        </aside>
      </div>
    </main>
  )
}
