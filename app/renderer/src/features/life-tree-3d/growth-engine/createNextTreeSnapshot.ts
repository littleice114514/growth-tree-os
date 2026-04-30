import type { CreateNextTreeSnapshotResult, GrowthEngineInput, TreeSnapshot } from '../contracts'
import { applyGrowthEvents } from './applyGrowthEvents'
import { calculateBranchHealth } from './calculateBranchHealth'
import { calculateTreeVitality } from './calculateTreeVitality'
import { createGrowthTransition } from './createGrowthTransition'
import { determinePattern } from './internal'
import { summarizeGrowthDelta } from './summarizeGrowthDelta'

function createSnapshotId(baseSnapshot: TreeSnapshot, generatedAt: string, prefix?: string): string {
  const dateKey = generatedAt.slice(0, 10)
  return `${prefix ?? 'tree-snapshot-m3d-2'}-${dateKey}-${baseSnapshot.id}`
}

export function createNextTreeSnapshot({
  baseSnapshot,
  growthEvents,
  growthRules,
  options
}: GrowthEngineInput): CreateNextTreeSnapshotResult {
  const generatedAt = options?.generatedAt ?? new Date().toISOString()
  const eventResult = applyGrowthEvents(baseSnapshot, growthEvents, growthRules)
  const recalculatedVitality = calculateTreeVitality(eventResult.nextSnapshot)
  const averageBranchHealth =
    eventResult.nextSnapshot.branches.reduce(
      (total, branch) => total + calculateBranchHealth(branch, eventResult.nextSnapshot).branchHealthScore,
      0
    ) / Math.max(eventResult.nextSnapshot.branches.length, 1)
  const repairNeeded =
    eventResult.nextSnapshot.scars.some((scar) => !scar.healed) ||
    averageBranchHealth < 55 ||
    eventResult.nextSnapshot.season.current === 'winter'

  const nextSnapshot: TreeSnapshot = {
    ...eventResult.nextSnapshot,
    id: createSnapshotId(baseSnapshot, generatedAt, options?.snapshotIdPrefix),
    vitality: {
      score: recalculatedVitality,
      trend:
        recalculatedVitality > baseSnapshot.vitality.score
          ? 'up'
          : recalculatedVitality < baseSnapshot.vitality.score
            ? 'down'
            : 'flat',
      pattern: determinePattern(
        recalculatedVitality,
        repairNeeded,
        baseSnapshot.vitality.pattern
      ),
      repairNeeded
    },
    sourceEventIds: Array.from(
      new Set([...baseSnapshot.sourceEventIds, ...growthEvents.map((event) => event.id)])
    ),
    generatedByRuleVersion: options?.ruleVersion ?? 'm3d-2-growth-engine',
    updatedAt: generatedAt
  }
  const transition = createGrowthTransition(baseSnapshot, nextSnapshot)
  const deltaSummary = summarizeGrowthDelta(baseSnapshot, nextSnapshot, transition)

  return {
    nextSnapshot,
    transition,
    deltaSummary,
    appliedEffects: eventResult.appliedEffects,
    ignoredEvents: eventResult.ignoredEvents,
    warnings: eventResult.warnings
  }
}
