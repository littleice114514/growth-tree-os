export type LifeTreeViewMode = 'overview' | 'structure' | 'module' | 'detail' | 'rings'

export type LifeTreeNodeKind =
  | 'tree'
  | 'root'
  | 'trunk'
  | 'trunk_vein'
  | 'major_branch'
  | 'minor_branch'
  | 'leaf'
  | 'flower'
  | 'fruit'
  | 'withered_leaf'
  | 'fallen_leaf'
  | 'soil'
  | 'annual_ring'

export type LifeTreeSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'mixed' | 'unknown'

export type LifeTreeStatus = 'growing' | 'stable' | 'paused' | 'repairing' | 'harvesting' | 'withered' | 'unknown'

export type LifeTreeSourceType = 'tree_snapshot' | 'review' | 'weekly_review' | 'mock'

export type LifeTreeNode = {
  id: string
  title: string
  kind: LifeTreeNodeKind
  status: LifeTreeStatus
  path: string[]
  createdAt: string
  updatedAt: string
  summary: string
  detail: string
  nextStep: string
  x: number
  y: number
  sourceType?: LifeTreeSourceType
  sourceId?: string
}

export type LifeTreeAnnualRing = {
  id: string
  year: number
  title: string
  status: LifeTreeStatus
  keywords: string[]
  summary: string
  nextStep: string
  sourceType?: LifeTreeSourceType
  sourceId?: string
}

export type LifeVitalityTree = {
  title: string
  ownerName: string
  season: LifeTreeSeason
  headline: string
  description: string
  metrics: Array<{
    label: string
    value: string
  }>
  nodes: LifeTreeNode[]
  rings: LifeTreeAnnualRing[]
}

export type LifeVitalityTreeMockData = LifeVitalityTree
