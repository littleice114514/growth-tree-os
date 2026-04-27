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

export type VitalityDimension =
  | 'agency'
  | 'sensitivity'
  | 'recovery'
  | 'creativity'
  | 'connection'
  | 'bodyEnergy'
  | 'directionAlignment'

export interface VitalityCheckItem {
  dimension: VitalityDimension
  label: string
  question: string
  score: number
  note?: string
}

export type VitalityPattern =
  | 'strong_growth'
  | 'normal_growth'
  | 'repairing'
  | 'burning'
  | 'numb'
  | 'out_of_control'
  | 'scattered'
  | 'unknown'

export interface DailyVitalityCheck {
  id: string
  date: string
  items: VitalityCheckItem[]
  totalScore: number
  pattern: VitalityPattern
  season: LifeTreeSeason
  summary: string
}

export type TreeVisualTone = 'fresh' | 'lush' | 'harvest' | 'quiet' | 'burning' | 'dim' | 'scattered' | 'unknown'

export interface LifeTreeVisualState {
  tone: TreeVisualTone
  season: LifeTreeSeason
  trunkState: string
  leafState: string
  rootState: string
  fruitState: string
  fallenLeafState: string
  summary: string
  warnings: string[]
  highlights: string[]
}

export interface LifeVitalityTreeSourceData {
  reviews?: unknown[]
  nodes?: unknown[]
  treeSnapshot?: unknown
}

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
  dataSource?: {
    label: string
    mode: 'mapped' | 'mock'
    nodeCount: number
    leafCount: number
    fruitCount: number
    fallenLeafCount: number
    latestUpdatedAt: string
  }
}

export type LifeVitalityTreeMockData = LifeVitalityTree
