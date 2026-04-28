export type LifeCurveLineId = 'personalAbility' | 'projectPulse' | 'aiLeverage' | 'wealthSafety' | 'healthVitality'

export type LifeCurveTrendLabel = '明显上升日' | '稳定成长日' | '维持日' | '低效日' | '损耗日'

export type LifeCurveFloorStatus = '抬升' | '小幅抬升' | '持平' | '下滑'

export type LifeCurveRiskLevel = 'low' | 'medium' | 'high'

export type LifeCurveEvidence = Record<LifeCurveLineId, string[]>

export type LifeCurveScores = Record<LifeCurveLineId, number> & {
  composite: number
}

export type LifeCurveDailyScore = {
  date: string
  scores: LifeCurveScores
  trend: {
    label: LifeCurveTrendLabel
    floorStatus: LifeCurveFloorStatus
    riskLevel: LifeCurveRiskLevel
  }
  evidence: LifeCurveEvidence
  risks: string[]
  nextFocus: string
  sourceReviewIds: string[]
  sourceLabel: 'reviews' | 'mock'
}

export type LifeCurveLineMeta = {
  id: LifeCurveLineId
  label: string
  shortLabel: string
  treeLink: string
  weight: number
}
