import type { GrowthEventSourceModule, GrowthEventType } from './growthEvent.types'
import type { TreeBranchType, TreeSeason } from './treeSnapshot.types'

export type GrowthEffectType =
  | 'increase_vitality'
  | 'decrease_vitality'
  | 'grow_branch'
  | 'weaken_branch'
  | 'add_leaf'
  | 'add_fruit'
  | 'add_scar'
  | 'heal_scar'
  | 'strengthen_root'
  | 'strengthen_trunk'
  | 'shift_season'

export type GrowthTargetTreePart = 'root' | 'trunk' | 'branch' | 'leaf' | 'fruit' | 'scar' | 'ring' | 'season'

export type GrowthDecayStrategy = 'none' | 'daily' | 'weekly' | 'monthly' | 'phase'

export interface GrowthVisualHint {
  tone: 'fresh' | 'warm' | 'dim' | 'repairing' | 'harvest' | 'winter'
  description: string
  seasonShift?: TreeSeason
}

export interface GrowthRule {
  id: string
  eventType: GrowthEventType
  sourceModule: GrowthEventSourceModule
  targetTreePart: GrowthTargetTreePart
  targetBranch?: TreeBranchType
  effectType: GrowthEffectType
  weight: number
  decay: GrowthDecayStrategy
  maxImpact: number
  visualHint: GrowthVisualHint
  note: string
}
