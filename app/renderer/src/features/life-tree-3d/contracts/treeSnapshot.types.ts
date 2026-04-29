import type { QualityProfileName } from './qualityProfile.types'
import type { RendererMode } from './renderer.types'
import type { TreeAgeStage, TreeTimelineScale } from './treeTimeline.types'

export type TreeBranchType =
  | 'study'
  | 'project'
  | 'health'
  | 'wealth'
  | 'relationship'
  | 'expression'
  | 'attention'
  | 'recovery'

export type TreeSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'mixed' | 'unknown'

export type TreeVitalityPattern = 'growing' | 'stable' | 'repairing' | 'burning' | 'scattered' | 'unknown'

export interface TreeVitalityState {
  score: number
  pattern: TreeVitalityPattern
  trend: 'up' | 'flat' | 'down'
  repairNeeded: boolean
}

export interface RootState {
  id: string
  depth: number
  density: number
  stability: number
  nutrients: Array<{
    sourceEventId: string
    type: 'review' | 'health' | 'wealth_safety' | 'relationship' | 'habit'
    strength: number
  }>
}

export interface TrunkState {
  id: string
  height: number
  radius: number
  stability: number
  pressure: number
  ringIds: string[]
  scarIds: string[]
}

export interface BranchState {
  id: string
  type: TreeBranchType
  label: string
  depth: number
  length: number
  radius: number
  vitality: number
  activityLevel: number
  directionBias: 'left' | 'right' | 'up' | 'down' | 'balanced'
  leafIds: string[]
  fruitIds: string[]
  scarIds: string[]
}

export interface LeafState {
  id: string
  nodeId: string
  branchId: string
  sourceEventId: string
  status: 'fresh' | 'stable' | 'withered' | 'fallen'
  vitality: number
  ageDays: number
  size: number
  colorToken: 'spring' | 'summer' | 'autumn' | 'winter' | 'dim'
}

export interface FruitState {
  id: string
  nodeId: string
  branchId: string
  sourceEventId: string
  resultType: 'delivery' | 'income' | 'award' | 'workflow' | 'version' | 'review'
  maturity: number
  reusable: boolean
  archivedToRing: boolean
}

export interface ScarState {
  id: string
  nodeId: string
  targetPart: 'trunk' | 'branch' | 'root'
  targetId: string
  sourceEventId: string
  severity: number
  healed: boolean
  healingProgress: number
  label: string
}

export interface RingState {
  id: string
  year: number
  phaseId?: string
  summary: string
  vitalityAverage: number
  fruitCount: number
  scarCount: number
  dominantBranches: TreeBranchType[]
}

export interface SeasonState {
  current: TreeSeason
  reason: string
  growthBias: number
  repairBias: number
  harvestBias: number
  burnoutRisk: number
}

export interface TreeSnapshot {
  id: string
  snapshotDate: string
  timelineScale: TreeTimelineScale
  treeAgeStage: TreeAgeStage
  vitality: TreeVitalityState
  root: RootState
  trunk: TrunkState
  branches: BranchState[]
  leaves: LeafState[]
  fruits: FruitState[]
  scars: ScarState[]
  rings: RingState[]
  season: SeasonState
  qualityHint: QualityProfileName
  rendererModeHint: RendererMode
  sourceEventIds: string[]
  generatedByRuleVersion: string
  createdAt: string
  updatedAt: string
}
