import type { DailyVitalityCheck, LifeTreeSeason, VitalityCheckItem, VitalityDimension, VitalityPattern } from './lifeVitalityTreeTypes'

export const vitalityDimensionOrder: VitalityDimension[] = [
  'agency',
  'sensitivity',
  'recovery',
  'creativity',
  'connection',
  'bodyEnergy',
  'directionAlignment'
]

export const vitalityDimensionTemplates: Array<Omit<VitalityCheckItem, 'score' | 'note'>> = [
  {
    dimension: 'agency',
    label: '主动性',
    question: '今天我是主动选择，还是被外界拖着走？'
  },
  {
    dimension: 'sensitivity',
    label: '感受力',
    question: '今天有没有真实感受到生活，而不是麻木刷过？'
  },
  {
    dimension: 'recovery',
    label: '恢复力',
    question: '今天遇到失控、失败、低谷后，有没有复盘和修复？'
  },
  {
    dimension: 'creativity',
    label: '创造力',
    question: '今天有没有生成新东西，而不只是消费信息？'
  },
  {
    dimension: 'connection',
    label: '关系连接',
    question: '今天有没有和真实的人、现实世界产生连接？'
  },
  {
    dimension: 'bodyEnergy',
    label: '身体能量',
    question: '今天身体有没有被照顾，而不是被透支？'
  },
  {
    dimension: 'directionAlignment',
    label: '方向一致性',
    question: '今天做的事有没有喂养我的长期主线？'
  }
]

export const vitalityPatternLabels: Record<VitalityPattern, string> = {
  strong_growth: '强生长型',
  normal_growth: '正常生长型',
  repairing: '修复型',
  burning: '燃烧透支型',
  numb: '麻木低感型',
  out_of_control: '失控型',
  scattered: '分散型',
  unknown: '未知'
}

export const vitalitySeasonLabels: Record<LifeTreeSeason, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
  mixed: '混合',
  unknown: '未知'
}

export const vitalitySeasonHints: Record<LifeTreeSeason, string> = {
  spring: '有成长和新芽',
  summer: '高投入高执行，注意透支',
  autumn: '收获和沉淀，本轮暂保留',
  winter: '低能量、修复、整理和蓄力',
  mixed: '状态混杂，方向需要收束',
  unknown: '等待更多输入'
}

export function createDefaultVitalityItems(score = 3): VitalityCheckItem[] {
  return vitalityDimensionTemplates.map((item) => ({
    ...item,
    score
  }))
}

export function clampVitalityScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0
  }
  return Math.max(0, Math.min(5, Math.round(score)))
}

export function calculateVitalityTotal(items: VitalityCheckItem[]) {
  return items.reduce((total, item) => total + clampVitalityScore(item.score), 0)
}

function scoreOf(items: VitalityCheckItem[], dimension: VitalityDimension) {
  return clampVitalityScore(items.find((item) => item.dimension === dimension)?.score ?? 0)
}

export function determineVitalityPattern(items: VitalityCheckItem[]): VitalityPattern {
  if (items.length === 0) {
    return 'unknown'
  }

  const totalScore = calculateVitalityTotal(items)
  const agency = scoreOf(items, 'agency')
  const sensitivity = scoreOf(items, 'sensitivity')
  const recovery = scoreOf(items, 'recovery')
  const creativity = scoreOf(items, 'creativity')
  const bodyEnergy = scoreOf(items, 'bodyEnergy')
  const directionAlignment = scoreOf(items, 'directionAlignment')

  if (creativity >= 4 && agency >= 4 && bodyEnergy <= 2) {
    return 'burning'
  }
  if (sensitivity <= 1 && creativity <= 1 && agency <= 2) {
    return 'numb'
  }
  if (agency <= 1 && recovery <= 2) {
    return 'out_of_control'
  }
  if (recovery >= 4 && totalScore <= 24) {
    return 'repairing'
  }
  if (agency >= 4 && creativity >= 4 && directionAlignment >= 4 && bodyEnergy >= 3) {
    return 'strong_growth'
  }

  return 'normal_growth'
}

export function mapVitalityPatternToSeason(pattern: VitalityPattern): LifeTreeSeason {
  const seasons: Record<VitalityPattern, LifeTreeSeason> = {
    strong_growth: 'spring',
    normal_growth: 'spring',
    repairing: 'winter',
    burning: 'summer',
    numb: 'winter',
    out_of_control: 'winter',
    scattered: 'mixed',
    unknown: 'unknown'
  }
  return seasons[pattern]
}

export function describeVitalityScore(totalScore: number) {
  if (totalScore <= 10) {
    return '生命力严重流失'
  }
  if (totalScore <= 18) {
    return '低生命力维持'
  }
  if (totalScore <= 25) {
    return '正常生长'
  }
  if (totalScore <= 31) {
    return '高生命力状态'
  }
  return '强生长状态，注意防止透支'
}

export function summarizeVitalityCheck(pattern: VitalityPattern, totalScore: number, season: LifeTreeSeason) {
  return `${vitalityPatternLabels[pattern]} / ${describeVitalityScore(totalScore)} / ${vitalitySeasonLabels[season]}：${vitalitySeasonHints[season]}`
}

export function buildDailyVitalityCheck(items: VitalityCheckItem[], date = new Date().toISOString().slice(0, 10)): DailyVitalityCheck {
  const normalizedItems = vitalityDimensionOrder.map((dimension) => {
    const template = vitalityDimensionTemplates.find((item) => item.dimension === dimension)
    const current = items.find((item) => item.dimension === dimension)
    return {
      dimension,
      label: current?.label ?? template?.label ?? dimension,
      question: current?.question ?? template?.question ?? '',
      score: clampVitalityScore(current?.score ?? 0),
      note: current?.note
    }
  })
  const totalScore = calculateVitalityTotal(normalizedItems)
  const pattern = determineVitalityPattern(normalizedItems)
  const season = mapVitalityPatternToSeason(pattern)

  return {
    id: `vitality-${date}`,
    date,
    items: normalizedItems,
    totalScore,
    pattern,
    season,
    summary: summarizeVitalityCheck(pattern, totalScore, season)
  }
}
