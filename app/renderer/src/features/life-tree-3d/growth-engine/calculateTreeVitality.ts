import type { TreeSnapshot } from '../contracts'
import { clamp } from '../utils/clamp'
import { calculateBranchHealth } from './calculateBranchHealth'

export function calculateTreeVitality(snapshot: TreeSnapshot): number {
  const branchHealthScores = snapshot.branches.map(
    (branch) => calculateBranchHealth(branch, snapshot).branchHealthScore
  )
  const averageBranchHealth =
    branchHealthScores.length > 0
      ? branchHealthScores.reduce((total, score) => total + score, 0) / branchHealthScores.length
      : 50
  const fruitScore = clamp(
    snapshot.fruits.reduce((total, fruit) => total + fruit.maturity * 100, 0) /
      Math.max(snapshot.fruits.length, 1),
    0,
    100
  )
  const scarPressure = clamp(
    snapshot.scars
      .filter((scar) => !scar.healed)
      .reduce((total, scar) => total + scar.severity * 100 * (1 - scar.healingProgress), 0),
    0,
    100
  )

  // M3D-2 placeholder formula. These weights are intentionally easy to replace
  // in later phases after real growth data and renderer feedback exist.
  const vitality =
    snapshot.root.stability * 100 * 0.25 +
    snapshot.trunk.stability * 100 * 0.25 +
    averageBranchHealth * 0.25 +
    fruitScore * 0.15 -
    scarPressure * 0.1

  return Math.round(clamp(vitality, 0, 100))
}
