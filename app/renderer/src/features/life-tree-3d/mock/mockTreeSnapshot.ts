import type { TreeSnapshot } from '../contracts'

export const mockTreeSnapshot: TreeSnapshot = {
  id: 'tree-snapshot-m3d-1-2026-04-29',
  snapshotDate: '2026-04-29',
  timelineScale: 'daily',
  treeAgeStage: 'young_tree',
  vitality: {
    score: 72,
    pattern: 'growing',
    trend: 'up',
    repairNeeded: true
  },
  root: {
    id: 'root-main',
    depth: 0.62,
    density: 0.58,
    stability: 0.7,
    nutrients: [
      {
        sourceEventId: 'event-health-2026-04-29',
        type: 'health',
        strength: 0.6
      },
      {
        sourceEventId: 'event-time-debt-repaid-2026-04-29',
        type: 'habit',
        strength: 0.45
      }
    ]
  },
  trunk: {
    id: 'trunk-main',
    height: 1.4,
    radius: 0.32,
    stability: 0.74,
    pressure: 0.28,
    ringIds: ['ring-2026-m3d'],
    scarIds: ['scar-attention-001']
  },
  branches: [
    {
      id: 'branch-study',
      type: 'study',
      label: 'Study',
      depth: 1,
      length: 0.86,
      radius: 0.12,
      vitality: 0.68,
      activityLevel: 0.57,
      directionBias: 'left',
      leafIds: ['leaf-study-001'],
      fruitIds: [],
      scarIds: []
    },
    {
      id: 'branch-project',
      type: 'project',
      label: 'Project',
      depth: 1,
      length: 1.05,
      radius: 0.16,
      vitality: 0.78,
      activityLevel: 0.82,
      directionBias: 'up',
      leafIds: ['leaf-project-001', 'leaf-project-002'],
      fruitIds: ['fruit-project-001'],
      scarIds: []
    },
    {
      id: 'branch-health',
      type: 'health',
      label: 'Health',
      depth: 1,
      length: 0.74,
      radius: 0.13,
      vitality: 0.66,
      activityLevel: 0.52,
      directionBias: 'right',
      leafIds: ['leaf-health-001'],
      fruitIds: [],
      scarIds: []
    },
    {
      id: 'branch-wealth',
      type: 'wealth',
      label: 'Wealth',
      depth: 1,
      length: 0.7,
      radius: 0.12,
      vitality: 0.61,
      activityLevel: 0.43,
      directionBias: 'right',
      leafIds: [],
      fruitIds: ['fruit-wealth-001'],
      scarIds: []
    },
    {
      id: 'branch-relationship',
      type: 'relationship',
      label: 'Relationship',
      depth: 1,
      length: 0.64,
      radius: 0.1,
      vitality: 0.59,
      activityLevel: 0.38,
      directionBias: 'balanced',
      leafIds: [],
      fruitIds: [],
      scarIds: []
    },
    {
      id: 'branch-expression',
      type: 'expression',
      label: 'Expression',
      depth: 1,
      length: 0.76,
      radius: 0.11,
      vitality: 0.65,
      activityLevel: 0.5,
      directionBias: 'left',
      leafIds: ['leaf-expression-001'],
      fruitIds: [],
      scarIds: []
    },
    {
      id: 'branch-attention',
      type: 'attention',
      label: 'Attention',
      depth: 1,
      length: 0.58,
      radius: 0.09,
      vitality: 0.48,
      activityLevel: 0.34,
      directionBias: 'down',
      leafIds: ['leaf-attention-001'],
      fruitIds: [],
      scarIds: ['scar-attention-001']
    },
    {
      id: 'branch-recovery',
      type: 'recovery',
      label: 'Recovery',
      depth: 1,
      length: 0.68,
      radius: 0.11,
      vitality: 0.63,
      activityLevel: 0.46,
      directionBias: 'balanced',
      leafIds: ['leaf-recovery-001'],
      fruitIds: [],
      scarIds: []
    }
  ],
  leaves: [
    {
      id: 'leaf-project-001',
      nodeId: 'node-m3d-1-contracts',
      branchId: 'branch-project',
      sourceEventId: 'event-deep-work-2026-04-29',
      status: 'fresh',
      vitality: 0.9,
      ageDays: 0,
      size: 0.7,
      colorToken: 'spring'
    },
    {
      id: 'leaf-project-002',
      nodeId: 'node-rule-notes',
      branchId: 'branch-project',
      sourceEventId: 'event-project-milestone-2026-04-29',
      status: 'stable',
      vitality: 0.78,
      ageDays: 2,
      size: 0.64,
      colorToken: 'summer'
    },
    {
      id: 'leaf-study-001',
      nodeId: 'node-contract-review',
      branchId: 'branch-study',
      sourceEventId: 'event-study-2026-04-29',
      status: 'fresh',
      vitality: 0.68,
      ageDays: 0,
      size: 0.52,
      colorToken: 'spring'
    },
    {
      id: 'leaf-health-001',
      nodeId: 'node-health-action',
      branchId: 'branch-health',
      sourceEventId: 'event-health-2026-04-29',
      status: 'stable',
      vitality: 0.66,
      ageDays: 1,
      size: 0.5,
      colorToken: 'summer'
    },
    {
      id: 'leaf-expression-001',
      nodeId: 'node-readme-draft',
      branchId: 'branch-expression',
      sourceEventId: 'event-deep-work-2026-04-29',
      status: 'stable',
      vitality: 0.6,
      ageDays: 1,
      size: 0.48,
      colorToken: 'summer'
    },
    {
      id: 'leaf-attention-001',
      nodeId: 'node-attention-leak',
      branchId: 'branch-attention',
      sourceEventId: 'event-attention-leak-2026-04-29',
      status: 'withered',
      vitality: 0.32,
      ageDays: 0,
      size: 0.42,
      colorToken: 'dim'
    },
    {
      id: 'leaf-recovery-001',
      nodeId: 'node-recovery-action',
      branchId: 'branch-recovery',
      sourceEventId: 'event-recovery-2026-04-29',
      status: 'fresh',
      vitality: 0.7,
      ageDays: 0,
      size: 0.54,
      colorToken: 'spring'
    }
  ],
  fruits: [
    {
      id: 'fruit-project-001',
      nodeId: 'node-m3d-1-contracts',
      branchId: 'branch-project',
      sourceEventId: 'event-project-milestone-2026-04-29',
      resultType: 'workflow',
      maturity: 0.72,
      reusable: true,
      archivedToRing: false
    },
    {
      id: 'fruit-wealth-001',
      nodeId: 'node-security-line',
      branchId: 'branch-wealth',
      sourceEventId: 'event-wealth-improved-2026-04-29',
      resultType: 'income',
      maturity: 0.45,
      reusable: false,
      archivedToRing: false
    }
  ],
  scars: [
    {
      id: 'scar-attention-001',
      nodeId: 'node-attention-leak',
      targetPart: 'branch',
      targetId: 'branch-attention',
      sourceEventId: 'event-attention-leak-2026-04-29',
      severity: 0.28,
      healed: false,
      healingProgress: 0.35,
      label: 'Attention leak repair reminder'
    }
  ],
  rings: [
    {
      id: 'ring-2026-m3d',
      year: 2026,
      phaseId: 'm3d',
      summary: 'Initial Life Tree 3D framework and contract phase.',
      vitalityAverage: 0.72,
      fruitCount: 1,
      scarCount: 1,
      dominantBranches: ['project', 'study', 'recovery']
    }
  ],
  season: {
    current: 'mixed',
    reason: 'Project growth is active while attention repair is still needed.',
    growthBias: 0.66,
    repairBias: 0.42,
    harvestBias: 0.36,
    burnoutRisk: 0.24
  },
  qualityHint: 'medium',
  rendererModeHint: 'procedural',
  sourceEventIds: [
    'event-deep-work-2026-04-29',
    'event-health-2026-04-29',
    'event-time-debt-added-2026-04-29',
    'event-time-debt-repaid-2026-04-29',
    'event-project-milestone-2026-04-29',
    'event-study-2026-04-29',
    'event-attention-leak-2026-04-29',
    'event-recovery-2026-04-29'
  ],
  generatedByRuleVersion: 'm3d-1-draft',
  createdAt: '2026-04-29T21:30:00+08:00',
  updatedAt: '2026-04-29T21:30:00+08:00'
}
