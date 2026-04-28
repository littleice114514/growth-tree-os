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

type TreeObjectClassification = {
  kind: LifeTreeNodeKind
  status: LifeTreeStatus
  classificationLabel: string
  summary: string
  nextStep: string
  matchedKeywords: string[]
}

const TREE_OBJECT_KEYWORDS = {
  leaf: ['完成', '推进', '学习', '复习', '跑步', '写了', '整理', '练习', '阅读', '记录', '维护', '执行'],
  flower: ['跑通', '完成一版', '阶段性', '初步完成', '修复', '打通', '成型', '第一版', '可演示'],
  fruit: ['发布', '验收通过', '拿到结果', '封板', '可复用', '收益', '获奖', '交付', '上线', '成交', '沉淀'],
  witheredLeaf: ['拖延', '没完成', '中断', '卡住', '状态差', '搁置', '暂停', '低效', '没有推进'],
  fallenLeaf: ['失控', '失败', '错误', '崩掉', '浪费', '复发', '超时', '损失', '沉迷', '翻车', '游戏', '短视频'],
  soil: ['复盘', '归因', '总结', '调整', '规则', '原因', '下次', '触发点', '教训'],
  rootNutrient: ['防复发', '以后', '固定规则', '模板', '习惯', '机制', '流程', '约束', '检查清单', '自动化']
} as const

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

function daysBetweenNow(value: string) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) {
    return Number.POSITIVE_INFINITY
  }
  return Math.floor((Date.now() - timestamp) / 86_400_000)
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

function matchedKeywords(text: string, keywords: readonly string[]) {
  return keywords.filter((keyword) => text.includes(keyword))
}

function hasAnyKeyword(text: string, keywords: readonly string[]) {
  return matchedKeywords(text, keywords).length > 0
}

function classifyReviewTreeObject(text: string): TreeObjectClassification {
  const rootNutrientMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.rootNutrient)
  if (rootNutrientMatches.length > 0) {
    return {
      kind: 'soil',
      status: 'repairing',
      classificationLabel: '根系养分候选',
      matchedKeywords: rootNutrientMatches,
      summary: '这条复盘包含防复发、模板、机制或习惯类线索，暂映射为根系养分候选。',
      nextStep: '后续可验证这条规则是否真的改善了行为，再决定是否进入正式根系养分。'
    }
  }

  const soilMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.soil)
  if (soilMatches.length > 0) {
    return {
      kind: 'soil',
      status: 'repairing',
      classificationLabel: '土壤候选',
      matchedKeywords: soilMatches,
      summary: '这条复盘包含复盘、归因、总结或调整类线索，暂映射为土壤候选。',
      nextStep: '继续把落叶里的触发点、原因和下次动作沉淀清楚，让它有机会转化为根系养分。'
    }
  }

  const fruitMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.fruit)
  if (fruitMatches.length > 0) {
    return {
      kind: 'fruit',
      status: 'harvesting',
      classificationLabel: '果实',
      matchedKeywords: fruitMatches,
      summary: '这条复盘包含发布、验收、收益或可复用成果线索，暂映射为果实。',
      nextStep: '确认这个结果是否可以复用、交付或沉淀进长期主线。'
    }
  }

  const flowerMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.flower)
  if (flowerMatches.length > 0) {
    return {
      kind: 'flower',
      status: 'growing',
      classificationLabel: '花',
      matchedKeywords: flowerMatches,
      summary: '这条复盘包含跑通、阶段性完成或初步修复线索，暂映射为花。',
      nextStep: '继续观察这个阶段结果能否被验证、复用或沉淀成果实。'
    }
  }

  const fallenLeafMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.fallenLeaf)
  if (fallenLeafMatches.length > 0) {
    return {
      kind: 'fallen_leaf',
      status: 'withered',
      classificationLabel: '落叶',
      matchedKeywords: fallenLeafMatches,
      summary: '这条复盘包含失控、失败、错误或复发类线索，暂映射为落叶。',
      nextStep: '落叶不是失败判决。后续可通过复盘把它转化为土壤候选。'
    }
  }

  const witheredLeafMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.witheredLeaf)
  if (witheredLeafMatches.length > 0) {
    return {
      kind: 'withered_leaf',
      status: 'paused',
      classificationLabel: '枯叶',
      matchedKeywords: witheredLeafMatches,
      summary: '这条复盘包含拖延、未完成、中断或卡住线索，暂映射为枯叶。',
      nextStep: '先判断它是需要恢复推进，还是需要进入复盘后转为落叶或土壤候选。'
    }
  }

  const leafMatches = matchedKeywords(text, TREE_OBJECT_KEYWORDS.leaf)
  return {
    kind: 'leaf',
    status: 'growing',
    classificationLabel: '叶子',
    matchedKeywords: leafMatches,
    summary: '这条复盘暂映射为叶子，表示一次日常行动、观察或普通推进。',
    nextStep: '继续观察这条行动是否持续喂养长期主线，或进一步开花、结果。'
  }
}

function classifyNodeTreeObject(text: string, nodeType: string, status: string, index: number, updatedAt: string): TreeObjectClassification {
  if (hasAnyKeyword(text, TREE_OBJECT_KEYWORDS.fruit)) {
    return {
      kind: 'fruit',
      status: 'harvesting',
      classificationLabel: '果实',
      matchedKeywords: matchedKeywords(text, TREE_OBJECT_KEYWORDS.fruit),
      summary: '这个节点包含成果、交付、收益或可复用线索，暂映射为果实。',
      nextStep: '确认这颗果实是否已经可复用、可交付，或需要沉淀进年轮。'
    }
  }

  if (nodeType === 'mainline') {
    return {
      kind: index % 2 === 0 ? 'major_branch' : 'trunk_vein',
      status: mapStatus(status),
      classificationLabel: index % 2 === 0 ? '大枝' : '主干筋络',
      matchedKeywords: [],
      summary: '这个节点来自主线类型，暂映射为人生树的大枝或主干筋络。',
      nextStep: '继续观察这条主线是否被近期行动、阶段成果和底层供给持续喂养。'
    }
  }
  if (nodeType === 'achievement') {
    return {
      kind: 'fruit',
      status: 'harvesting',
      classificationLabel: '果实',
      matchedKeywords: [],
      summary: '这个节点来自成果类型，暂映射为果实。',
      nextStep: '确认这项成果是否可复用、可交付，或需要沉淀为长期资产。'
    }
  }
  if (nodeType === 'issue') {
    const kind = status === 'dormant' || status === 'review' || status === 'paused' ? 'withered_leaf' : 'fallen_leaf'
    return {
      kind,
      status: kind === 'withered_leaf' ? 'paused' : 'withered',
      classificationLabel: kind === 'withered_leaf' ? '枯叶' : '落叶',
      matchedKeywords: [],
      summary: kind === 'withered_leaf' ? '这个问题节点仍处于可修复或待回看状态，暂映射为枯叶。' : '这个问题节点表示已发生的问题或失控事件，暂映射为落叶。',
      nextStep: kind === 'withered_leaf' ? '判断它是否能恢复推进，或是否需要进一步复盘。' : '通过复盘提取触发点和调整动作，让落叶进入土壤候选。'
    }
  }
  if (nodeType === 'habit') {
    return {
      kind: 'leaf',
      status: mapStatus(status) === 'unknown' ? 'growing' : mapStatus(status),
      classificationLabel: '叶子',
      matchedKeywords: [],
      summary: '这个习惯节点暂映射为叶子，表示可持续喂养主线的日常行动。',
      nextStep: '继续观察它是否稳定发生，或是否需要通过复盘修正节奏。'
    }
  }
  if (nodeType === 'method') {
    return {
      kind: 'flower',
      status: 'growing',
      classificationLabel: '花',
      matchedKeywords: [],
      summary: '这个方法节点暂映射为花，表示阶段性结构或中间成果。',
      nextStep: '继续验证这个方法是否可复用，后续可能沉淀成果实或根系养分。'
    }
  }

  if (status === 'dormant' || status === 'paused' || daysBetweenNow(updatedAt) > 90) {
    return {
      kind: 'withered_leaf',
      status: 'paused',
      classificationLabel: daysBetweenNow(updatedAt) > 90 ? '休眠枝 / 枯化风险' : '枯叶',
      matchedKeywords: [],
      summary: daysBetweenNow(updatedAt) > 90 ? '这个节点长期未更新，暂标记为休眠枝或枯化风险。' : '这个节点处于暂停状态，暂映射为枯叶。',
      nextStep: '确认它是需要恢复行动、继续休眠，还是通过复盘转化为土壤候选。'
    }
  }

  const isRecent = daysBetweenNow(updatedAt) <= 14
  return {
    kind: index < MAINLINE_POSITIONS.length ? 'minor_branch' : 'leaf',
    status: isRecent ? 'growing' : mapStatus(status),
    classificationLabel: isRecent ? '当前活跃枝' : index < MAINLINE_POSITIONS.length ? '小枝' : '叶子',
    matchedKeywords: [],
    summary: isRecent ? '这个节点近期有更新，暂标记为当前活跃枝。' : '这个节点暂映射为小枝或叶子，表示主线下的具体方向或普通行动。',
    nextStep: '继续观察它是否产生叶子、花、果实，或是否出现枯化风险。'
  }
}

function makeDataSource(label: string, mode: 'mapped' | 'mock', nodes: LifeTreeNode[]): LifeVitalityTree['dataSource'] {
  return {
    label,
    mode,
    nodeCount: nodes.length,
    leafCount: nodes.filter((node) => node.kind === 'leaf').length,
    flowerCount: nodes.filter((node) => node.kind === 'flower').length,
    fruitCount: nodes.filter((node) => node.kind === 'fruit').length,
    witheredLeafCount: nodes.filter((node) => node.kind === 'withered_leaf').length,
    fallenLeafCount: nodes.filter((node) => node.kind === 'fallen_leaf' || node.kind === 'withered_leaf').length,
    soilCount: nodes.filter((node) => node.kind === 'soil').length,
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
  const classification = classifyReviewTreeObject(`${title}\n${content}`)
  const position = NODE_POSITIONS[(index + 4) % NODE_POSITIONS.length]

  return {
    id: `review-${sourceId}`,
    title,
    kind: classification.kind,
    status: classification.status,
    path: ['人生生长树', '复盘', classification.classificationLabel, title],
    createdAt,
    updatedAt,
    summary: classification.summary,
    detail: content
      ? `${content.slice(0, 180)}${classification.matchedKeywords.length > 0 ? `\n\nv0.5 分类线索：${classification.matchedKeywords.join('、')}。` : ''}`
      : `复盘内容为空或暂不可读，已使用安全 fallback 生成${classification.classificationLabel}对象。`,
    nextStep: classification.nextStep,
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
  const createdAt = readDate(rawNode, ['createdAt', 'created_at', 'createdTime', 'firstSeenAt', 'first_seen_at'], fallbackDate)
  const updatedAt = readDate(rawNode, ['updatedAt', 'updated_at', 'updatedTime', 'lastUpdatedAt', 'lastActiveAt', 'last_active_at'], createdAt)
  const description = readString(rawNode, ['description', 'summary', 'detail'], `${title} 来自现有节点数据。`)
  const classification = classifyNodeTreeObject(`${title}\n${description}`, nodeType, statusRaw, index, updatedAt)
  const kind = classification.kind
  const evidenceCount = readString(rawNode, ['evidenceCount', 'evidence_count'], '0')
  const needsReview = readBoolean(rawNode, ['needsReview', 'needs_review'], false)
  const stablePrefix = kind === 'fruit' ? 'fruit' : kind === 'fallen_leaf' || kind === 'withered_leaf' ? 'fallen' : 'node'
  const position = nodeType === 'mainline' ? MAINLINE_POSITIONS[index % MAINLINE_POSITIONS.length] : NODE_POSITIONS[index % NODE_POSITIONS.length]

  return {
    id: `${stablePrefix}-${sourceId}`,
    title,
    kind,
    status: classification.status,
    path: ['人生生长树', domain, nodeTypeLabel(nodeType), classification.classificationLabel, title],
    createdAt,
    updatedAt,
    summary: classification.summary,
    detail: `${title} 映射自 ${domain} / ${nodeTypeLabel(nodeType)}。原始状态 ${statusRaw}，证据数 ${evidenceCount}。${classification.matchedKeywords.length > 0 ? ` v0.5 分类线索：${classification.matchedKeywords.join('、')}。` : ''} 原说明：${description}`,
    nextStep: needsReview ? `该节点在原始成长树中待回看。${classification.nextStep}` : classification.nextStep,
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
  const flowerCount = nodes.filter((node) => node.kind === 'flower').length
  const soilCount = nodes.filter((node) => node.kind === 'soil').length

  return {
    title: 'Life Vitality Tree Canvas',
    ownerName: 'Me',
    season: fallenLeafCount > 0 ? 'winter' : fruitCount > 0 ? 'autumn' : 'mixed',
    headline: '人生生长树 v0.5',
    description: '前端规则层阶段：从现有复盘、节点和 TreeSnapshot 生成叶子、花、果实、枯叶、落叶、土壤候选和根系养分候选，不改数据库，不新增 IPC。',
    metrics: [
      { label: '节点数', value: String(nodes.length) },
      { label: '叶子', value: String(nodes.filter((node) => node.kind === 'leaf').length) },
      { label: '花', value: String(flowerCount) },
      { label: '果实', value: String(fruitCount) },
      { label: '落叶', value: String(fallenLeafCount) },
      { label: '土壤', value: String(soilCount) }
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
