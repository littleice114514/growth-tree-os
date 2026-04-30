import type { BranchState, FruitState, LeafState, ScarState, TreeSnapshot } from '../contracts'

export type ProceduralTreeNodeType = 'trunk' | 'branch' | 'leaf' | 'fruit' | 'scar' | 'label'
export type ProceduralTreeStatus = 'fresh' | 'stable' | 'withered' | 'fallen' | 'healed' | 'active' | 'weak'

export type Vector3Tuple = [number, number, number]

export interface ProceduralTreeLayoutNode {
  id: string
  nodeId: string
  type: ProceduralTreeNodeType
  branchId: string
  position: Vector3Tuple
  rotation: Vector3Tuple
  scale: Vector3Tuple
  intensity: number
  status: ProceduralTreeStatus
  sourceModule?: string
  label?: string
}

export interface ProceduralTreeLayout {
  trunk: ProceduralTreeLayoutNode
  branches: ProceduralTreeLayoutNode[]
  leaves: ProceduralTreeLayoutNode[]
  fruits: ProceduralTreeLayoutNode[]
  scars: ProceduralTreeLayoutNode[]
  labels: ProceduralTreeLayoutNode[]
}

const branchAngles = new Map<string, number>([
  ['study', Math.PI * 0.92],
  ['project', Math.PI * 0.14],
  ['health', Math.PI * 0.44],
  ['wealth', Math.PI * 1.76],
  ['relationship', Math.PI * 1.26],
  ['expression', Math.PI * 0.72],
  ['attention', Math.PI * 1.54],
  ['recovery', Math.PI * 0.02]
])

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function resolveBranchAngle(branch: BranchState, index: number) {
  return branchAngles.get(branch.type) ?? (Math.PI * 2 * index) / 8
}

function positionAroundBranch(branch: BranchState, index: number, total: number, offset: number): Vector3Tuple {
  const branchIndex = Math.max(0, Number(branch.id.split('-').pop()) || index)
  const baseAngle = resolveBranchAngle(branch, branchIndex)
  const spread = total <= 1 ? 0 : (index / (total - 1) - 0.5) * 0.52
  const angle = baseAngle + spread
  const length = 0.72 + branch.length * 1.35 + offset
  const height = 1.25 + branch.depth * 0.18 + branch.vitality * 1.1 + (index % 5) * 0.05

  return [Math.cos(angle) * length, height, Math.sin(angle) * length]
}

function createBranchNode(branch: BranchState, index: number): ProceduralTreeLayoutNode {
  const angle = resolveBranchAngle(branch, index)
  const vitality = clamp01(branch.vitality)
  const length = 1.1 + branch.length * 1.7
  const radius = Math.max(0.06, branch.radius * 0.75)
  const status: ProceduralTreeStatus = vitality < 0.5 ? 'weak' : branch.activityLevel > 0.7 ? 'active' : 'stable'

  return {
    id: branch.id,
    nodeId: branch.id,
    type: 'branch',
    branchId: branch.id,
    position: [Math.cos(angle) * length * 0.32, 1.35 + branch.depth * 0.18, Math.sin(angle) * length * 0.32],
    rotation: [Math.PI / 2.8, 0, -angle + Math.PI / 2],
    scale: [radius, length, radius],
    intensity: vitality,
    status,
    sourceModule: 'TreeSnapshot.branches',
    label: branch.label
  }
}

function createLeafNode(leaf: LeafState, branch: BranchState, index: number, total: number): ProceduralTreeLayoutNode {
  return {
    id: leaf.id,
    nodeId: leaf.nodeId,
    type: 'leaf',
    branchId: leaf.branchId,
    position: positionAroundBranch(branch, index, total, 0.1),
    rotation: [0.22 + (index % 4) * 0.12, (index % 7) * 0.38, (index % 5) * 0.3],
    scale: [0.12 + leaf.size * 0.1, 0.05, 0.2 + leaf.size * 0.12],
    intensity: clamp01(leaf.vitality),
    status: leaf.status,
    sourceModule: `mock:${leaf.sourceEventId}`
  }
}

function createFruitNode(fruit: FruitState, branch: BranchState, index: number, total: number): ProceduralTreeLayoutNode {
  return {
    id: fruit.id,
    nodeId: fruit.nodeId,
    type: 'fruit',
    branchId: fruit.branchId,
    position: positionAroundBranch(branch, index, total, 0.35),
    rotation: [0, 0, 0],
    scale: [0.16 + fruit.maturity * 0.14, 0.16 + fruit.maturity * 0.14, 0.16 + fruit.maturity * 0.14],
    intensity: clamp01(fruit.maturity),
    status: fruit.maturity > 0.65 ? 'active' : 'stable',
    sourceModule: `mock:${fruit.sourceEventId}`,
    label: fruit.resultType
  }
}

function createScarNode(scar: ScarState, branch: BranchState | undefined, index: number): ProceduralTreeLayoutNode {
  const branchPosition = branch ? positionAroundBranch(branch, index, Math.max(1, branch.scarIds.length), -0.15) : [0.2, 1.1, 0.2] as Vector3Tuple

  return {
    id: scar.id,
    nodeId: scar.nodeId,
    type: 'scar',
    branchId: scar.targetId,
    position: scar.targetPart === 'trunk' ? [0.2, 1 + index * 0.16, 0.1] : branchPosition,
    rotation: [0.3, 0.4 + index * 0.2, 0],
    scale: [0.09 + scar.severity * 0.09, 0.03, 0.2 + scar.severity * 0.16],
    intensity: clamp01(scar.severity),
    status: scar.healed ? 'healed' : 'weak',
    sourceModule: `mock:${scar.sourceEventId}`,
    label: scar.label
  }
}

export function createProceduralTreeLayout(snapshot: TreeSnapshot): ProceduralTreeLayout {
  const branches = snapshot.branches.map(createBranchNode)
  const branchById = new Map(snapshot.branches.map((branch) => [branch.id, branch]))
  const leavesByBranch = new Map<string, LeafState[]>()
  const fruitsByBranch = new Map<string, FruitState[]>()

  snapshot.leaves.forEach((leaf) => {
    leavesByBranch.set(leaf.branchId, [...(leavesByBranch.get(leaf.branchId) ?? []), leaf])
  })
  snapshot.fruits.forEach((fruit) => {
    fruitsByBranch.set(fruit.branchId, [...(fruitsByBranch.get(fruit.branchId) ?? []), fruit])
  })

  const leaves = snapshot.leaves.map((leaf, index) => {
    const branch = branchById.get(leaf.branchId) ?? snapshot.branches[index % snapshot.branches.length]
    const branchLeaves = leavesByBranch.get(leaf.branchId) ?? []
    return createLeafNode(leaf, branch, Math.max(0, branchLeaves.findIndex((item) => item.id === leaf.id)), branchLeaves.length)
  })

  const fruits = snapshot.fruits.map((fruit, index) => {
    const branch = branchById.get(fruit.branchId) ?? snapshot.branches[index % snapshot.branches.length]
    const branchFruits = fruitsByBranch.get(fruit.branchId) ?? []
    return createFruitNode(fruit, branch, Math.max(0, branchFruits.findIndex((item) => item.id === fruit.id)), branchFruits.length)
  })

  const scars = snapshot.scars.map((scar, index) => createScarNode(scar, branchById.get(scar.targetId), index))

  const labels = snapshot.branches.map((branch, index) => {
    const angle = resolveBranchAngle(branch, index)
    const length = 1.15 + branch.length * 1.85
    return {
      id: `label-${branch.id}`,
      nodeId: branch.id,
      type: 'label' as const,
      branchId: branch.id,
      position: [Math.cos(angle) * length, 2.7 + branch.vitality * 0.28, Math.sin(angle) * length] as Vector3Tuple,
      rotation: [0, 0, 0] as Vector3Tuple,
      scale: [1, 1, 1] as Vector3Tuple,
      intensity: clamp01(branch.vitality),
      status: branch.vitality < 0.5 ? 'weak' as const : 'stable' as const,
      sourceModule: 'TreeSnapshot.branches',
      label: branch.label
    }
  })

  return {
    trunk: {
      id: snapshot.trunk.id,
      nodeId: snapshot.trunk.id,
      type: 'trunk',
      branchId: 'trunk',
      position: [0, snapshot.trunk.height * 0.7, 0],
      rotation: [0, 0, 0],
      scale: [snapshot.trunk.radius, snapshot.trunk.height, snapshot.trunk.radius],
      intensity: clamp01(snapshot.trunk.stability),
      status: snapshot.trunk.pressure > 0.55 ? 'weak' : 'stable',
      sourceModule: 'TreeSnapshot.trunk'
    },
    branches,
    leaves,
    fruits,
    scars,
    labels
  }
}
