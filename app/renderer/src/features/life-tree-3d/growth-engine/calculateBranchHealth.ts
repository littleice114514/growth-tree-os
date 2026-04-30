import type { BranchHealthResult, BranchState, TreeSnapshot } from '../contracts'
import { clamp } from '../utils/clamp'

export function calculateBranchHealth(
  branch: BranchState,
  snapshot?: TreeSnapshot,
  recentEventsImpact = 0
): BranchHealthResult {
  const baseHealth = clamp(branch.vitality * 100, 0, 100)
  const growth = clamp((branch.length * 45 + branch.radius * 220) / 2, 0, 100)
  const activity = clamp(branch.activityLevel * 100, 0, 100)
  const branchScars =
    snapshot?.scars.filter((scar) => scar.targetId === branch.id && !scar.healed) ?? []
  const debtPressure = clamp(
    branchScars.reduce((total, scar) => total + scar.severity * 100, 0),
    0,
    100
  )
  const recoveryScore = clamp(
    branch.type === 'recovery' ? 72 + branch.activityLevel * 20 : 100 - debtPressure,
    0,
    100
  )

  const branchHealthScore = clamp(
    baseHealth * 0.35 +
      growth * 0.2 +
      activity * 0.2 +
      recoveryScore * 0.15 +
      recentEventsImpact -
      debtPressure * 0.1,
    0,
    100
  )

  const status =
    branchHealthScore >= 78
      ? 'thriving'
      : branchHealthScore >= 55
        ? 'stable'
        : branchHealthScore >= 35
          ? 'weak'
          : 'needs_recovery'

  return {
    branchId: branch.id,
    branchType: branch.type,
    branchHealthScore,
    status,
    factors: {
      baseHealth,
      growth,
      activity,
      debtPressure,
      recoveryScore,
      recentEventsImpact
    }
  }
}
