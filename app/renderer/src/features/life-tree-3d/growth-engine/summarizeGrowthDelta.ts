import type { GrowthDeltaSummary, GrowthTransition, TreeSnapshot } from '../contracts'

function describeBranchDelta(change: GrowthTransition['changedBranches'][number]): string {
  if (change.vitalityDelta > 0 || change.lengthDelta > 0) {
    return `${change.branchType} 枝干增强`
  }

  if (change.vitalityDelta < 0 || change.activityDelta < 0) {
    return `${change.branchType} 枝干需要恢复`
  }

  return `${change.branchType} 枝干发生轻微变化`
}

export function summarizeGrowthDelta(
  fromSnapshot: TreeSnapshot,
  toSnapshot: TreeSnapshot,
  transition: GrowthTransition
): GrowthDeltaSummary {
  const summary = transition.changedBranches.map(describeBranchDelta)

  if (transition.addedLeaves.length > 0) {
    summary.push(`新增 ${transition.addedLeaves.length} 片叶子`)
  }

  if (transition.addedFruits.length > 0) {
    summary.push(`新增 ${transition.addedFruits.length} 个果实`)
  }

  if (transition.addedScars.length > 0) {
    summary.push(`时间负债或注意力压力产生 ${transition.addedScars.length} 条裂痕`)
  }

  if (transition.healedScars.length > 0) {
    summary.push(`修复行动推进 ${transition.healedScars.length} 条裂痕愈合`)
  }

  if (transition.vitalityDelta > 0) {
    summary.push('整体生命力上升')
  } else if (transition.vitalityDelta < 0) {
    summary.push('整体生命力轻微下降，建议进入恢复模式')
  }

  if (transition.seasonChanged.changed) {
    summary.push(`季节从 ${transition.seasonChanged.from} 调整为 ${transition.seasonChanged.to}`)
  }

  if (summary.length === 0) {
    summary.push('本轮没有明显生长变化')
  }

  return {
    vitalityBefore: fromSnapshot.vitality.score,
    vitalityAfter: toSnapshot.vitality.score,
    vitalityDelta: transition.vitalityDelta,
    branchChanges: transition.changedBranches,
    addedLeavesCount: transition.addedLeaves.length,
    addedFruitsCount: transition.addedFruits.length,
    addedScarsCount: transition.addedScars.length,
    healedScarsCount: transition.healedScars.length,
    recoveryNeeded: toSnapshot.vitality.repairNeeded,
    summary
  }
}
