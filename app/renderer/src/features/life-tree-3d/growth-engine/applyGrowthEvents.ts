import type {
  ApplyGrowthEventsResult,
  GrowthAppliedEffect,
  GrowthEngineWarning,
  GrowthEvent,
  GrowthRule,
  TreeSnapshot
} from '../contracts'
import { applyGrowthRule } from './applyGrowthRule'

function getEventTime(event: GrowthEvent): number {
  return new Date(event.occurredAt).getTime()
}

export function applyGrowthEvents(
  baseSnapshot: TreeSnapshot,
  events: GrowthEvent[],
  rules: GrowthRule[]
): ApplyGrowthEventsResult {
  const sortedEvents = [...events].sort((left, right) => getEventTime(left) - getEventTime(right))
  const appliedEffects: GrowthAppliedEffect[] = []
  const ignoredEvents: ApplyGrowthEventsResult['ignoredEvents'] = []
  const warnings: GrowthEngineWarning[] = []

  let nextSnapshot = baseSnapshot

  for (const event of sortedEvents) {
    const matchedRules = rules.filter(
      (rule) => rule.eventType === event.type && rule.sourceModule === event.sourceModule
    )

    if (matchedRules.length === 0) {
      ignoredEvents.push({
        eventId: event.id,
        reason: `No growth rule matched ${event.type} from ${event.sourceModule}.`
      })
      warnings.push({
        code: 'missing_rule',
        eventId: event.id,
        message: `Ignored event ${event.id}; no matching growth rule.`
      })
      continue
    }

    for (const rule of matchedRules) {
      try {
        const result = applyGrowthRule(nextSnapshot, event, rule)
        nextSnapshot = result.snapshot
        warnings.push(...result.warnings)

        if (result.appliedEffect) {
          appliedEffects.push(result.appliedEffect)
        }
      } catch (error) {
        warnings.push({
          code: 'rule_failed',
          eventId: event.id,
          ruleId: rule.id,
          message: error instanceof Error ? error.message : `Rule ${rule.id} failed.`
        })
      }
    }
  }

  return {
    nextSnapshot,
    appliedEffects,
    ignoredEvents,
    warnings
  }
}
