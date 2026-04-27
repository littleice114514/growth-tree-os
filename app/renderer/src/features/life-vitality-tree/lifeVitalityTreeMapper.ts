import type { NodeStatus, NodeType, ReviewRecord, TreeNodeView, TreeSnapshot, WeeklyReviewSummary } from '@shared/contracts'
import { lifeVitalityTreeMockData } from './lifeVitalityTreeMockData'
import type { LifeTreeAnnualRing, LifeTreeNode, LifeTreeNodeKind, LifeTreeStatus, LifeVitalityTree } from './lifeVitalityTreeTypes'

type BuildLifeVitalityTreeInput = {
  tree: TreeSnapshot | null
  recentReviews: ReviewRecord[]
  weeklyReview: WeeklyReviewSummary | null
}

const MAINLINE_POSITIONS = [
  { x: 28, y: 37 },
  { x: 70, y: 38 },
  { x: 22, y: 50 },
  { x: 78, y: 51 },
  { x: 36, y: 27 },
  { x: 64, y: 27 }
]

const NODE_POSITIONS = [
  { x: 20, y: 18 },
  { x: 30, y: 21 },
  { x: 72, y: 19 },
  { x: 81, y: 30 },
  { x: 18, y: 63 },
  { x: 72, y: 68 },
  { x: 38, y: 17 },
  { x: 62, y: 16 },
  { x: 24, y: 28 },
  { x: 76, y: 42 },
  { x: 33, y: 62 },
  { x: 66, y: 60 }
]

function latestDate(values: string[]) {
  const sorted = values.filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return sorted[0] ?? lifeVitalityTreeMockData.nodes[0]?.updatedAt ?? new Date().toISOString()
}

function mapStatus(status: NodeStatus): LifeTreeStatus {
  if (status === 'new' || status === 'growing' || status === 'restarted') {
    return 'growing'
  }
  if (status === 'stable') {
    return 'stable'
  }
  if (status === 'review') {
    return 'repairing'
  }
  if (status === 'dormant') {
    return 'paused'
  }
  return 'unknown'
}

function mapKind(node: TreeNodeView): LifeTreeNodeKind {
  if (node.nodeType === 'mainline') {
    return 'major_branch'
  }
  if (node.nodeType === 'achievement') {
    return 'fruit'
  }
  if (node.nodeType === 'issue') {
    return node.status === 'dormant' || node.status === 'review' ? 'withered_leaf' : 'fallen_leaf'
  }
  if (node.nodeType === 'habit') {
    return 'leaf'
  }
  if (node.nodeType === 'method') {
    return 'flower'
  }
  return 'minor_branch'
}

function nodeTypeLabel(nodeType: NodeType) {
  const labels: Record<NodeType, string> = {
    mainline: '主线',
    ability: '能力',
    habit: '习惯',
    method: '方法',
    issue: '问题',
    cognition: '认知',
    achievement: '成果'
  }
  return labels[nodeType]
}

function countNodes(tree: TreeSnapshot | null, predicate: (node: TreeNodeView) => boolean) {
  return tree?.nodes.filter(predicate).length ?? 0
}

function buildReviewRings(recentReviews: ReviewRecord[]): LifeTreeAnnualRing[] {
  if (recentReviews.length === 0) {
    return lifeVitalityTreeMockData.rings
  }

  const reviewsByYear = new Map<number, ReviewRecord[]>()
  recentReviews.forEach((review) => {
    const year = new Date(review.reviewDate || review.createdAt).getFullYear()
    const group = reviewsByYear.get(year) ?? []
    group.push(review)
    reviewsByYear.set(year, group)
  })

  return Array.from(reviewsByYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, reviews]) => {
      const newest = latestDate(reviews.map((review) => review.updatedAt))
      return {
        id: `ring-${year}`,
        year,
        title: `${year} 年复盘年轮`,
        status: reviews.length >= 3 ? 'growing' : 'stable',
        keywords: ['复盘', `${reviews.length} 条记录`, '半真实映射'],
        summary: `这一圈年轮来自 ${reviews.length} 条近期复盘记录，最近更新时间 ${newest.slice(0, 10)}。`,
        nextStep: '后续可接入年度复盘总结，目前只做按年份聚合。',
        sourceType: 'review',
        sourceId: String(year)
      }
    })
}

function buildBaseNodes(input: BuildLifeVitalityTreeInput, updatedAt: string): LifeTreeNode[] {
  const reviewCount = input.recentReviews.length
  const windowLabel = input.weeklyReview ? `${input.weeklyReview.windowStart.slice(0, 10)} - ${input.weeklyReview.windowEnd.slice(0, 10)}` : '暂无周回看窗口'
  const totalNodes = input.tree?.nodes.length ?? 0

  return [
    {
      id: 'tree-core',
      title: '整棵人生生长树',
      kind: 'tree',
      status: totalNodes > 0 ? 'growing' : 'unknown',
      path: ['人生生长树'],
      createdAt: input.tree?.nodes[0]?.createdAt ?? lifeVitalityTreeMockData.nodes[0].createdAt,
      updatedAt,
      summary: `当前映射 ${totalNodes} 个成长树节点、${reviewCount} 条近期复盘。`,
      detail: `Life Vitality Tree v0.2 通过 renderer adapter 读取现有 TreeSnapshot、recentReviews 和 weeklyReview。周回看窗口：${windowLabel}。`,
      nextStep: '继续观察半真实映射是否能表达主线、行动、成果和修复状态。',
      x: 50,
      y: 13,
      sourceType: 'tree_snapshot'
    },
    {
      id: 'root-system',
      title: '底层根系',
      kind: 'root',
      status: reviewCount > 0 ? 'repairing' : 'unknown',
      path: ['人生生长树', '树根'],
      createdAt: input.recentReviews.at(-1)?.createdAt ?? lifeVitalityTreeMockData.nodes[1].createdAt,
      updatedAt,
      summary: `根系暂由复盘活跃度代理观察：近期复盘 ${reviewCount} 条。`,
      detail: '树根仍不绑定数据库字段，当前只把近期复盘和周回看窗口作为底层供给的弱信号。',
      nextStep: '后续再接入健康、财富安全线、关系支持等真实字段。',
      x: 50,
      y: 82,
      sourceType: 'review'
    },
    {
      id: 'soil-review',
      title: '复盘土壤',
      kind: 'soil',
      status: reviewCount > 0 ? 'stable' : 'unknown',
      path: ['人生生长树', '土壤'],
      createdAt: input.recentReviews.at(-1)?.createdAt ?? lifeVitalityTreeMockData.nodes[2].createdAt,
      updatedAt,
      summary: `土壤层承接 ${reviewCount} 条近期复盘，窗口：${windowLabel}。`,
      detail: 'v0.2 只把 review 记录聚合为土壤信号，不判断好坏，不做 AI 总结。',
      nextStep: '等失败复盘、年度复盘稳定后，再定义落叶入土规则。',
      x: 44,
      y: 74,
      sourceType: 'review'
    },
    {
      id: 'trunk-mainline',
      title: '人生主干',
      kind: 'trunk',
      status: totalNodes > 0 ? 'stable' : 'unknown',
      path: ['人生生长树', '树干'],
      createdAt: input.tree?.nodes[0]?.createdAt ?? lifeVitalityTreeMockData.nodes[3].createdAt,
      updatedAt,
      summary: `主干由 ${input.tree?.mainlines.length ?? 0} 条主线和 ${totalNodes} 个节点共同映射。`,
      detail: '树干仍是人生主线与营养通道。v0.2 不改原始节点逻辑，只把现有 tree snapshot 转译到生命树对象。',
      nextStep: '继续验证主线数量、节点状态和成果节点是否能形成可理解的树形。',
      x: 50,
      y: 55,
      sourceType: 'tree_snapshot'
    }
  ]
}

function buildMainlineNodes(tree: TreeSnapshot): LifeTreeNode[] {
  return tree.mainlines.reduce<LifeTreeNode[]>((nodes, mainline, index) => {
    const source = tree.nodes.find((node) => node.id === mainline.nodeId || node.domain === mainline.domain)
    if (!source) {
      return nodes
    }
    const position = MAINLINE_POSITIONS[index % MAINLINE_POSITIONS.length]
    nodes.push({
      id: `life-mainline-${source.id}`,
      title: source.title || mainline.domain,
      kind: index % 2 === 0 ? 'major_branch' : 'trunk_vein',
      status: mapStatus(source.status),
      path: ['人生生长树', '树干', mainline.domain],
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
      summary: `${mainline.domain} 主线来自现有 TreeSnapshot。`,
      detail: `${source.title} 是现有成长树中的 ${nodeTypeLabel(source.nodeType)} 节点，当前状态 ${source.status}，证据数 ${source.evidenceCount}。`,
      nextStep: '后续可根据该主线下的节点数量和最近活跃时间调整枝干权重。',
      x: position.x,
      y: position.y,
      sourceType: 'tree_snapshot',
      sourceId: source.id
    })
    return nodes
  }, [])
}

function buildMappedNodes(tree: TreeSnapshot): LifeTreeNode[] {
  return tree.nodes
    .filter((node) => node.nodeType !== 'mainline')
    .slice(0, 12)
    .map((node, index) => {
      const position = NODE_POSITIONS[index % NODE_POSITIONS.length]
      const kind = mapKind(node)
      return {
        id: `life-node-${node.id}`,
        title: node.title,
        kind,
        status: kind === 'fruit' ? 'harvesting' : mapStatus(node.status),
        path: ['人生生长树', node.domain, nodeTypeLabel(node.nodeType), node.title],
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        summary: node.description || `${node.title} 来自现有成长树节点。`,
        detail: `${node.title} 映射自 ${node.domain} / ${nodeTypeLabel(node.nodeType)}。原始状态 ${node.status}，证据数 ${node.evidenceCount}，最近活跃 ${node.lastActiveAt.slice(0, 10)}。`,
        nextStep: node.needsReview ? '该节点在原始成长树中待回看，可优先进入修复或复盘。' : '继续观察它是否持续喂养对应人生主线。',
        x: position.x,
        y: position.y,
        sourceType: 'tree_snapshot',
        sourceId: node.id
      }
    })
}

export function buildLifeVitalityTreeFromAppData(input: BuildLifeVitalityTreeInput): LifeVitalityTree {
  if (!input.tree || input.tree.nodes.length === 0) {
    return lifeVitalityTreeMockData
  }

  const updatedAt = latestDate(input.tree.nodes.map((node) => node.updatedAt))
  const mainlineNodes = buildMainlineNodes(input.tree)
  const mappedNodes = buildMappedNodes(input.tree)
  const nodes = [...buildBaseNodes(input, updatedAt), ...mainlineNodes, ...mappedNodes]
  const rings = buildReviewRings(input.recentReviews)

  return {
    title: 'Life Vitality Tree Canvas',
    ownerName: 'Me',
    season: input.weeklyReview?.restartedNodesCount ? 'spring' : input.weeklyReview?.dormantNodesCount ? 'winter' : 'mixed',
    headline: '人生生长树 v0.2',
    description: '半真实映射阶段：从现有 TreeSnapshot、近期复盘和周回看生成生命树对象，不改数据库，不新增 IPC。',
    metrics: [
      { label: '主线筋络', value: String(input.tree.mainlines.length) },
      { label: '行动/叶片', value: String(countNodes(input.tree, (node) => node.nodeType !== 'mainline')) },
      { label: '阶段成果', value: String(countNodes(input.tree, (node) => node.nodeType === 'achievement')) },
      {
        label: '修复事项',
        value: String(countNodes(input.tree, (node) => node.nodeType === 'issue' || node.status === 'dormant' || node.status === 'review'))
      }
    ],
    nodes: nodes.length > 0 ? nodes : lifeVitalityTreeMockData.nodes,
    rings
  }
}
