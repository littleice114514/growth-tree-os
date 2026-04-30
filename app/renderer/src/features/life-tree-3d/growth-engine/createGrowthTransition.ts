import type { GrowthBranchChange, GrowthTransition, TreeSnapshot } from '../contracts'
import { clamp } from '../utils/clamp'
import { calculateBranchHealth } from './calculateBranchHealth'

function roundDelta(value: number): number {
  return Math.round(value * 1000) / 1000
}

export function createGrowthTransition(
  fromSnapshot: TreeSnapshot,
  toSnapshot: TreeSnapshot
): GrowthTransition {
  const changedBranches: GrowthBranchChange[] = toSnapshot.branches
    .map((nextBranch): GrowthBranchChange | undefined => {
      const previousBranch = fromSnapshot.branches.find((branch) => branch.id === nextBranch.id)

      if (!previousBranch) {
        return undefined
      }

      const vitalityDelta = roundDelta(nextBranch.vitality - previousBranch.vitality)
      const lengthDelta = roundDelta(nextBranch.length - previousBranch.length)
      const activityDelta = roundDelta(nextBranch.activityLevel - previousBranch.activityLevel)

      if (vitalityDelta === 0 && lengthDelta === 0 && activityDelta === 0) {
        return undefined
      }

      return {
        branchId: nextBranch.id,
        branchType: nextBranch.type,
        vitalityDelta,
        lengthDelta,
        activityDelta,
        statusBefore: calculateBranchHealth(previousBranch, fromSnapshot).status,
        statusAfter: calculateBranchHealth(nextBranch, toSnapshot).status
      }
    })
    .filter((change): change is GrowthBranchChange => Boolean(change))

  const addedLeaves = toSnapshot.leaves
    .filter((leaf) => !fromSnapshot.leaves.some((previousLeaf) => previousLeaf.id === leaf.id))
    .map((leaf) => leaf.id)
  const addedFruits = toSnapshot.fruits
    .filter((fruit) => !fromSnapshot.fruits.some((previousFruit) => previousFruit.id === fruit.id))
    .map((fruit) => fruit.id)
  const addedScars = toSnapshot.scars
    .filter((scar) => !fromSnapshot.scars.some((previousScar) => previousScar.id === scar.id))
    .map((scar) => scar.id)
  const healedScars = toSnapshot.scars
    .filter((scar) => {
      const previousScar = fromSnapshot.scars.find((item) => item.id === scar.id)
      return previousScar && !previousScar.healed && scar.healingProgress > previousScar.healingProgress
    })
    .map((scar) => scar.id)
  const vitalityDelta = toSnapshot.vitality.score - fromSnapshot.vitality.score
  const activityScore = clamp(
    Math.abs(vitalityDelta) + changedBranches.length * 4 + addedLeaves.length + addedFruits.length * 2,
    0,
    100
  )
  const suggestedAnimationLevel =
    activityScore === 0
      ? 'none'
      : activityScore <= 8
        ? 'subtle'
        : activityScore <= 20
          ? 'normal'
          : 'rich'

  return {
    fromSnapshotId: fromSnapshot.id,
    toSnapshotId: toSnapshot.id,
    changedBranches,
    addedLeaves,
    addedFruits,
    addedScars,
    healedScars,
    vitalityDelta,
    seasonChanged: {
      changed: fromSnapshot.season.current !== toSnapshot.season.current,
      from: fromSnapshot.season.current,
      to: toSnapshot.season.current
    },
    suggestedAnimationLevel
  }
}
