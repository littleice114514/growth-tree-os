import type { ApplyGrowthRuleResult, GrowthAppliedEffect, GrowthEvent, GrowthRule } from '../contracts'
import { clamp } from '../utils/clamp'
import {
  calculateRuleImpact,
  createFruit,
  createLeaf,
  createScar,
  findTargetBranch,
  replaceBranch,
  toUnitImpact
} from './internal'

export function applyGrowthRule(
  snapshot: ApplyGrowthRuleResult['snapshot'],
  event: GrowthEvent,
  rule: GrowthRule
): ApplyGrowthRuleResult {
  const impact = calculateRuleImpact(event, rule)
  const unitImpact = toUnitImpact(impact)
  const effectBase: Omit<GrowthAppliedEffect, 'targetId' | 'message'> = {
    id: `effect-${event.id}-${rule.id}`,
    eventId: event.id,
    ruleId: rule.id,
    effectType: rule.effectType,
    targetBranch: rule.targetBranch,
    impact
  }

  const targetBranch = findTargetBranch(snapshot, rule.targetBranch)

  switch (rule.effectType) {
    case 'increase_vitality': {
      const nextScore = clamp(snapshot.vitality.score + Math.max(impact, 0), 0, 100)
      return {
        snapshot: {
          ...snapshot,
          vitality: {
            ...snapshot.vitality,
            score: nextScore,
            trend: nextScore > snapshot.vitality.score ? 'up' : snapshot.vitality.trend
          }
        },
        appliedEffect: {
          ...effectBase,
          message: 'Tree vitality increased.'
        },
        warnings: []
      }
    }

    case 'decrease_vitality': {
      const nextScore = clamp(snapshot.vitality.score - Math.abs(impact), 1, 100)
      return {
        snapshot: {
          ...snapshot,
          vitality: {
            ...snapshot.vitality,
            score: nextScore,
            trend: 'down',
            repairNeeded: true
          },
          season: {
            ...snapshot.season,
            current: snapshot.season.current === 'spring' ? 'mixed' : snapshot.season.current,
            repairBias: clamp(snapshot.season.repairBias + Math.abs(unitImpact), 0, 1),
            burnoutRisk: clamp(snapshot.season.burnoutRisk + Math.abs(unitImpact), 0, 1)
          }
        },
        appliedEffect: {
          ...effectBase,
          message: 'Tree vitality decreased without killing the tree.'
        },
        warnings: []
      }
    }

    case 'grow_branch':
    case 'weaken_branch': {
      if (!targetBranch) {
        return {
          snapshot,
          warnings: [
            {
              code: 'missing_branch',
              eventId: event.id,
              ruleId: rule.id,
              message: `No branch found for rule ${rule.id}.`
            }
          ]
        }
      }

      const direction = rule.effectType === 'grow_branch' ? 1 : -1
      const updatedBranch = {
        ...targetBranch,
        length: clamp(targetBranch.length + direction * Math.abs(unitImpact) * 2, 0.1, 2),
        radius: clamp(targetBranch.radius + direction * Math.abs(unitImpact) * 0.35, 0.03, 0.5),
        vitality: clamp(targetBranch.vitality + direction * Math.abs(unitImpact), 0.05, 1),
        activityLevel: clamp(targetBranch.activityLevel + direction * Math.abs(unitImpact), 0, 1)
      }

      return {
        snapshot: replaceBranch(snapshot, updatedBranch),
        appliedEffect: {
          ...effectBase,
          targetId: updatedBranch.id,
          message:
            rule.effectType === 'grow_branch'
              ? `${updatedBranch.label} branch grew.`
              : `${updatedBranch.label} branch weakened and needs recovery.`
        },
        warnings: []
      }
    }

    case 'add_leaf': {
      if (!targetBranch) {
        return {
          snapshot,
          warnings: [
            {
              code: 'missing_branch',
              eventId: event.id,
              ruleId: rule.id,
              message: `No branch found for leaf rule ${rule.id}.`
            }
          ]
        }
      }

      const leaf = createLeaf(event, targetBranch, impact)
      const updatedBranch = {
        ...targetBranch,
        leafIds: targetBranch.leafIds.includes(leaf.id)
          ? targetBranch.leafIds
          : [...targetBranch.leafIds, leaf.id],
        vitality: clamp(targetBranch.vitality + Math.max(unitImpact, 0), 0, 1),
        activityLevel: clamp(targetBranch.activityLevel + Math.max(unitImpact, 0), 0, 1)
      }

      return {
        snapshot: {
          ...replaceBranch(snapshot, updatedBranch),
          leaves: snapshot.leaves.some((existingLeaf) => existingLeaf.id === leaf.id)
            ? snapshot.leaves
            : [...snapshot.leaves, leaf]
        },
        appliedEffect: {
          ...effectBase,
          targetId: leaf.id,
          message: `${updatedBranch.label} branch gained a leaf.`
        },
        warnings: []
      }
    }

    case 'add_fruit': {
      if (!targetBranch) {
        return {
          snapshot,
          warnings: [
            {
              code: 'missing_branch',
              eventId: event.id,
              ruleId: rule.id,
              message: `No branch found for fruit rule ${rule.id}.`
            }
          ]
        }
      }

      const fruit = createFruit(event, targetBranch, impact)
      const updatedBranch = {
        ...targetBranch,
        fruitIds: targetBranch.fruitIds.includes(fruit.id)
          ? targetBranch.fruitIds
          : [...targetBranch.fruitIds, fruit.id],
        vitality: clamp(targetBranch.vitality + Math.max(unitImpact, 0), 0, 1)
      }

      return {
        snapshot: {
          ...replaceBranch(snapshot, updatedBranch),
          fruits: snapshot.fruits.some((existingFruit) => existingFruit.id === fruit.id)
            ? snapshot.fruits
            : [...snapshot.fruits, fruit]
        },
        appliedEffect: {
          ...effectBase,
          targetId: fruit.id,
          message: `${updatedBranch.label} branch gained a fruit.`
        },
        warnings: []
      }
    }

    case 'add_scar': {
      if (!targetBranch) {
        return {
          snapshot,
          warnings: [
            {
              code: 'missing_branch',
              eventId: event.id,
              ruleId: rule.id,
              message: `No branch found for scar rule ${rule.id}.`
            }
          ]
        }
      }

      const scar = createScar(event, targetBranch, impact)
      const updatedBranch = {
        ...targetBranch,
        vitality: clamp(targetBranch.vitality - Math.abs(unitImpact), 0.05, 1),
        activityLevel: clamp(targetBranch.activityLevel - Math.abs(unitImpact), 0, 1),
        scarIds: targetBranch.scarIds.includes(scar.id)
          ? targetBranch.scarIds
          : [...targetBranch.scarIds, scar.id]
      }

      return {
        snapshot: {
          ...replaceBranch(snapshot, updatedBranch),
          scars: snapshot.scars.some((existingScar) => existingScar.id === scar.id)
            ? snapshot.scars
            : [...snapshot.scars, scar],
          season: {
            ...snapshot.season,
            current: rule.visualHint.seasonShift ?? 'winter',
            reason: 'Repair signal added by growth engine.',
            growthBias: clamp(snapshot.season.growthBias - Math.abs(unitImpact), 0, 1),
            repairBias: clamp(snapshot.season.repairBias + Math.abs(unitImpact) * 2, 0, 1),
            burnoutRisk: clamp(snapshot.season.burnoutRisk + Math.abs(unitImpact), 0, 1)
          },
          vitality: {
            ...snapshot.vitality,
            trend: 'down',
            repairNeeded: true
          }
        },
        appliedEffect: {
          ...effectBase,
          targetId: scar.id,
          message: `${updatedBranch.label} branch gained a repair scar.`
        },
        warnings: []
      }
    }

    case 'heal_scar': {
      const scarToHeal = snapshot.scars.find((scar) => !scar.healed)

      if (!scarToHeal) {
        return {
          snapshot,
          warnings: [
            {
              code: 'missing_scar',
              eventId: event.id,
              ruleId: rule.id,
              message: `No active scar found for healing rule ${rule.id}.`
            }
          ]
        }
      }

      const healedScar = {
        ...scarToHeal,
        healingProgress: clamp(scarToHeal.healingProgress + Math.max(unitImpact, 0) * 4, 0, 1),
        healed: clamp(scarToHeal.healingProgress + Math.max(unitImpact, 0) * 4, 0, 1) >= 1
      }

      return {
        snapshot: {
          ...snapshot,
          scars: snapshot.scars.map((scar) => (scar.id === healedScar.id ? healedScar : scar)),
          season: {
            ...snapshot.season,
            repairBias: clamp(snapshot.season.repairBias + Math.max(unitImpact, 0), 0, 1),
            burnoutRisk: clamp(snapshot.season.burnoutRisk - Math.max(unitImpact, 0), 0, 1)
          }
        },
        appliedEffect: {
          ...effectBase,
          targetId: healedScar.id,
          message: 'A scar healing progress increased.'
        },
        warnings: []
      }
    }

    case 'strengthen_root': {
      return {
        snapshot: {
          ...snapshot,
          root: {
            ...snapshot.root,
            depth: clamp(snapshot.root.depth + Math.max(unitImpact, 0), 0, 1),
            density: clamp(snapshot.root.density + Math.max(unitImpact, 0), 0, 1),
            stability: clamp(snapshot.root.stability + Math.max(unitImpact, 0), 0, 1),
            nutrients: [
              ...snapshot.root.nutrients,
              {
                sourceEventId: event.id,
                type: event.sourceModule === 'wealth' ? 'wealth_safety' : 'habit',
                strength: clamp(event.intensityScore, 0, 1)
              }
            ]
          }
        },
        appliedEffect: {
          ...effectBase,
          targetId: snapshot.root.id,
          message: 'Root stability increased.'
        },
        warnings: []
      }
    }

    case 'strengthen_trunk': {
      return {
        snapshot: {
          ...snapshot,
          trunk: {
            ...snapshot.trunk,
            height: clamp(snapshot.trunk.height + Math.max(unitImpact, 0), 0.1, 3),
            radius: clamp(snapshot.trunk.radius + Math.max(unitImpact, 0) * 0.25, 0.05, 1),
            stability: clamp(snapshot.trunk.stability + Math.max(unitImpact, 0), 0, 1),
            pressure: clamp(snapshot.trunk.pressure - Math.max(unitImpact, 0), 0, 1)
          }
        },
        appliedEffect: {
          ...effectBase,
          targetId: snapshot.trunk.id,
          message: 'Trunk structure strengthened.'
        },
        warnings: []
      }
    }

    case 'shift_season': {
      return {
        snapshot: {
          ...snapshot,
          season: {
            ...snapshot.season,
            current: rule.visualHint.seasonShift ?? snapshot.season.current,
            reason: rule.visualHint.description,
            growthBias: clamp(snapshot.season.growthBias + Math.max(unitImpact, 0), 0, 1),
            repairBias: clamp(snapshot.season.repairBias + Math.max(unitImpact, 0), 0, 1),
            burnoutRisk: clamp(snapshot.season.burnoutRisk - Math.max(unitImpact, 0), 0, 1)
          }
        },
        appliedEffect: {
          ...effectBase,
          targetId: 'season',
          message: `Season shifted toward ${rule.visualHint.seasonShift ?? snapshot.season.current}.`
        },
        warnings: []
      }
    }

    default:
      return {
        snapshot,
        warnings: [
          {
            code: 'unsupported_effect',
            eventId: event.id,
            ruleId: rule.id,
            message: `Unsupported effect type ${String(rule.effectType)}.`
          }
        ]
      }
  }
}
