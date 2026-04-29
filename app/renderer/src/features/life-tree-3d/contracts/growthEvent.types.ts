export type GrowthEventType =
  | 'deep_work_completed'
  | 'health_action_completed'
  | 'time_debt_increased'
  | 'time_debt_repaid'
  | 'wealth_state_improved'
  | 'reflection_completed'
  | 'reflection_streak_gained'
  | 'project_milestone_completed'
  | 'study_action_completed'
  | 'attention_leak_detected'
  | 'destructive_entertainment_overused'
  | 'relationship_event_recorded'
  | 'recovery_action_completed'

export type GrowthEventSourceModule =
  | 'review'
  | 'time_debt'
  | 'plan'
  | 'wealth'
  | 'health'
  | 'project'
  | 'study'
  | 'relationship'
  | 'manual'

export type GrowthEventIntensity = 'low' | 'medium' | 'high'

export interface GrowthEventMetadata {
  durationMinutes?: number
  relatedNodeId?: string
  relatedSnapshotId?: string
  evidence?: string
  tags?: string[]
  note?: string
}

export interface GrowthEvent {
  id: string
  type: GrowthEventType
  sourceModule: GrowthEventSourceModule
  occurredAt: string
  intensity: GrowthEventIntensity
  intensityScore: number
  metadata: GrowthEventMetadata
}
