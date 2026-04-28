import type { ReviewRecord } from '@shared/contracts'
import type { LifeCurveDailyScore, LifeCurveEvidence, LifeCurveLineId, LifeCurveLineMeta, LifeCurveRiskLevel, LifeCurveScores } from './lifeCurveTypes'

type ReviewLike = Pick<ReviewRecord, 'id' | 'reviewDate' | 'title' | 'contentMarkdown'>

type LineRuleResult = {
  score: number
  evidence: string[]
}

const lineIds: LifeCurveLineId[] = ['personalAbility', 'projectPulse', 'aiLeverage', 'wealthSafety', 'healthVitality']

export const lifeCurveLineMeta: LifeCurveLineMeta[] = [
  { id: 'personalAbility', label: '个人能力线', shortLabel: '能力', treeLink: '学习主线 / 技能节点', weight: 0.25 },
  { id: 'projectPulse', label: '项目脉冲线', shortLabel: '项目', treeLink: '项目主线 / 作品节点', weight: 0.25 },
  { id: 'aiLeverage', label: 'AI协作线', shortLabel: 'AI', treeLink: 'AI协作节点 / 工作流节点', weight: 0.2 },
  { id: 'wealthSafety', label: '财富安全线', shortLabel: '财富', treeLink: '财富模块 / 时间负债模块', weight: 0.2 },
  { id: 'healthVitality', label: '健康生命力线', shortLabel: '健康', treeLink: '健康模块 / 精力节点', weight: 0.1 }
]

const keywordRules: Record<LifeCurveLineId, Array<{ keywords: string[]; score: number; evidence: string }>> = {
  personalAbility: [
    { keywords: ['可复用方法论', '迁移到项目', '方法论'], score: 5, evidence: '形成可迁移或可复用的方法论' },
    { keywords: ['模板', '错题', '总结', 'SOP', '方法'], score: 4, evidence: '有学习输出、模板或错题总结' },
    { keywords: ['真题', '做题', '练习', '代码练习', '刷题', '蓝桥杯', 'C++', '英语'], score: 3, evidence: '完成题目、练习或专业学习' },
    { keywords: ['学习', '复习', '阅读', '背单词', '看课', '教程'], score: 2, evidence: '有学习投入' }
  ],
  projectPulse: [
    { keywords: ['收入', '用户反馈', '真实反馈', '上线', '发布', '交付', '验收通过'], score: 5, evidence: '项目产生真实反馈、发布或交付' },
    { keywords: ['可运行模块', 'demo', '完成模块', '完成一版', '跑通', '公众号发布'], score: 4, evidence: '完成可验证项目产物' },
    { keywords: ['文章', '公众号', '小绿书', '提交', '实现', '开发', 'growth-tree-os', 'personal-growth-os'], score: 3, evidence: '推进项目、内容或软件产物' },
    { keywords: ['项目点子', '规划', '设计', '想法', '选题'], score: 2, evidence: '有项目规划或方向思考' }
  ],
  aiLeverage: [
    { keywords: ['自动化闭环', 'Agent', '长期复用', '工作流自动化'], score: 5, evidence: 'AI 参与可长期复用的自动化闭环' },
    { keywords: ['Codex 指令', 'Prompt', '提示词', 'SOP', '工作流', '模板'], score: 4, evidence: 'AI 协作沉淀为可复用流程' },
    { keywords: ['Codex 完成', 'GPT 整理', 'Claude', 'AI 输出', 'AI辅助', 'AI 辅助'], score: 3, evidence: 'AI 输出转化为真实产物' },
    { keywords: ['Codex', 'GPT', 'Claude', 'AI'], score: 2, evidence: '使用 AI 辅助任务' }
  ],
  wealthSafety: [
    { keywords: ['降低时间负债', '提高安全线', '增加储备', '投资储备'], score: 5, evidence: '提高安全线、储备或降低时间负债' },
    { keywords: ['取消订阅', '减少固定流血', '避免冲动消费', '投资', '储蓄'], score: 4, evidence: '减少流血或增加储备' },
    { keywords: ['记账', '低于日安全线', '控制支出', '预算'], score: 3, evidence: '完成财富记录或守住安全线' },
    { keywords: ['支出', '消费', '收入', '安全线', '时间负债'], score: 2, evidence: '有财富或时间负债相关记录' }
  ],
  healthVitality: [
    { keywords: ['精力恢复', '可持续节奏', '睡眠稳定', '饮食稳定'], score: 5, evidence: '明显恢复精力并形成可持续节奏' },
    { keywords: ['跑步30分钟', '有氧30分钟', '运动', '正常睡眠', '饮食规律'], score: 4, evidence: '运动、睡眠或饮食较稳定' },
    { keywords: ['跑步', '有氧', '散步', '健身', '早睡'], score: 3, evidence: '完成运动或恢复性行动' },
    { keywords: ['活动', '走路', '拉伸'], score: 2, evidence: '有基础身体活动' }
  ]
}

const riskRules: Array<{ keywords: string[]; risk: string; level: LifeCurveRiskLevel; line?: LifeCurveLineId }> = [
  { keywords: ['19:00-23:20失控', '游戏失控', '视频失控', '短视频失控'], risk: '出现长时段游戏或视频失控，注意力风险升高', level: 'high' },
  { keywords: ['失控', '沉迷', '刷视频', '游戏'], risk: '出现注意力失控信号', level: 'medium' },
  { keywords: ['熬夜', '睡眠不足', '通宵'], risk: '睡眠不足会压低健康生命力线', level: 'medium', line: 'healthVitality' },
  { keywords: ['受伤', '旧伤复发', '身体不适还硬撑'], risk: '身体风险需要优先处理', level: 'high', line: 'healthVitality' },
  { keywords: ['冲动消费', '新增固定流血', '分期', '借钱', '消费未来'], risk: '财富安全线出现下压风险', level: 'high', line: 'wealthSafety' },
  { keywords: ['只规划不执行', '频繁换方向', '没有交付'], risk: '项目可能空转，需要收束到可验收产物', level: 'medium', line: 'projectPulse' },
  { keywords: ['只问不做', 'AI 聊了很多', '没有保存', '没有产物'], risk: 'AI 使用可能空转，需要沉淀为产物或流程', level: 'medium', line: 'aiLeverage' }
]

const mockReviews: ReviewLike[] = [
  {
    id: 'life-curve-mock-1',
    reviewDate: '2026-04-21',
    title: '英语和基础恢复',
    contentMarkdown: '背单词40分钟，做了一组英语练习，晚上散步20分钟。'
  },
  {
    id: 'life-curve-mock-2',
    reviewDate: '2026-04-22',
    title: '项目推进',
    contentMarkdown: '推进 growth-tree-os，完成一个可运行模块，Codex 辅助整理实现计划。'
  },
  {
    id: 'life-curve-mock-3',
    reviewDate: '2026-04-23',
    title: '注意力风险',
    contentMarkdown: '今天只规划不执行，晚上游戏和短视频失控，睡眠不足。'
  },
  {
    id: 'life-curve-mock-4',
    reviewDate: '2026-04-24',
    title: '财富安全',
    contentMarkdown: '完成记账，取消订阅，控制支出低于日安全线。'
  },
  {
    id: 'life-curve-mock-5',
    reviewDate: '2026-04-25',
    title: 'AI 工作流',
    contentMarkdown: '把 Codex 指令固化成 SOP，并沉淀为后续可复用工作流。'
  },
  {
    id: 'life-curve-mock-6',
    reviewDate: '2026-04-26',
    title: '内容产物',
    contentMarkdown: '公众号发布一篇文章，整理标题模板，跑步30分钟。'
  },
  {
    id: 'life-curve-mock-7',
    reviewDate: '2026-04-27',
    title: 'Life Curve 模板',
    contentMarkdown: '做了2023四级真题，推进 Life Curve 模块设计，Codex 协助形成模板，晚上19:00-23:20失控，跑了30分钟有氧。'
  }
]

function clampScore(score: number) {
  return Math.max(0, Math.min(5, score))
}

function matchesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function scoreLine(text: string, lineId: LifeCurveLineId): LineRuleResult {
  const matched = keywordRules[lineId].filter((rule) => matchesAny(text, rule.keywords))
  const baseScore = matched.length > 0 ? Math.max(...matched.map((rule) => rule.score)) : lineId === 'wealthSafety' ? 2 : 1
  const evidence =
    matched.length > 0
      ? unique(matched.map((rule) => rule.evidence))
      : [
          lineId === 'wealthSafety'
            ? '当天没有明确财富记录，默认低权重维持'
            : '当天没有足够明确证据，暂按低投入处理'
        ]

  const penalty = riskRules.filter((rule) => rule.line === lineId && matchesAny(text, rule.keywords)).length
  return {
    score: clampScore(baseScore - penalty),
    evidence
  }
}

export function calculateCompositeScore(scores: Omit<LifeCurveScores, 'composite'>) {
  const raw = lifeCurveLineMeta.reduce((total, line) => total + scores[line.id] * line.weight, 0)
  return Math.round(raw * 10) / 10
}

export function getLifeCurveTrend(score: number): LifeCurveDailyScore['trend'] {
  if (score >= 4) {
    return { label: '明显上升日', floorStatus: '抬升', riskLevel: 'low' }
  }
  if (score >= 3) {
    return { label: '稳定成长日', floorStatus: '小幅抬升', riskLevel: 'low' }
  }
  if (score >= 2) {
    return { label: '维持日', floorStatus: '持平', riskLevel: 'medium' }
  }
  if (score >= 1) {
    return { label: '低效日', floorStatus: '下滑', riskLevel: 'medium' }
  }
  return { label: '损耗日', floorStatus: '下滑', riskLevel: 'high' }
}

function collectRisks(text: string) {
  return unique(riskRules.filter((rule) => matchesAny(text, rule.keywords)).map((rule) => rule.risk))
}

function getRiskLevelFromRisks(risks: string[], base: LifeCurveRiskLevel): LifeCurveRiskLevel {
  if (risks.some((risk) => risk.includes('身体风险') || risk.includes('财富安全线') || risk.includes('长时段'))) {
    return 'high'
  }
  if (risks.length > 0) {
    return base === 'high' ? 'high' : 'medium'
  }
  return base
}

function getNextFocus(scores: Omit<LifeCurveScores, 'composite'>, risks: string[]) {
  if (risks.some((risk) => risk.includes('身体'))) {
    return '明天优先修复健康生命力线，先保护睡眠、身体和恢复。'
  }
  if (risks.some((risk) => risk.includes('财富'))) {
    return '明天优先补财富安全线，记录支出并处理固定流血。'
  }
  if (risks.some((risk) => risk.includes('注意力'))) {
    return '明天优先保护高风险时间段，并设置一个可验收的小产物。'
  }

  const weakest = lifeCurveLineMeta.reduce((current, line) => (scores[line.id] < scores[current.id] ? line : current), lifeCurveLineMeta[0])
  return `明天优先补${weakest.label}，让最低线不要继续拖住复合曲线。`
}

function buildScoreFromAggregate(date: string, reviews: ReviewLike[], sourceLabel: 'reviews' | 'mock'): LifeCurveDailyScore {
  const text = reviews.map((review) => `${review.title}\n${review.contentMarkdown}`).join('\n')
  const evidence = Object.fromEntries(lineIds.map((lineId) => [lineId, scoreLine(text, lineId).evidence])) as LifeCurveEvidence
  const lineScores = Object.fromEntries(lineIds.map((lineId) => [lineId, scoreLine(text, lineId).score])) as Omit<LifeCurveScores, 'composite'>
  const composite = calculateCompositeScore(lineScores)
  const baseTrend = getLifeCurveTrend(composite)
  const risks = collectRisks(text)
  const trend = {
    ...baseTrend,
    riskLevel: getRiskLevelFromRisks(risks, baseTrend.riskLevel)
  }

  return {
    date,
    scores: {
      ...lineScores,
      composite
    },
    trend,
    evidence,
    risks,
    nextFocus: getNextFocus(lineScores, risks),
    sourceReviewIds: reviews.map((review) => review.id),
    sourceLabel
  }
}

export function buildLifeCurveDailyScore(review: ReviewLike): LifeCurveDailyScore {
  return buildScoreFromAggregate(review.reviewDate, [review], 'reviews')
}

export function buildLifeCurveScoresFromReviews(reviews: ReviewLike[], days = 7): LifeCurveDailyScore[] {
  const source = reviews.length > 0 ? reviews : mockReviews
  const sourceLabel = reviews.length > 0 ? 'reviews' : 'mock'
  const grouped = new Map<string, ReviewLike[]>()

  source.forEach((review) => {
    const group = grouped.get(review.reviewDate) ?? []
    group.push(review)
    grouped.set(review.reviewDate, group)
  })

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-days)
    .map(([date, group]) => buildScoreFromAggregate(date, group, sourceLabel))
}
