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

const objectMeaning: Record<LifeTreeNodeKind, { title: string; description: string }> = {
  tree: {
    title: '整树说明',
    description: '整树用于观察当前人生结构的总体生长状态，不把单一事件当作对人的评价。'
  },
  root: {
    title: '根系说明',
    description: '树根代表身体、情绪、关系、财富安全线、习惯和复盘经验等底层供给。'
  },
  trunk: {
    title: '树干说明',
    description: '树干代表人生主线和营养通道，用来观察长期方向是否还能被日常行动供给。'
  },
  trunk_vein: {
    title: '筋络说明',
    description: '筋络代表主干内部的具体主线，不等于任务数量，而是长期方向的供给路径。'
  },
  major_branch: {
    title: '大枝说明',
    description: '大枝代表学习、项目、财富、健康等主线模块，是人生主干向外展开的方向。'
  },
  minor_branch: {
    title: '小枝说明',
    description: '小枝代表主线下的具体方向或阶段，后续可以长出叶子、花和果实。'
  },
  leaf: {
    title: '叶子说明',
    description: '叶子代表普通行动或日常推进，只说明行动发生了，不代表成果已经形成。'
  },
  flower: {
    title: '花说明',
    description: '花代表阶段性完成或中间成果，下一步需要验证它是否能沉淀成果实。'
  },
  fruit: {
    title: '果实说明',
    description: '果实代表可验证、可交付、可复用或产生收益的成果，不泛化成所有完成任务。'
  },
  withered_leaf: {
    title: '枯叶说明',
    description: '枯叶代表拖延、未完成、中断或低活性状态，仍有恢复、复盘或放下的可能。'
  },
  fallen_leaf: {
    title: '落叶说明',
    description: '落叶代表已发生的问题、失败或失控事件。它不是失败审判，而是复盘转化入口。'
  },
  soil: {
    title: '土壤说明',
    description: '土壤承接已复盘的失败、归因、调整和规则候选。根系养分本轮也暂存在土壤候选中。'
  },
  annual_ring: {
    title: '年轮说明',
    description: '年轮记录年度主线、成果、伤痕和生命力变化，后续可沉淀长期阶段总结。'
  }
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

type VisualLifeNodeKind = 'root' | 'trunk' | 'branch' | 'leaf' | 'fruit' | 'withered'

type TreeVisualNode = {
  node: LifeTreeNode
  visualKind: VisualLifeNodeKind
  treeX: number
  treeY: number
  branchAnchor: { x: number; y: number }
  isActive: boolean
  isRepairSignal: boolean
}

type TreeBranchPath = {
  id: string
  d: string
  visualKind: VisualLifeNodeKind
  isActive: boolean
  isRepairSignal: boolean
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

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function inferVisualLifeNodeKind(node: LifeTreeNode): VisualLifeNodeKind {
  const text = `${node.title} ${node.path.join(' ')} ${node.summary}`.toLowerCase()
  const isRepairSignal =
    node.kind === 'withered_leaf' ||
    node.kind === 'fallen_leaf' ||
    node.status === 'withered' ||
    node.status === 'paused' ||
    includesAny(text, ['debt', 'overdue', 'withered', '负债', '拖延', '停滞', '中断', '失控', '枯萎'])

  if (isRepairSignal) {
    return 'withered'
  }
  if (node.kind === 'root' || node.kind === 'soil' || includesAny(text, ['root', 'base', 'foundation', '根', '土壤', '健康', '习惯'])) {
    return 'root'
  }
  if (node.kind === 'tree' || node.kind === 'trunk' || node.kind === 'trunk_vein') {
    return 'trunk'
  }
  if (node.kind === 'fruit' || node.kind === 'flower' || includesAny(text, ['achievement', 'milestone', '成果', '完成', '果实', '开花'])) {
    return 'fruit'
  }
  if (node.kind === 'major_branch' || node.kind === 'minor_branch' || includesAny(text, ['project', 'branch', '项目', '学习', '财富', '人际', '关系'])) {
    return 'branch'
  }
  return 'leaf'
}

function isNodeActive(node: LifeTreeNode) {
  const timestamp = new Date(node.updatedAt).getTime()
  if (!Number.isFinite(timestamp)) {
    return node.status === 'growing'
  }
  return node.status === 'growing' || node.status === 'harvesting' || Date.now() - timestamp <= 7 * 86_400_000
}

const branchAnchors = [
  { x: 32, y: 33 },
  { x: 68, y: 34 },
  { x: 24, y: 48 },
  { x: 76, y: 49 },
  { x: 39, y: 24 },
  { x: 61, y: 24 }
]

const leafOffsets = [
  { x: -9, y: -11 },
  { x: 9, y: -12 },
  { x: -13, y: 2 },
  { x: 13, y: 1 },
  { x: -5, y: 11 },
  { x: 6, y: 10 }
]

const rootPositions = [
  { x: 43, y: 82 },
  { x: 54, y: 86 },
  { x: 35, y: 78 },
  { x: 64, y: 79 },
  { x: 49, y: 91 }
]

const trunkPositions = [
  { x: 50, y: 29 },
  { x: 50, y: 55 },
  { x: 46, y: 46 },
  { x: 54, y: 45 },
  { x: 50, y: 39 }
]

function pickBranchAnchor(node: LifeTreeNode, index: number) {
  const text = `${node.title} ${node.path.join(' ')}`.toLowerCase()
  if (includesAny(text, ['学习', 'c++', '英语', 'ability', '认知'])) {
    return branchAnchors[0]
  }
  if (includesAny(text, ['项目', 'project', 'workflow', 'life curve', 'growth-tree'])) {
    return branchAnchors[1]
  }
  if (includesAny(text, ['健康', '身体', '运动', '习惯', 'root'])) {
    return branchAnchors[2]
  }
  if (includesAny(text, ['财富', '时间', '负债', 'wealth', 'debt'])) {
    return branchAnchors[3]
  }
  return branchAnchors[index % branchAnchors.length]
}

function buildTreeVisualNodes(nodes: LifeTreeNode[]): TreeVisualNode[] {
  const counters: Record<VisualLifeNodeKind, number> = {
    root: 0,
    trunk: 0,
    branch: 0,
    leaf: 0,
    fruit: 0,
    withered: 0
  }

  return nodes.map((node, index) => {
    const visualKind = inferVisualLifeNodeKind(node)
    const visualIndex = counters[visualKind]++
    const branchAnchor = pickBranchAnchor(node, index)
    const offset = leafOffsets[visualIndex % leafOffsets.length]
    const isRepairSignal = visualKind === 'withered'
    const isActive = isNodeActive(node)
    let treeX = node.x
    let treeY = node.y

    if (visualKind === 'trunk') {
      const position = trunkPositions[visualIndex % trunkPositions.length]
      treeX = position.x + Math.floor(visualIndex / trunkPositions.length) * 2
      treeY = position.y
    } else if (visualKind === 'root') {
      const position = rootPositions[visualIndex % rootPositions.length]
      treeX = position.x + Math.floor(visualIndex / rootPositions.length) * 2
      treeY = position.y
    } else if (visualKind === 'branch') {
      treeX = branchAnchor.x
      treeY = branchAnchor.y
    } else if (visualKind === 'fruit') {
      treeX = branchAnchor.x + offset.x * 0.75
      treeY = branchAnchor.y + offset.y - 4
    } else if (visualKind === 'withered') {
      treeX = branchAnchor.x + offset.x
      treeY = Math.min(78, branchAnchor.y + Math.abs(offset.y) + 18)
    } else {
      treeX = branchAnchor.x + offset.x
      treeY = branchAnchor.y + offset.y
    }

    return {
      node,
      visualKind,
      treeX: Math.max(12, Math.min(88, treeX)),
      treeY: Math.max(14, Math.min(92, treeY)),
      branchAnchor,
      isActive,
      isRepairSignal
    }
  })
}

function buildBranchPaths(visualNodes: TreeVisualNode[]): TreeBranchPath[] {
  return visualNodes
    .filter((item) => item.visualKind !== 'trunk')
    .map((item) => {
      if (item.visualKind === 'root') {
        return {
          id: `root-${item.node.id}`,
          d: `M50 72 C${item.treeX} 77 ${item.treeX} 81 ${item.treeX} ${item.treeY}`,
          visualKind: item.visualKind,
          isActive: item.isActive,
          isRepairSignal: item.isRepairSignal
        }
      }
      if (item.visualKind === 'branch') {
        return {
          id: `branch-${item.node.id}`,
          d: `M50 45 C${(50 + item.treeX) / 2} ${item.treeY - 7} ${item.treeX - (item.treeX < 50 ? -4 : 4)} ${item.treeY} ${item.treeX} ${item.treeY}`,
          visualKind: item.visualKind,
          isActive: item.isActive,
          isRepairSignal: item.isRepairSignal
        }
      }
      return {
        id: `leaf-${item.node.id}`,
        d: `M${item.branchAnchor.x} ${item.branchAnchor.y} C${(item.branchAnchor.x + item.treeX) / 2} ${item.branchAnchor.y - 3} ${(item.branchAnchor.x + item.treeX) / 2} ${item.treeY + 3} ${item.treeX} ${item.treeY}`,
        visualKind: item.visualKind,
        isActive: item.isActive,
        isRepairSignal: item.isRepairSignal
      }
    })
}

function getVisualNodeStyle(visualNode: TreeVisualNode) {
  const styles: Record<VisualLifeNodeKind, string> = {
    root: 'min-h-8 w-28 rounded-full border-stone-300/55 bg-stone-950/88 text-stone-100',
    trunk: 'min-h-11 w-36 rounded-full border-emerald-200/75 bg-emerald-950/90 text-emerald-50 shadow-[0_0_42px_rgba(16,185,129,0.28)]',
    branch: 'min-h-9 w-32 rounded-full border-teal-200/65 bg-slate-950/88 text-teal-50',
    leaf: 'min-h-8 w-28 rounded-full border-green-300/55 bg-slate-950/84 text-green-50',
    fruit: 'min-h-9 w-32 rounded-full border-amber-200/80 bg-amber-950/80 text-amber-50 shadow-[0_0_34px_rgba(245,158,11,0.22)]',
    withered: 'min-h-8 w-32 rounded-full border-stone-400/45 bg-stone-950/70 text-stone-200 opacity-80'
  }
  return styles[visualNode.visualKind]
}

function getBranchStroke(path: TreeBranchPath) {
  if (path.visualKind === 'root') {
    return 'rgba(125, 211, 252, 0.32)'
  }
  if (path.visualKind === 'fruit') {
    return 'rgba(245, 158, 11, 0.5)'
  }
  if (path.isRepairSignal) {
    return 'rgba(168, 162, 158, 0.34)'
  }
  if (path.visualKind === 'branch') {
    return path.isActive ? 'rgba(52, 211, 153, 0.62)' : 'rgba(45, 212, 191, 0.38)'
  }
  return path.isActive ? 'rgba(134, 239, 172, 0.42)' : 'rgba(148, 163, 184, 0.24)'
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2 text-xs last:border-b-0">
      <span className="shrink-0 text-[color:var(--text-muted)]">{label}</span>
      <span className="text-right text-[color:var(--text-secondary)]">{value}</span>
    </div>
  )
}

function formatCount(value: number) {
  return value > 0 ? String(value) : '暂无'
}

function isWithinDays(date: string, days: number) {
  const timestamp = new Date(date).getTime()
  if (!Number.isFinite(timestamp)) {
    return false
  }
  return Date.now() - timestamp <= days * 86_400_000
}

function buildGlobalVitalityStats({
  data,
  visualState,
  activeView,
  isUsingFallback
}: {
  data: ReturnType<typeof buildLifeVitalityTreeFromAppData>
  visualState: LifeTreeVisualState
  activeView: (typeof viewModes)[number]
  isUsingFallback: boolean
}) {
  const activeNodes = data.nodes.filter((node) => isWithinDays(node.updatedAt, 7))
  const newNodes = data.nodes.filter((node) => isWithinDays(node.createdAt, 7))
  const repairSignals = data.nodes.filter((node) => node.kind === 'withered_leaf' || node.kind === 'fallen_leaf' || node.status === 'withered')
  const activeBranchLabels = Array.from(
    new Set(
      activeNodes
        .filter((node) => {
          const visualKind = inferVisualLifeNodeKind(node)
          return visualKind === 'branch' || visualKind === 'leaf' || visualKind === 'fruit'
        })
        .map((node) => node.path[0] || node.title)
        .filter(Boolean)
    )
  ).slice(0, 4)
  const latestNode = data.nodes
    .filter((node) => Number.isFinite(new Date(node.updatedAt).getTime()))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  const trunkStability =
    visualState.warnings.length === 0 && repairSignals.length === 0
      ? '稳定'
      : visualState.warnings.length <= 1 && repairSignals.length <= 2
        ? '可修复'
        : '需要减压'

  return {
    totalNodes: data.nodes.length,
    activeCount: activeNodes.length,
    newCount: newNodes.length,
    repairSignalCount: repairSignals.length,
    leafCount: data.nodes.filter((node) => node.kind === 'leaf').length,
    flowerCount: data.nodes.filter((node) => node.kind === 'flower').length,
    fruitCount: data.nodes.filter((node) => node.kind === 'fruit').length,
    soilCount: data.nodes.filter((node) => node.kind === 'soil').length,
    currentStage: 'V0.6 视觉骨架',
    currentView: activeView.label,
    currentStatus: visualState.summary,
    trunkStability,
    activeBranchSummary: activeBranchLabels.length > 0 ? activeBranchLabels.join(' / ') : '暂无明确活跃枝干',
    repairSummary: repairSignals.length > 0 ? `${repairSignals.length} 个待修复信号` : '暂无明显枯萎 / 时间负债信号',
    sourceMode: isUsingFallback ? 'Mock fallback' : 'TreeSnapshot / Reviews mapped',
    latestLabel: latestNode ? `${latestNode.title} / ${formatDateTime(latestNode.updatedAt)}` : '暂无最近滋养记录'
  }
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">{value}</div>
    </div>
  )
}

function GlobalVitalityPanel({
  stats,
  visualState
}: {
  stats: ReturnType<typeof buildGlobalVitalityStats>
  visualState: LifeTreeVisualState
}) {
  return (
    <aside className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-4 shadow-panel backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">global vitality</div>
      <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">全局生命力</h3>
      <p className="mt-3 text-sm leading-5 text-[color:var(--text-secondary)]">
        点击树中的任意节点查看详情。当前展示这棵树的整体树态和阅读方式。
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <StatTile label="节点总数" value={formatCount(stats.totalNodes)} />
        <StatTile label="最近活跃" value={formatCount(stats.activeCount)} />
        <StatTile label="本周新增" value={formatCount(stats.newCount)} />
        <StatTile label="待修复信号" value={formatCount(stats.repairSignalCount)} />
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-black/10 px-4 py-2">
        <MetadataRow label="生长阶段" value={stats.currentStage} />
        <MetadataRow label="主干稳定度" value={stats.trunkStability} />
        <MetadataRow label="活跃枝干" value={stats.activeBranchSummary} />
        <MetadataRow label="待修复信号" value={stats.repairSummary} />
        <MetadataRow label="最近滋养" value={stats.latestLabel} />
      </div>

      <div className="mt-4 rounded-[18px] border border-emerald-200/20 bg-emerald-200/8 px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">当前树态</div>
        <p className="mt-2 text-sm leading-5 text-[color:var(--text-secondary)]">{stats.currentStatus}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[color:var(--text-secondary)]">
          <span>叶子：{formatCount(stats.leafCount)}</span>
          <span>花：{formatCount(stats.flowerCount)}</span>
          <span>果实：{formatCount(stats.fruitCount)}</span>
          <span>土壤：{formatCount(stats.soilCount)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-black/10 px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">这棵树如何阅读</div>
        <div className="mt-3 space-y-1.5 text-sm leading-5 text-[color:var(--text-secondary)]">
          <p>根系 = 基础习惯、身体能量、复盘经验和长期生命力。</p>
          <p>树干 = 当前主线与稳定能力，是底层供给通向各模块的通道。</p>
          <p>主枝 = 学习、项目、财富、健康等人生模块。</p>
          <p>叶子 = 每日行动与复盘记录；果实 = 可验证或可复用的阶段成果。</p>
          <p>枯萎 = 时间负债、拖延、失衡或待修复信号，不是失败审判。</p>
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">预留状态</div>
        <p className="mt-2 text-sm leading-5 text-[color:var(--text-secondary)]">
          TreeSnapshot 接入状态：{stats.sourceMode}。3D Prototype 暂未启用，本轮只做 2D 树形视觉骨架。
        </p>
      </div>

      {stats.totalNodes === 0 ? (
        <p className="mt-4 rounded-[18px] border border-white/10 bg-black/10 px-4 py-3 text-sm leading-5 text-[color:var(--text-secondary)]">
          当前还没有足够的生长数据。你可以先添加复盘、目标或行动记录，系统会逐步生成树的枝叶状态。
        </p>
      ) : null}

      {visualState.warnings.length > 0 ? (
        <div className="mt-4 rounded-[18px] border border-amber-200/25 bg-amber-200/10 px-4 py-3 text-sm leading-5 text-amber-100">
          {visualState.warnings.join('、')}
        </div>
      ) : null}
    </aside>
  )
}

function LifeTreeDetail({ node, visualState }: { node: LifeTreeNode; visualState: LifeTreeVisualState }) {
  return (
    <aside className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-4 shadow-panel backdrop-blur-xl">
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
      <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{objectMeaning[node.kind].title}</div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{objectMeaning[node.kind].description}</p>
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
      <MetadataRow label="花" value={String(source.flowerCount ?? 0)} />
      <MetadataRow label="果实" value={String(source.fruitCount)} />
      <MetadataRow label="枯叶" value={String(source.witheredLeafCount ?? 0)} />
      <MetadataRow label="落叶/枯叶" value={String(source.fallenLeafCount)} />
      <MetadataRow label="土壤候选" value={String(source.soilCount ?? 0)} />
      <MetadataRow label="最近更新" value={formatDateTime(source.latestUpdatedAt)} />
    </div>
  )
}

export function LifeVitalityTreeCanvas() {
  const [viewMode, setViewMode] = useState<LifeTreeViewMode>('overview')
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
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
    () => (selectedNodeId ? data.nodes.find((node) => node.id === selectedNodeId) ?? null : null),
    [data.nodes, selectedNodeId]
  )
  const hoveredNode = useMemo(() => data.nodes.find((node) => node.id === hoveredNodeId) ?? null, [data.nodes, hoveredNodeId])
  const activeView = viewModes.find((mode) => mode.id === viewMode) ?? viewModes[0]
  const visualState = useMemo(() => buildLifeTreeVisualState(vitalityCheck), [vitalityCheck])
  const globalStats = useMemo(
    () => buildGlobalVitalityStats({ data, visualState, activeView, isUsingFallback }),
    [activeView, data, isUsingFallback, visualState]
  )
  const visualNodes = useMemo(() => buildTreeVisualNodes(data.nodes), [data.nodes])
  const branchPaths = useMemo(() => buildBranchPaths(visualNodes), [visualNodes])
  const hoveredVisualNode = useMemo(() => visualNodes.find((item) => item.node.id === hoveredNodeId) ?? null, [hoveredNodeId, visualNodes])

  return (
    <main className="grid h-full min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] gap-4 overflow-hidden">
      <ShellCard className={clsx('relative h-full min-h-0 overflow-hidden border-[color:var(--panel-border)] transition-colors duration-300', treeToneStyles[visualState.tone])}>
        <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-black/25 px-5 py-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-100/60">{data.title}</div>
              <div className="mt-1 flex flex-wrap items-end gap-3">
                <h2 className="text-xl font-semibold text-white">{data.headline}</h2>
                <span className="pb-1 text-xs text-emerald-100/65">
                  今日状态：{vitalitySeasonLabels[vitalityCheck.season]}｜{vitalitySeasonHints[vitalityCheck.season]}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-50/70">{data.description}</p>
              <div className="mt-2 flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/50">今日树状态</span>
                <span className="text-sm font-medium text-white">{vitalitySeasonLabels[visualState.season]}｜{visualState.summary}</span>
                {visualState.warnings.length > 0 ? (
                  <span className="text-xs leading-5 text-amber-100/80">风险：{visualState.warnings.join('、')}</span>
                ) : null}
                {visualState.highlights.length > 0 ? (
                  <span className="text-xs leading-5 text-emerald-100/75">亮点：{visualState.highlights.join('、')}</span>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {data.metrics.map((metric) => (
                <div key={metric.label} className="min-w-20 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                  <div className="text-base font-semibold text-white">{metric.value}</div>
                  <div className="text-[11px] text-emerald-100/60">{metric.label}</div>
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

        <div className="relative h-full min-h-[620px] pt-[160px]">
          <div className="absolute right-5 top-[178px] z-20 w-72 rounded-[18px] border border-slate-700/70 bg-slate-950/90 px-4 py-3 text-sm text-slate-200 shadow-2xl backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/50">current view</div>
            <div className="mt-1 font-medium text-white">{activeView.label}</div>
            <div className="mt-1 text-xs leading-5">{activeView.hint}</div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[140px] bg-[radial-gradient(circle_at_50%_42%,rgba(34,197,94,0.16),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-emerald-950/45 to-transparent" />

          <svg className="absolute inset-x-0 bottom-0 top-[140px] h-[calc(100%-140px)] w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lifeTreeTrunkV06" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(132, 204, 22, 0.2)" />
                <stop offset="45%" stopColor="rgba(20, 184, 166, 0.46)" />
                <stop offset="100%" stopColor="rgba(34, 197, 94, 0.22)" />
              </linearGradient>
              <linearGradient id="lifeTreeSoilV06" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(68, 64, 60, 0.08)" />
                <stop offset="50%" stopColor="rgba(87, 83, 78, 0.5)" />
                <stop offset="100%" stopColor="rgba(68, 64, 60, 0.08)" />
              </linearGradient>
            </defs>
            <path d="M12 76 C25 69 37 69 50 72 C63 69 76 69 88 76 L88 93 C66 98 34 98 12 93 Z" fill="url(#lifeTreeSoilV06)" />
            <path d="M50 74 C47 63 49 54 50 44 C51 33 51 25 50 17" stroke="rgba(3, 7, 18, 0.32)" strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M50 74 C47 63 49 54 50 44 C51 33 51 25 50 17" stroke="url(#lifeTreeTrunkV06)" strokeWidth="7.5" strokeLinecap="round" fill="none" />
            <path d="M47 73 C38 82 30 87 20 90" stroke="rgba(125, 211, 252, 0.24)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M50 73 C50 82 49 88 49 94" stroke="rgba(125, 211, 252, 0.2)" strokeWidth="1.7" strokeLinecap="round" fill="none" />
            <path d="M53 73 C62 82 70 87 80 90" stroke="rgba(125, 211, 252, 0.24)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {branchPaths.map((path) => (
              <path
                key={path.id}
                d={path.d}
                stroke={getBranchStroke(path)}
                strokeWidth={path.visualKind === 'branch' ? 3.6 : path.visualKind === 'root' ? 1.8 : 1.35}
                strokeLinecap="round"
                strokeDasharray={path.isRepairSignal ? '2.8 3.4' : undefined}
                fill="none"
              />
            ))}
            <circle cx="50" cy="44" r="15" fill="rgba(34,197,94,0.04)" stroke="rgba(134,239,172,0.08)" strokeWidth="1" />
            <circle cx="50" cy="44" r="8" fill="rgba(20,184,166,0.05)" stroke="rgba(94,234,212,0.1)" strokeWidth="0.8" />
          </svg>

          <div className="absolute inset-x-0 bottom-0 top-[140px]">
            {visualNodes.map((visualNode) => {
              const node = visualNode.node
              const isSelected = selectedNode?.id === node.id
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
                    'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border px-3 py-1.5 text-center text-[11px] font-medium leading-tight shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-200 hover:bg-slate-900/95',
                    getVisualNodeStyle(visualNode),
                    nodeModeOpacity(node, viewMode),
                    isSelected ? 'z-30 scale-110 ring-2 ring-white/70' : '',
                    isHovered ? 'z-30 scale-105 border-white/75 shadow-[0_20px_60px_rgba(16,185,129,0.22)]' : ''
                  )}
                  style={{ left: `${visualNode.treeX}%`, top: `${visualNode.treeY}%` }}
                >
                  <span className="line-clamp-2">{node.title}</span>
                </button>
              )
            })}
          </div>

          {hoveredNode ? (
            <div
              className="pointer-events-none absolute z-40 w-72 rounded-[20px] border border-emerald-200/35 bg-slate-950/95 px-4 py-3 text-sm shadow-2xl backdrop-blur-2xl"
              style={{
                left: `${Math.min(Math.max(hoveredVisualNode?.treeX ?? hoveredNode.x, 18), 82)}%`,
                top: `${Math.max((hoveredVisualNode?.treeY ?? hoveredNode.y) - 5, 24)}%`,
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

      <aside className="h-full min-h-0 overflow-y-auto overscroll-contain pr-1">
        <div className="space-y-4 pb-8">
          {viewMode === 'rings' ? (
            <section className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-4 shadow-panel backdrop-blur-xl">
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
            </section>
          ) : (
            selectedNode ? <LifeTreeDetail node={selectedNode} visualState={visualState} /> : <GlobalVitalityPanel stats={globalStats} visualState={visualState} />
          )}

          <VitalityCheckPanel onChange={setVitalityCheck} />

          <section className="rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--graph-overlay-bg)] p-4 shadow-panel backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">boundary</div>
            <DataSourceSummary data={data} />
            <ul className="mt-3 space-y-1.5 text-sm leading-5 text-[color:var(--text-secondary)]">
              <li>{isUsingFallback ? '当前没有可用 TreeSnapshot，已回退静态 mock。' : '当前为半真实映射，来自现有 TreeSnapshot / reviews / weekly review。'}</li>
              <li>不新增 SQLite 表，不改 IPC 主链路。</li>
              <li>旧 Obsidian Graph 文件保留为归档支线；本轮不做真实 3D。</li>
            </ul>
          </section>
        </div>
      </aside>
    </main>
  )
}
