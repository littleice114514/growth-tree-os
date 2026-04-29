import type { GrowthEvent } from '../contracts'

export const mockGrowthEvents: GrowthEvent[] = [
  {
    id: 'event-deep-work-2026-04-29',
    type: 'deep_work_completed',
    sourceModule: 'project',
    occurredAt: '2026-04-29T09:30:00+08:00',
    intensity: 'high',
    intensityScore: 0.9,
    metadata: {
      durationMinutes: 95,
      evidence: 'Completed focused M3D-1 contract drafting block.',
      tags: ['deep-work', 'life-tree-3d']
    }
  },
  {
    id: 'event-health-2026-04-29',
    type: 'health_action_completed',
    sourceModule: 'health',
    occurredAt: '2026-04-29T12:20:00+08:00',
    intensity: 'medium',
    intensityScore: 0.6,
    metadata: {
      evidence: 'Recorded basic recovery and body maintenance action.',
      tags: ['health', 'root']
    }
  },
  {
    id: 'event-time-debt-added-2026-04-29',
    type: 'time_debt_increased',
    sourceModule: 'time_debt',
    occurredAt: '2026-04-29T15:10:00+08:00',
    intensity: 'medium',
    intensityScore: 0.55,
    metadata: {
      evidence: 'Unplanned context switching increased time pressure.',
      tags: ['time-debt', 'repair-signal']
    }
  },
  {
    id: 'event-time-debt-repaid-2026-04-29',
    type: 'time_debt_repaid',
    sourceModule: 'time_debt',
    occurredAt: '2026-04-29T17:20:00+08:00',
    intensity: 'medium',
    intensityScore: 0.65,
    metadata: {
      evidence: 'Repaid a small planning debt with concrete next actions.',
      tags: ['time-debt', 'recovery']
    }
  },
  {
    id: 'event-project-milestone-2026-04-29',
    type: 'project_milestone_completed',
    sourceModule: 'project',
    occurredAt: '2026-04-29T18:00:00+08:00',
    intensity: 'high',
    intensityScore: 0.95,
    metadata: {
      evidence: 'Life Tree 3D M3D-1 contract draft reached commit-ready state.',
      tags: ['project', 'fruit']
    }
  },
  {
    id: 'event-study-2026-04-29',
    type: 'study_action_completed',
    sourceModule: 'study',
    occurredAt: '2026-04-29T19:30:00+08:00',
    intensity: 'medium',
    intensityScore: 0.5,
    metadata: {
      evidence: 'Reviewed data-contract naming and renderer boundary notes.',
      tags: ['study', 'contract']
    }
  },
  {
    id: 'event-attention-leak-2026-04-29',
    type: 'attention_leak_detected',
    sourceModule: 'manual',
    occurredAt: '2026-04-29T20:10:00+08:00',
    intensity: 'low',
    intensityScore: 0.3,
    metadata: {
      evidence: 'Short attention leak recorded as repair signal only.',
      tags: ['attention', 'dim-leaf']
    }
  },
  {
    id: 'event-recovery-2026-04-29',
    type: 'recovery_action_completed',
    sourceModule: 'health',
    occurredAt: '2026-04-29T21:00:00+08:00',
    intensity: 'medium',
    intensityScore: 0.7,
    metadata: {
      evidence: 'Recovery action completed after a high-focus day.',
      tags: ['recovery', 'season']
    }
  }
]
