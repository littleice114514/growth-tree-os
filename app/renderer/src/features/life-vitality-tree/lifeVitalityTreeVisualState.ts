import type { DailyVitalityCheck, LifeTreeNodeKind, LifeTreeVisualState, VitalityPattern } from './lifeVitalityTreeTypes'

const visualStates: Record<VitalityPattern, LifeTreeVisualState> = {
  strong_growth: {
    tone: 'fresh',
    season: 'spring',
    trunkState: '主线挺直，供给充足',
    leafState: '新叶增加，行动正在喂养主线',
    rootState: '根系状态可支撑当前生长',
    fruitState: '有机会形成阶段性成果',
    fallenLeafState: '落叶压力较低',
    summary: '当前处于强生长状态，适合推进主线，但仍需避免过度燃烧',
    warnings: ['注意不要把高能量误用成透支'],
    highlights: ['主动性强', '创造力强', '方向一致性较好']
  },
  normal_growth: {
    tone: 'fresh',
    season: 'spring',
    trunkState: '主线稳定',
    leafState: '行动有持续生长',
    rootState: '底层支撑基本正常',
    fruitState: '成果正在积累',
    fallenLeafState: '有少量落叶但不影响整体',
    summary: '当前处于正常生长状态，适合保持节奏',
    warnings: [],
    highlights: ['节奏稳定', '可以继续积累']
  },
  repairing: {
    tone: 'quiet',
    season: 'winter',
    trunkState: '主线暂时放慢，但没有断裂',
    leafState: '新叶减少，重点转向修复',
    rootState: '根系正在吸收经验',
    fruitState: '不急于结果',
    fallenLeafState: '落叶可以进入土壤',
    summary: '当前处于修复状态，重点不是爆发，而是把失败和低谷转化为养分',
    warnings: ['不要把修复期误判为失败'],
    highlights: ['恢复力正在发挥作用', '适合复盘和整理']
  },
  burning: {
    tone: 'burning',
    season: 'summer',
    trunkState: '主线推进很强，但供给压力偏大',
    leafState: '行动密集，可能消耗过快',
    rootState: '根部有透支风险',
    fruitState: '可能短期结果明显',
    fallenLeafState: '后续可能出现集中落叶',
    summary: '当前像是在燃烧自己换取推进，需要检查身体能量和恢复力',
    warnings: ['身体能量偏低', '存在透支风险', '需要安排恢复'],
    highlights: ['主动性强', '创造力强']
  },
  numb: {
    tone: 'dim',
    season: 'winter',
    trunkState: '主线存在但活性不足',
    leafState: '叶片颜色变淡，行动缺少真实感',
    rootState: '根系供给变弱',
    fruitState: '不适合强求结果',
    fallenLeafState: '可能有未处理的低能量堆积',
    summary: '当前生命感偏低，需要先恢复感受力和主动性',
    warnings: ['感受力偏低', '创造力偏低', '主动性不足'],
    highlights: ['适合从一个很小的主动动作开始']
  },
  out_of_control: {
    tone: 'scattered',
    season: 'winter',
    trunkState: '主线被外界拉扯',
    leafState: '叶片被乱风影响，行动容易中断',
    rootState: '根系需要稳定环境',
    fruitState: '暂时不以结果为中心',
    fallenLeafState: '落叶增加，需要复盘触发点',
    summary: '当前被外界牵引较多，重点是找回一个最小主动选择',
    warnings: ['主动性较低', '恢复力不足', '容易被游戏/短视频/社交打断'],
    highlights: ['可以先做一个 5 分钟可完成动作']
  },
  scattered: {
    tone: 'scattered',
    season: 'mixed',
    trunkState: '主线供给被多个方向分散',
    leafState: '叶子不少，但可能没有进入主线',
    rootState: '根系消耗分散',
    fruitState: '成果沉淀不足',
    fallenLeafState: '无效行动可能变成落叶',
    summary: '当前不是没做事，而是行动可能没有集中喂养主线',
    warnings: ['方向一致性偏低', '行动可能空转'],
    highlights: ['适合收束到一个主线动作']
  },
  unknown: {
    tone: 'unknown',
    season: 'unknown',
    trunkState: '暂无判断',
    leafState: '暂无判断',
    rootState: '暂无判断',
    fruitState: '暂无判断',
    fallenLeafState: '暂无判断',
    summary: '暂无足够数据判断今日生命力状态',
    warnings: [],
    highlights: []
  }
}

export function getDefaultLifeTreeVisualState(): LifeTreeVisualState {
  return visualStates.unknown
}

export function buildLifeTreeVisualState(check: DailyVitalityCheck | null | undefined): LifeTreeVisualState {
  if (!check) {
    return getDefaultLifeTreeVisualState()
  }

  return visualStates[check.pattern] ?? getDefaultLifeTreeVisualState()
}

export function getNodeVitalityHint(nodeKind: LifeTreeNodeKind, visualState: LifeTreeVisualState) {
  if (visualState.tone === 'unknown') {
    return '今日生命力状态还不清楚，先完成一次生命力检查，再观察它对这部分树结构的影响。'
  }

  if (nodeKind === 'trunk' || nodeKind === 'trunk_vein' || nodeKind === 'major_branch' || nodeKind === 'minor_branch') {
    return `当前树干反馈：${visualState.trunkState}。${visualState.summary}`
  }
  if (nodeKind === 'leaf') {
    return `当前叶片反馈：${visualState.leafState}。可以用它判断今日行动是否真正喂养主线。`
  }
  if (nodeKind === 'root' || nodeKind === 'soil') {
    return `当前根系反馈：${visualState.rootState}。如果状态偏低，优先照顾睡眠、身体、复盘和底层支撑。`
  }
  if (nodeKind === 'fruit' || nodeKind === 'flower') {
    return `当前成果反馈：${visualState.fruitState}。成果可以推进，但不要让结果压力压过生命力本身。`
  }
  if (nodeKind === 'fallen_leaf' || nodeKind === 'withered_leaf') {
    return `当前落叶反馈：${visualState.fallenLeafState}。重点是让问题进入复盘，而不是把它当作失败判决。`
  }
  if (nodeKind === 'annual_ring') {
    return `当前年轮反馈：${visualState.summary} 这类状态后续可以沉淀进年度复盘。`
  }

  return visualState.summary
}
