import type { GrowthEffectType, GrowthRule } from './growthRule.types'
import type { GrowthEvent } from './growthEvent.types'
import type { TreeBranchType, TreeSeason, TreeSnapshot } from './treeSnapshot.types'

export type BranchHealthStatus = 'thriving' | 'stable' | 'weak' | 'needs_recovery'

export type SuggestedAnimationLevel = 'none' | 'subtle' | 'normal' | 'rich'

export interface GrowthEngineOptions {
  generatedAt?: string
  ruleVersion?: string
  snapshotIdPrefix?: string
  animationProfile?: 'low' | 'medium' | 'high'
}

export interface GrowthEngineWarning {
  code:
    | 'missing_rule'
    | 'missing_branch'
    | 'missing_scar'
    | 'rule_failed'
    | 'unsupported_effect'
  message: string
  eventId?: string
  ruleId?: string
}

export interface GrowthIgnoredEvent {
  eventId: string
  reason: string
}

export interface GrowthAppliedEffect {
  id: string
  eventId: string
  ruleId: string
  effectType: GrowthEffectType
  targetBranch?: TreeBranchType
  targetId?: string
  impact: number
  message: string
}

export interface BranchHealthResult {
  branchId: string
  branchType: TreeBranchType
  branchHealthScore: number
  status: BranchHealthStatus
  factors: {
    baseHealth: number
    growth: number
    activity: number
    debtPressure: number
    recoveryScore: number
    recentEventsImpact: number
  }
}

export interface GrowthBranchChange {
  branchId: string
  branchType: TreeBranchType
  vitalityDelta: number
  lengthDelta: number
  activityDelta: number
  statusBefore?: BranchHealthStatus
  statusAfter?: BranchHealthStatus
}

export interface GrowthTransition {
  fromSnapshotId: string
  toSnapshotId: string
  changedBranches: GrowthBranchChange[]
  addedLeaves: string[]
  addedFruits: string[]
  addedScars: string[]
  healedScars: string[]
  vitalityDelta: number
  seasonChanged: {
    changed: boolean
    from: TreeSeason
    to: TreeSeason
  }
  suggestedAnimationLevel: SuggestedAnimationLevel
}

export interface GrowthDeltaSummary {
  vitalityBefore: number
  vitalityAfter: number
  vitalityDelta: number
  branchChanges: GrowthBranchChange[]
  addedLeavesCount: number
  addedFruitsCount: number
  addedScarsCount: number
  healedScarsCount: number
  recoveryNeeded: boolean
  summary: string[]
}

export interface GrowthSimulationResult {
  beforeSnapshotId: string
  afterSnapshotId: string
  eventCount: number
  appliedRuleCount: number
  ignoredEventCount: number
  vitalityBefore: number
  vitalityAfter: number
  branchChanges: GrowthBranchChange[]
  addedLeavesCount: number
  addedFruitsCount: number
  addedScarsCount: number
  healedScarsCount: number
  warnings: GrowthEngineWarning[]
  summary: string[]
  nextSnapshot: TreeSnapshot
  transition: GrowthTransition
  deltaSummary: GrowthDeltaSummary
  appliedEffects: GrowthAppliedEffect[]
  ignoredEvents: GrowthIgnoredEvent[]
}

export interface ApplyGrowthRuleResult {
  snapshot: TreeSnapshot
  appliedEffect?: GrowthAppliedEffect
  warnings: GrowthEngineWarning[]
}

export interface ApplyGrowthEventsResult {
  nextSnapshot: TreeSnapshot
  appliedEffects: GrowthAppliedEffect[]
  ignoredEvents: GrowthIgnoredEvent[]
  warnings: GrowthEngineWarning[]
}

export interface CreateNextTreeSnapshotResult {
  nextSnapshot: TreeSnapshot
  transition: GrowthTransition
  deltaSummary: GrowthDeltaSummary
  appliedEffects: GrowthAppliedEffect[]
  ignoredEvents: GrowthIgnoredEvent[]
  warnings: GrowthEngineWarning[]
}

export interface GrowthEngineInput {
  baseSnapshot: TreeSnapshot
  growthEvents: GrowthEvent[]
  growthRules: GrowthRule[]
  options?: GrowthEngineOptions
}
