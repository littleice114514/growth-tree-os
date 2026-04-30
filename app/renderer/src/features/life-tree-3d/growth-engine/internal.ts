import type {
  BranchState,
  FruitState,
  LeafState,
  ScarState,
  TreeBranchType,
  TreeSnapshot,
  TreeVitalityPattern
} from '../contracts'
import type { GrowthEvent, GrowthRule } from '../contracts'
import { clamp } from '../utils/clamp'

export function calculateRuleImpact(event: GrowthEvent, rule: GrowthRule): number {
  const rawImpact = event.intensityScore * rule.weight

  if (rule.maxImpact < 0) {
    return clamp(rawImpact, rule.maxImpact, 0)
  }

  return clamp(rawImpact, 0, rule.maxImpact)
}

export function toUnitImpact(impact: number): number {
  return impact / 100
}

export function findTargetBranch(
  snapshot: TreeSnapshot,
  targetBranch?: TreeBranchType
): BranchState | undefined {
  if (targetBranch) {
    return snapshot.branches.find((branch) => branch.type === targetBranch)
  }

  return snapshot.branches[0]
}

export function replaceBranch(snapshot: TreeSnapshot, updatedBranch: BranchState): TreeSnapshot {
  return {
    ...snapshot,
    branches: snapshot.branches.map((branch) =>
      branch.id === updatedBranch.id ? updatedBranch : branch
    )
  }
}

export function createLeaf(event: GrowthEvent, branch: BranchState, impact: number): LeafState {
  return {
    id: `leaf-${event.id}`,
    nodeId: event.metadata.relatedNodeId ?? `node-${event.id}`,
    branchId: branch.id,
    sourceEventId: event.id,
    status: impact >= 0 ? 'fresh' : 'withered',
    vitality: clamp(0.55 + Math.max(impact, 0) / 10, 0, 1),
    ageDays: 0,
    size: clamp(0.42 + Math.max(impact, 0) / 20, 0.2, 1),
    colorToken: impact >= 0 ? 'spring' : 'dim'
  }
}

export function createFruit(event: GrowthEvent, branch: BranchState, impact: number): FruitState {
  return {
    id: `fruit-${event.id}`,
    nodeId: event.metadata.relatedNodeId ?? `node-${event.id}`,
    branchId: branch.id,
    sourceEventId: event.id,
    resultType: branch.type === 'wealth' ? 'income' : branch.type === 'project' ? 'workflow' : 'review',
    maturity: clamp(0.35 + Math.max(impact, 0) / 10, 0, 1),
    reusable: branch.type === 'project' || branch.type === 'study',
    archivedToRing: false
  }
}

export function createScar(event: GrowthEvent, branch: BranchState, impact: number): ScarState {
  const severity = clamp(Math.abs(impact) / 10, 0.05, 0.6)

  return {
    id: `scar-${event.id}`,
    nodeId: event.metadata.relatedNodeId ?? `node-${event.id}`,
    targetPart: 'branch',
    targetId: branch.id,
    sourceEventId: event.id,
    severity,
    healed: false,
    healingProgress: 0,
    label: `${branch.label} repair signal`
  }
}

export function determinePattern(
  score: number,
  repairNeeded: boolean,
  previousPattern: TreeVitalityPattern
): TreeVitalityPattern {
  if (repairNeeded) {
    return 'repairing'
  }

  if (score >= 76) {
    return 'growing'
  }

  if (score >= 50) {
    return 'stable'
  }

  return previousPattern === 'burning' ? 'burning' : 'scattered'
}
