import type { GrowthSimulationResult } from '../contracts'
import { mockGrowthEvents } from '../mock/mockGrowthEvents'
import { mockTreeSnapshot } from '../mock/mockTreeSnapshot'
import { defaultGrowthRules } from '../rules/defaultGrowthRules'
import { createNextTreeSnapshot } from './createNextTreeSnapshot'

export function runMockGrowthSimulation(): GrowthSimulationResult {
  const result = createNextTreeSnapshot({
    baseSnapshot: mockTreeSnapshot,
    growthEvents: mockGrowthEvents,
    growthRules: defaultGrowthRules,
    options: {
      generatedAt: '2026-04-30T10:00:00+08:00',
      ruleVersion: 'm3d-2-growth-engine'
    }
  })

  return {
    beforeSnapshotId: mockTreeSnapshot.id,
    afterSnapshotId: result.nextSnapshot.id,
    eventCount: mockGrowthEvents.length,
    appliedRuleCount: result.appliedEffects.length,
    ignoredEventCount: result.ignoredEvents.length,
    vitalityBefore: mockTreeSnapshot.vitality.score,
    vitalityAfter: result.nextSnapshot.vitality.score,
    branchChanges: result.deltaSummary.branchChanges,
    addedLeavesCount: result.deltaSummary.addedLeavesCount,
    addedFruitsCount: result.deltaSummary.addedFruitsCount,
    addedScarsCount: result.deltaSummary.addedScarsCount,
    healedScarsCount: result.deltaSummary.healedScarsCount,
    warnings: result.warnings,
    summary: result.deltaSummary.summary,
    nextSnapshot: result.nextSnapshot,
    transition: result.transition,
    deltaSummary: result.deltaSummary,
    appliedEffects: result.appliedEffects,
    ignoredEvents: result.ignoredEvents
  }
}
