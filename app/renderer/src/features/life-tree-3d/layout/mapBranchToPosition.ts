import type { TreeBranchType } from '../contracts'
import type { Vector3Tuple } from './createProceduralTreeLayout'

const branchPositions: Record<TreeBranchType, Vector3Tuple> = {
  study: [-1.6, 2.1, 0.7],
  project: [1.75, 2.4, 0.35],
  health: [0.8, 2.05, 1.45],
  wealth: [-0.4, 2.1, -1.7],
  relationship: [-1.2, 2.35, -0.95],
  expression: [-0.95, 2.65, 1.1],
  attention: [0.25, 1.65, -1.35],
  recovery: [1.55, 1.95, -0.12]
}

export function mapBranchToPosition(branchType: TreeBranchType): Vector3Tuple {
  return branchPositions[branchType]
}
