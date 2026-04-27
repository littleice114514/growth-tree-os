import type { ReviewRecord, TreeNodeView, TreeSnapshot, WeeklyReviewSummary } from '@shared/contracts'
import { lifeVitalityTreeMockData } from './lifeVitalityTreeMockData'
import type {
  LifeTreeAnnualRing,
  LifeTreeNode,
  LifeTreeNodeKind,
  LifeTreeStatus,
  LifeVitalityTree,
  LifeVitalityTreeSourceData
} from './lifeVitalityTreeTypes'

type BuildLifeVitalityTreeInput = {
  tree: TreeSnapshot | null
  recentReviews: ReviewRecord[]
  weeklyReview: WeeklyReviewSummary | null
}

type UnknownRecord = Record<string, unknown>

const ISSUE_KEYWORDS = ['失控', '拖延', '游戏', '短视频', '没完成', '中断', '卡住', '失败']

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
  { x: 66, y: 60 },
  { x: 42, y: 24 },
  { x: 58, y: 25 },
  { x: 46, y: 69 },
  { x: 55, y: 68 }
]

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: unknown, keys: string[], fallback: string) {
  if (!isRecord(record)) {
    return fallback
  }

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return fallback
}

function readBoolean(record: unknown, keys: string[], fallback = false) {
  if (!isRecord(record)) {
    return fallback
  }

  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') {
      return value
    }
  }

  return fallback
}

function readDate(record: unknown, keys: string[], fallback: string) {
  const value = readString(record, keys, fallback)
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? value : fallback
}

function readArray(record: unknown, key: string) {
  if (!isRecord(record)) {
    return []
  }
  const value = record[key]
  return Array.isArray(value) ? value : []
}

function latestDate(values: string[]) {
  const sorted = values
    .filter((value) => Number.isFinite(new Date(value).getTime()))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return sorted[0] ?? lifeVitalityTreeMockData.dataSource?.latestUpdatedAt ?? lifeVitalityTreeMockData.nodes[0]?.updatedAt ?? new Date().toISOString()
}

function mapStatus(status: string): LifeTreeStatus {
  if (status === 'new' || status === 'growing' || status === 'restarted') {
    return 'growing'
  }
  if (status === 'stable') {
    return 'stable'
  }
  if (status === 'review') {
    return 'repairing'
  }
  if (status === 'dormant' || status === 'paused') {
    return 'paused'
  }
  if (status === 'harvesting') {
    return 'harvesting'
  }
  if (status === 'withered') {
    return 'withered'
  }
  return 'unknown'
}

function nodeTypeLabel(nodeType: string) {
  const labels: Record<string, string> = {
    mainline: '主线',
    ability: '能力',
    habit: '习惯',
    method: '方法',
    issue: '问题',
    cognition: '认知',
    achievement: '成果',
    project: '项目',
    branch: '分支'
  }
  return labels[nodeType] ?? '节点'
}

function mapKindFromNode(nodeType: string, status: string, index: number): LifeTreeNodeKind {
  if (nodeType === 'mainline') {
    return index % 2 === 0 ? 'major_branch' : 'trunk_vein'
  }
  if (nodeType === 'achievement') {
    return 'fruit'
  }
  if (nodeType === 'issue') {
    return status === 'dormant' || status === 'review' || status === 'paused' ? 'withered_leaf' : 'fallen_leaf'
  }
  if (nodeType === 'habit') {
    return 'leaf'
  }
  if (nodeType === 'method') {
    return 'flower'
  }
  return index < MAINLINE_POSITIONS.length ? 'minor_branch' : 'leaf'
}

function containsIssueKeyword(text: string) {
  return ISSUE_KEYWORDS.some((keyword) => text.includes(keyword))
}

function makeDataSource(label: string, mode: 'mapped' | 'mock', nodes: LifeTreeNode[]): LifeVitalityTree['dataSource'] {
  return {
    label,
    mode,
    nodeCount: nodes.length,
    leafCount: nodes.filter((node) => node.kind === 'leaf').length,
    fruitCount: nodes.filter((node) => node.kind === 'fruit').length,
    fallenLeafCount: nodes.filter((node) => node.kind === 'fallen_leaf' || node.kind === 'withered_leaf').length,
    latestUpdatedAt: latestDate(nodes.map((node) => node.updatedAt))
  }
}

function withDataSource(tree: LifeVitalityTree, label: string, mode: 'mapped' | 'mock'): LifeVitalityTree {
  return {
    ...tree,
    dataSource: makeDataSource(label, mode, tree.nodes)
  }
}

function buildReviewNode(review: unknown, index: number, fallbackDate: string): LifeTreeNode {
  const sourceId = readString(review, ['id', 'reviewId', 'review_id'], `generated-${index}`)
  const title = readString(review, ['title', 'name'], `复盘记录 ${index + 1}`)
  const content = readString(review, ['contentMarkdown', 'content_markdown', 'content', 'body', 'summary'], '')
  const createdAt = readDate(review, ['createdAt', 'created_at', 'createdTime', 'reviewDate', 'review_date'], fallbackDate)
  const updatedAt = readDate(review, ['updatedAt', 'updated_at', 'updatedTime', 'lastUpdatedAt'], createdAt)
  const isIssue = containsIssueKeyword(`${title}\n${content}`)
  const kind: LifeTreeNodeKind = isIssue ? 'fallen_leaf' : 'leaf'
  const position = NODE_POSITIONS[(index + 4) % NODE_POSITIONS.length]

  return {
    id: `review-${sourceId}`,
    title,
    kind,
    status: isIssue ? 'withered' : 'growing',
    path: ['人生生长树', '复盘', isIssue ? '落叶' : '叶子', title],
    createdAt,
    updatedAt,
    summary: isIssue ? '这条复盘包含失控、拖延、失败或中断类关键词，暂映射为落叶。' : '这条复盘暂映射为叶子，表示一次日常行动或观察。',
    detail: content ? content.slice(0, 180) : '复盘内容为空或暂不可读，已使用安全 fallback 生成叶子对象。',
    nextStep: isIssue ? '后续可通过复盘把这片落叶转化为土壤养分。' : '继续观察这条行动是否持续喂养长期主线。',
    x: position.x,
    y: position.y,
    sourceType: 'review',
    sourceId
  }
}

function buildNodeObject(rawNode: unknown, index: number, fallbackDate: string): LifeTreeNode {
  const sourceId = readString(rawNode, ['id', 'nodeId', 'node_id'], `generated-${index}`)
  const nodeType = readString(rawNode, ['nodeType', 'node_type', 'type', 'kind'], 'ability')
  const domain = readString(rawNode, ['domain', 'category', 'mainline'], '未分类')
  const title = readString(rawNode, ['title', 'name', 'label'], `${nodeTypeLabel(nodeType)} ${index + 1}`)
  const statusRaw = readString(rawNode, ['status', 'nodeStatus', 'node_status'], 'unknown')
  const kind = mapKindFromNode(nodeType, statusRaw, index)
  const createdAt = readDate(rawNode, ['createdAt', 'created_at', 'createdTime', 'firstSeenAt', 'first_seen_at'], fallbackDate)
  const updatedAt = readDate(rawNode, ['updatedAt', 'updated_at', 'updatedTime', 'lastUpdatedAt', 'lastActiveAt', 'last_active_at'], createdAt)
  const description = readString(rawNode, ['description', 'summary', 'detail'], `${title} 来自现有节点数据。`)
  const evidenceCount = readString(rawNode, ['evidenceCount', 'evidence_count'], '0')
  const needsReview = readBoolean(rawNode, ['needsReview', 'needs_review'], false)
  const stablePrefix = kind === 'fruit' ? 'fruit' : kind === 'fallen_leaf' || kind === 'withered_leaf' ? 'fallen' : 'node'
  const position = nodeType === 'mainline' ? MAINLINE_POSITIONS[index % MAINLINE_POSITIONS.length] : NODE_POSITIONS[index % NODE_POSITIONS.length]

  return {
    id: `${stablePrefix}-${sourceId}`,
    title,
    kind,
    status: kind === 'fruit' ? 'harvesting' : mapStatus(statusRaw),
    path: ['人生生长树', domain, nodeTypeLabel(nodeType), title],
    createdAt,
    updatedAt,
    summary: description,
    detail: `${title} 映射自 ${domain} / ${nodeTypeLabel(nodeType)}。原始状态 ${statusRaw}，证据数 ${evidenceCount}。`,
    nextStep: needsReview ? '该节点在原始成长树中待回看，可优先进入修复或复盘。' : '继续观察它是否持续喂养对应人生主线。',
    x: position.x,
    y: position.y,
    sourceType: 'tree_snapshot',
    sourceId
  }
}

function buildReviewRings(reviews: unknown[]): LifeTreeAnnualRing[] {
  if (reviews.length === 0) {
    return lifeVitalityTreeMockData.rings
  }

  const reviewsByYear = new Map<number, unknown[]>()
  reviews.forEach((review) => {
    const date = readDate(review, ['reviewDate', 'review_date', 'createdAt', 'created_at', 'createdTime'], new Date().toISOString())
    const year = new Date(date).getFullYear()
    const group = reviewsByYear.get(year) ?? []
    group.push(review)
    reviewsByYear.set(year, group)
  })

  return Array.from(reviewsByYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, group]) => {
      const newest = latestDate(group.map((review) => readDate(review, ['updatedAt', 'updated_at', 'updatedTime', 'lastUpdatedAt'], new Date().toISOString())))
      return {
        id: `ring-${year}`,
        year,
        title: `${year} 年复盘年轮`,
        status: group.length >= 3 ? 'growing' : 'stable',
        keywords: ['复盘', `${group.length} 条记录`, '半真实映射'],
        summary: `这一圈年轮来自 ${group.length} 条近期复盘记录，最近更新时间 ${newest.slice(0, 10)}。`,
        nextStep: '后续可接入年度复盘总结，目前只做按年份聚合。',
        sourceType: 'review',
        sourceId: String(year)
      }
    })
}

function buildBaseNodes(source: LifeVitalityTreeSourceData, updatedAt: string): LifeTreeNode[] {
  const reviews = source.reviews ?? []
  const treeRecord = isRecord(source.treeSnapshot) ? source.treeSnapshot : null
  const mainlines = readArray(treeRecord, 'mainlines')
  const nodes = source.nodes ?? readArray(treeRecord, 'nodes')
  const reviewCount = reviews.length
  const totalNodes = nodes.length

  return [
    {
      id: 'tree-core',
      title: '整棵人生生长树',
      kind: 'tree',
      status: totalNodes > 0 || reviewCount > 0 ? 'growing' : 'unknown',
      path: ['人生生长树'],
      createdAt: readDate(nodes[0], ['createdAt', 'created_at', 'createdTime'], lifeVitalityTreeMockData.nodes[0].createdAt),
      updatedAt,
      summary: `当前映射 ${totalNodes} 个节点、${reviewCount} 条复盘。`,
      detail: 'Life Vitality Tree v0.2 通过 renderer adapter 读取现有数据。Adapter 不改变原始数据，只把它翻译成生命树可渲染的格式。',
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
      createdAt: readDate(reviews.at(-1), ['createdAt', 'created_at', 'createdTime', 'reviewDate', 'review_date'], lifeVitalityTreeMockData.nodes[1].createdAt),
      updatedAt,
      summary: `根系暂由复盘活跃度代理观察：近期复盘 ${reviewCount} 条。`,
      detail: '树根仍不绑定数据库字段，当前只把近期复盘作为底层供给的弱信号。',
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
      createdAt: readDate(reviews.at(-1), ['createdAt', 'created_at', 'createdTime', 'reviewDate', 'review_date'], lifeVitalityTreeMockData.nodes[2].createdAt),
      updatedAt,
      summary: `土壤层承接 ${reviewCount} 条近期复盘。`,
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
      createdAt: readDate(nodes[0], ['createdAt', 'created_at', 'createdTime'], lifeVitalityTreeMockData.nodes[3].createdAt),
      updatedAt,
      summary: `主干由 ${mainlines.length} 条主线和 ${totalNodes} 个节点共同映射。`,
      detail: '树干仍是人生主线与营养通道。v0.2 不改原始节点逻辑，只把现有数据转译到生命树对象。',
      nextStep: '继续验证主线数量、节点状态和成果节点是否能形成可理解的树形。',
      x: 50,
      y: 55,
      sourceType: 'tree_snapshot'
    }
  ]
}

export function buildLifeVitalityTreeFromSourceData(source: LifeVitalityTreeSourceData): LifeVitalityTree {
  const treeRecord = isRecord(source.treeSnapshot) ? source.treeSnapshot : null
  const treeNodes = source.nodes ?? readArray(treeRecord, 'nodes')
  const reviews = source.reviews ?? []
  const fallbackDate = latestDate([
    ...treeNodes.map((node) => readDate(node, ['updatedAt', 'updated_at', 'updatedTime', 'lastUpdatedAt', 'lastActiveAt', 'last_active_at'], '')),
    ...reviews.map((review) => readDate(review, ['updatedAt', 'updated_at', 'updatedTime', 'lastUpdatedAt', 'reviewDate', 'review_date'], ''))
  ])

  const mappedNodes = treeNodes.map((node, index) => buildNodeObject(node, index, fallbackDate))
  const reviewNodes = reviews.slice(0, 8).map((review, index) => buildReviewNode(review, index, fallbackDate))
  const nodes = [...buildBaseNodes(source, fallbackDate), ...mappedNodes.slice(0, 16), ...reviewNodes]

  if (mappedNodes.length === 0 && reviewNodes.length === 0) {
    return withDataSource(lifeVitalityTreeMockData, 'Mock 示例数据', 'mock')
  }

  const fruitCount = nodes.filter((node) => node.kind === 'fruit').length
  const fallenLeafCount = nodes.filter((node) => node.kind === 'fallen_leaf' || node.kind === 'withered_leaf').length

  return {
    title: 'Life Vitality Tree Canvas',
    ownerName: 'Me',
    season: fallenLeafCount > 0 ? 'winter' : fruitCount > 0 ? 'autumn' : 'mixed',
    headline: '人生生长树 v0.3',
    description: '半真实映射阶段：从现有复盘、节点和 TreeSnapshot 生成生命树对象，不改数据库，不新增 IPC。',
    metrics: [
      { label: '节点数', value: String(nodes.length) },
      { label: '叶子', value: String(nodes.filter((node) => node.kind === 'leaf').length) },
      { label: '果实', value: String(fruitCount) },
      { label: '落叶', value: String(fallenLeafCount) }
    ],
    nodes,
    rings: buildReviewRings(reviews),
    dataSource: makeDataSource('现有复盘与节点映射', 'mapped', nodes)
  }
}

export function buildLifeVitalityTreeFromAppData(input: BuildLifeVitalityTreeInput): LifeVitalityTree {
  return buildLifeVitalityTreeFromSourceData({
    reviews: input.recentReviews,
    nodes: input.tree?.nodes,
    treeSnapshot: input.tree ?? undefined
  })
}
