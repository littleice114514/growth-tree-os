import type { GrowthRule } from '../contracts'

export const defaultGrowthRules: GrowthRule[] = [
  {
    id: 'rule-deep-work-project-leaf',
    eventType: 'deep_work_completed',
    sourceModule: 'project',
    targetTreePart: 'branch',
    targetBranch: 'project',
    effectType: 'grow_branch',
    weight: 1,
    decay: 'daily',
    maxImpact: 3,
    visualHint: {
      tone: 'fresh',
      description: 'Project branch extends slightly and gains fresh leaves.'
    },
    note: 'Deep work first adds leaves and only grows the branch when it repeats over time.'
  },
  {
    id: 'rule-health-root-supply',
    eventType: 'health_action_completed',
    sourceModule: 'health',
    targetTreePart: 'root',
    targetBranch: 'health',
    effectType: 'strengthen_root',
    weight: 0.8,
    decay: 'daily',
    maxImpact: 2.5,
    visualHint: {
      tone: 'fresh',
      description: 'Roots brighten and trunk stability receives a small support signal.'
    },
    note: 'Health actions are treated as baseline supply, not direct fruit.'
  },
  {
    id: 'rule-time-debt-scar',
    eventType: 'time_debt_increased',
    sourceModule: 'time_debt',
    targetTreePart: 'scar',
    targetBranch: 'attention',
    effectType: 'add_scar',
    weight: -0.8,
    decay: 'daily',
    maxImpact: -3,
    visualHint: {
      tone: 'dim',
      description: 'A light scar appears and nearby leaves become darker.',
      seasonShift: 'winter'
    },
    note: 'Time debt is a repair signal; it never kills the tree.'
  },
  {
    id: 'rule-time-debt-repaid-heal',
    eventType: 'time_debt_repaid',
    sourceModule: 'time_debt',
    targetTreePart: 'scar',
    targetBranch: 'recovery',
    effectType: 'heal_scar',
    weight: 0.9,
    decay: 'daily',
    maxImpact: 3,
    visualHint: {
      tone: 'repairing',
      description: 'Existing cracks become shallower and root recovery improves.'
    },
    note: 'Repayment increases healing progress while preserving scar history.'
  },
  {
    id: 'rule-wealth-security-root',
    eventType: 'wealth_state_improved',
    sourceModule: 'wealth',
    targetTreePart: 'branch',
    targetBranch: 'wealth',
    effectType: 'grow_branch',
    weight: 1,
    decay: 'weekly',
    maxImpact: 4,
    visualHint: {
      tone: 'warm',
      description: 'Wealth branch radius improves and roots gain a security nutrient.'
    },
    note: 'Wealth improvements strengthen long-term supply and branch stability.'
  },
  {
    id: 'rule-reflection-soil-root',
    eventType: 'reflection_completed',
    sourceModule: 'review',
    targetTreePart: 'root',
    targetBranch: 'recovery',
    effectType: 'strengthen_root',
    weight: 0.7,
    decay: 'weekly',
    maxImpact: 2.5,
    visualHint: {
      tone: 'repairing',
      description: 'Fallen leaves become soil material and roots gain density.'
    },
    note: 'Normal reflection feeds soil and prepares repair, without creating fruit by itself.'
  },
  {
    id: 'rule-reflection-streak-trunk',
    eventType: 'reflection_streak_gained',
    sourceModule: 'review',
    targetTreePart: 'trunk',
    targetBranch: 'recovery',
    effectType: 'strengthen_trunk',
    weight: 1.1,
    decay: 'weekly',
    maxImpact: 3.5,
    visualHint: {
      tone: 'repairing',
      description: 'Root density rises and trunk texture becomes steadier.'
    },
    note: 'Reflection streaks represent continuity and strengthen the tree structure.'
  },
  {
    id: 'rule-project-milestone-fruit',
    eventType: 'project_milestone_completed',
    sourceModule: 'project',
    targetTreePart: 'fruit',
    targetBranch: 'project',
    effectType: 'add_fruit',
    weight: 1.5,
    decay: 'monthly',
    maxImpact: 6,
    visualHint: {
      tone: 'harvest',
      description: 'A fruit appears on the project branch and becomes a ring candidate.'
    },
    note: 'Milestones can create fruit when the result is verifiable.'
  },
  {
    id: 'rule-study-action-leaf',
    eventType: 'study_action_completed',
    sourceModule: 'study',
    targetTreePart: 'leaf',
    targetBranch: 'study',
    effectType: 'add_leaf',
    weight: 0.8,
    decay: 'daily',
    maxImpact: 2.5,
    visualHint: {
      tone: 'fresh',
      description: 'A new study leaf appears and the study branch activity rises.'
    },
    note: 'Study growth is cumulative; a single action should not overgrow the branch.'
  },
  {
    id: 'rule-attention-leak-dim',
    eventType: 'attention_leak_detected',
    sourceModule: 'manual',
    targetTreePart: 'leaf',
    targetBranch: 'attention',
    effectType: 'decrease_vitality',
    weight: -0.6,
    decay: 'daily',
    maxImpact: -2,
    visualHint: {
      tone: 'dim',
      description: 'Attention leaves lose brightness and repair need increases.'
    },
    note: 'Attention leaks dim leaves and request repair rather than imposing permanent failure.'
  },
  {
    id: 'rule-destructive-entertainment-repair-signal',
    eventType: 'destructive_entertainment_overused',
    sourceModule: 'time_debt',
    targetTreePart: 'scar',
    targetBranch: 'attention',
    effectType: 'add_scar',
    weight: -0.9,
    decay: 'daily',
    maxImpact: -2.8,
    visualHint: {
      tone: 'winter',
      description: 'Some leaves wither, a shallow crack appears, and winter tendency rises.',
      seasonShift: 'winter'
    },
    note: 'Overuse creates a repair reminder and can be healed by repayment, reflection, and recovery.'
  },
  {
    id: 'rule-relationship-root-support',
    eventType: 'relationship_event_recorded',
    sourceModule: 'relationship',
    targetTreePart: 'root',
    targetBranch: 'relationship',
    effectType: 'strengthen_root',
    weight: 0.6,
    decay: 'weekly',
    maxImpact: 2,
    visualHint: {
      tone: 'warm',
      description: 'Side roots gain support and the season becomes softer.'
    },
    note: 'Relationship events are treated as support or fluctuation signals, not direct achievement.'
  },
  {
    id: 'rule-recovery-action-season',
    eventType: 'recovery_action_completed',
    sourceModule: 'health',
    targetTreePart: 'season',
    targetBranch: 'recovery',
    effectType: 'shift_season',
    weight: 0.9,
    decay: 'daily',
    maxImpact: 2,
    visualHint: {
      tone: 'repairing',
      description: 'Winter repair pressure eases and the tree can return toward spring.',
      seasonShift: 'spring'
    },
    note: 'Recovery actions restore growth capacity without pretending the stress never happened.'
  }
]
