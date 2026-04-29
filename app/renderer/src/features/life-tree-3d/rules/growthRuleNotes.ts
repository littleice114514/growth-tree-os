export const growthRuleNotes = {
  stage: 'M3D-1',
  ruleVersion: 'm3d-1-draft',
  boundary: 'Rules are static contracts for future simulation. M3D-1 does not calculate a next TreeSnapshot.',
  negativeEventPrinciple:
    'Negative events should create repair reminders, dim leaves, pause growth, add cracks, or shift toward winter state. They should not kill the tree.',
  nextStage: 'M3D-2 will implement pure data simulation from TreeSnapshot, GrowthEvent[], and GrowthRule[].'
} as const
