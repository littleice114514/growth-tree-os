import type { GrowthEvent } from './growthEvent.types'
import type { GrowthRule } from './growthRule.types'
import type { TreeSnapshot } from './treeSnapshot.types'

export type TreeTimelineScale = 'daily' | 'weekly' | 'monthly' | 'semester' | 'yearly' | 'custom_phase'

export type TreeAgeStage = 'seedling' | 'young_tree' | 'expanding_tree' | 'mature_tree' | 'ancient_tree'

export interface TreeSnapshotRange {
  scale: TreeTimelineScale
  from: string
  to: string
  snapshotIds: string[]
}

export interface TreeGrowthTransition {
  previousSnapshot: TreeSnapshot
  events: GrowthEvent[]
  rules: GrowthRule[]
  nextSnapshot: TreeSnapshot
  generatedAt: string
  ruleVersion: string
  note: 'previous TreeSnapshot + GrowthEvent[] + GrowthRule[] = next TreeSnapshot'
}
