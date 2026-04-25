import type { Domain, EdgeRecord, NodeEvidenceRecord, NodeRecord, ReviewRecord } from '@shared/contracts'

const now = '2026-04-20T09:00:00.000Z'
const tenDaysAgo = '2026-04-10T09:00:00.000Z'
const sevenDaysAgo = '2026-04-13T09:00:00.000Z'
const eightDaysAgo = '2026-04-12T09:00:00.000Z'
const sixDaysAgo = '2026-04-14T09:00:00.000Z'
const fourDaysAgo = '2026-04-16T09:00:00.000Z'
const twoDaysAgo = '2026-04-18T09:00:00.000Z'
const yesterday = '2026-04-19T09:00:00.000Z'

type SeedNode = Omit<NodeRecord, 'evidenceCount' | 'weightScore'> & {
  evidenceCount: number
  weightScore: number
}

export const domainMainlines: Array<{ id: string; title: Domain; domain: Domain }> = [
  { id: 'mainline-academics', title: '学业 / 认知成长', domain: '学业 / 认知成长' },
  { id: 'mainline-body', title: '身体 / 能量管理', domain: '身体 / 能量管理' },
  { id: 'mainline-expression', title: '表达 / 输出能力', domain: '表达 / 输出能力' },
  { id: 'mainline-relationship', title: '关系 / 社会互动', domain: '关系 / 社会互动' },
  { id: 'mainline-money', title: '金钱 / 生存系统', domain: '金钱 / 生存系统' },
  { id: 'mainline-order', title: '内在秩序 / 情绪与自我管理', domain: '内在秩序 / 情绪与自我管理' }
]

export const seedNodes: SeedNode[] = [
  ...domainMainlines.map((item) => ({
    id: item.id,
    title: item.title,
    nodeType: 'mainline' as const,
    domain: item.domain,
    status: 'stable' as const,
    description: '一级主线，作为成长树的长期骨架。',
    createdAt: eightDaysAgo,
    updatedAt: yesterday,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: yesterday,
    evidenceCount: 3,
    weightScore: 10,
    isAchievement: false,
    needsReview: false
  })),
  {
    id: 'node-deep-reading',
    title: '深度阅读卡片化',
    nodeType: 'method',
    domain: '学业 / 认知成长',
    status: 'stable',
    description: '把阅读后的观点压缩成可回收的卡片，而不是只做摘抄。',
    createdAt: tenDaysAgo,
    updatedAt: tenDaysAgo,
    firstSeenAt: tenDaysAgo,
    lastActiveAt: tenDaysAgo,
    evidenceCount: 4,
    weightScore: 9,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-question-journal',
    title: '问题驱动学习',
    nodeType: 'cognition',
    domain: '学业 / 认知成长',
    status: 'growing',
    description: '复盘时优先记录卡点与问题，而不是知识点数量。',
    createdAt: eightDaysAgo,
    updatedAt: yesterday,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: yesterday,
    evidenceCount: 2,
    weightScore: 6,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-sleep-window',
    title: '固定睡眠窗口',
    nodeType: 'habit',
    domain: '身体 / 能量管理',
    status: 'growing',
    description: '尽量把入睡时间收敛到固定窗口，稳定白天能量。',
    createdAt: eightDaysAgo,
    updatedAt: twoDaysAgo,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: twoDaysAgo,
    evidenceCount: 2,
    weightScore: 7,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-workout-reset',
    title: '午后快走重置',
    nodeType: 'method',
    domain: '身体 / 能量管理',
    status: 'new',
    description: '用 20 分钟快走打断低能量状态。',
    createdAt: fourDaysAgo,
    updatedAt: fourDaysAgo,
    firstSeenAt: fourDaysAgo,
    lastActiveAt: fourDaysAgo,
    evidenceCount: 1,
    weightScore: 4,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-writing-output',
    title: '每日输出一段成稿',
    nodeType: 'ability',
    domain: '表达 / 输出能力',
    status: 'stable',
    description: '不只做摘记，要把想法压成可发布段落。',
    createdAt: eightDaysAgo,
    updatedAt: sevenDaysAgo,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: sevenDaysAgo,
    evidenceCount: 3,
    weightScore: 7,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-speaking-loop',
    title: '口头表达复盘',
    nodeType: 'method',
    domain: '表达 / 输出能力',
    status: 'new',
    description: '会后记录卡顿点，反推表达结构。',
    createdAt: fourDaysAgo,
    updatedAt: yesterday,
    firstSeenAt: fourDaysAgo,
    lastActiveAt: yesterday,
    evidenceCount: 1,
    weightScore: 3,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-feedback-loop',
    title: '主动追反馈',
    nodeType: 'habit',
    domain: '关系 / 社会互动',
    status: 'stable',
    description: '重要协作后主动收集反馈，避免只凭主观感受。',
    createdAt: eightDaysAgo,
    updatedAt: yesterday,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: yesterday,
    evidenceCount: 3,
    weightScore: 8,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-hard-conversation',
    title: '困难对话前写提纲',
    nodeType: 'method',
    domain: '关系 / 社会互动',
    status: 'growing',
    description: '把意图、事实、请求分开写，减少防御性表达。',
    createdAt: eightDaysAgo,
    updatedAt: twoDaysAgo,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: twoDaysAgo,
    evidenceCount: 2,
    weightScore: 6,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-income-log',
    title: '现金流可视化',
    nodeType: 'method',
    domain: '金钱 / 生存系统',
    status: 'stable',
    description: '每周看现金流流向，而不是只看余额。',
    createdAt: tenDaysAgo,
    updatedAt: tenDaysAgo,
    firstSeenAt: tenDaysAgo,
    lastActiveAt: tenDaysAgo,
    evidenceCount: 3,
    weightScore: 8,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-offer-pipeline',
    title: '机会跟进节奏',
    nodeType: 'issue',
    domain: '金钱 / 生存系统',
    status: 'growing',
    description: '机会跟进容易断档，需要固定检查点。',
    createdAt: tenDaysAgo,
    updatedAt: yesterday,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: yesterday,
    evidenceCount: 3,
    weightScore: 6,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-emotion-label',
    title: '情绪命名再处理',
    nodeType: 'cognition',
    domain: '内在秩序 / 情绪与自我管理',
    status: 'growing',
    description: '先把情绪标成具体状态，再决定行动。',
    createdAt: eightDaysAgo,
    updatedAt: twoDaysAgo,
    firstSeenAt: eightDaysAgo,
    lastActiveAt: twoDaysAgo,
    evidenceCount: 2,
    weightScore: 7,
    isAchievement: false,
    needsReview: false
  },
  {
    id: 'node-reset-ritual',
    title: '收工重置仪式',
    nodeType: 'habit',
    domain: '内在秩序 / 情绪与自我管理',
    status: 'new',
    description: '收工前清掉桌面与待办，降低切换摩擦。',
    createdAt: fourDaysAgo,
    updatedAt: fourDaysAgo,
    firstSeenAt: fourDaysAgo,
    lastActiveAt: fourDaysAgo,
    evidenceCount: 1,
    weightScore: 4,
    isAchievement: false,
    needsReview: false
  }
]

export const seedEdges: EdgeRecord[] = seedNodes
  .filter((node) => node.nodeType !== 'mainline')
  .map((node, index) => ({
    id: `edge-${node.id}`,
    sourceNodeId: domainMainlines.find((item) => item.domain === node.domain)?.id ?? domainMainlines[0].id,
    targetNodeId: node.id,
    relationType: index % 2 === 0 ? 'supports' : 'reveals',
    createdAt: eightDaysAgo,
    updatedAt: yesterday
  }))

export const seedReviews: ReviewRecord[] = [
  {
    id: 'review-2026-04-13',
    reviewDate: '2026-04-13',
    title: '把深度阅读从收藏变成卡片',
    contentMarkdown:
      '# 每日复盘\n\n今天把《系统之美》的阅读拆成了 3 张卡片，也发现如果没有问题驱动，读完就散掉。\n\n- 完成 45 分钟深度阅读\n- 提炼 3 个判断\n- 晚上回顾时把问题写出来',
    markdownPath: '',
    createdAt: sixDaysAgo,
    updatedAt: sixDaysAgo
  },
  {
    id: 'review-2026-04-19',
    reviewDate: '2026-04-19',
    title: '先稳住睡眠和输出节奏',
    contentMarkdown:
      '# 每日复盘\n\n今天最有效的是提前收工，晚间没有硬撑。白天完成了一段成稿，但会后表达还是卡壳。\n\n- 23:20 前上床\n- 输出 1 段可发布内容\n- 会后补了表达卡点',
    markdownPath: '',
    createdAt: yesterday,
    updatedAt: yesterday
  }
]

export const seedEvidence: NodeEvidenceRecord[] = [
  {
    id: 'evidence-reading-1',
    nodeId: 'node-deep-reading',
    reviewId: 'review-2026-04-13',
    excerpt: '把阅读拆成卡片后，后续回看明显更轻松。',
    createdAt: tenDaysAgo
  },
  {
    id: 'evidence-reading-2',
    nodeId: 'node-deep-reading',
    reviewId: 'review-2026-04-13',
    excerpt: '卡片化后更容易回看长期积累。',
    createdAt: sixDaysAgo
  },
  {
    id: 'evidence-question-1',
    nodeId: 'node-question-journal',
    reviewId: 'review-2026-04-13',
    excerpt: '如果不先写问题，复盘就会变成流水账。',
    createdAt: sixDaysAgo
  },
  {
    id: 'evidence-sleep-1',
    nodeId: 'node-sleep-window',
    reviewId: 'review-2026-04-19',
    excerpt: '睡前没有继续硬撑，第二天早起阻力更小。',
    createdAt: yesterday
  },
  {
    id: 'evidence-writing-1',
    nodeId: 'node-writing-output',
    reviewId: 'review-2026-04-13',
    excerpt: '白天压出一段成稿，比只记灵感更有效。',
    createdAt: sevenDaysAgo
  },
  {
    id: 'evidence-offer-1',
    nodeId: 'node-offer-pipeline',
    reviewId: 'review-2026-04-13',
    excerpt: '机会跟进又拖到了晚上，节奏仍然断档。',
    createdAt: sixDaysAgo
  },
  {
    id: 'evidence-offer-2',
    nodeId: 'node-offer-pipeline',
    reviewId: 'review-2026-04-19',
    excerpt: '今天又漏掉了一个跟进窗口，问题重复出现。',
    createdAt: twoDaysAgo
  },
  {
    id: 'evidence-offer-3',
    nodeId: 'node-offer-pipeline',
    reviewId: 'review-2026-04-19',
    excerpt: '同一类跟进问题第三次出现，需要集中回看。',
    createdAt: yesterday
  }
]
