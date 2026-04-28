export type LifeScenarioCurveKey =
  | 'employment'
  | 'startupPulse'
  | 'continuousStartup'
  | 'aiCollaboration'
  | 'capitalCompound'
  | 'composite'

export interface LifeScenarioCurvePoint {
  age: number
  value: number
}

export interface LifeScenarioCurve {
  key: LifeScenarioCurveKey
  label: string
  shortLabel: string
  description: string
  color: string
  points: LifeScenarioCurvePoint[]
}

export const START_AGE = 18
export const END_AGE = 80
export const CURRENT_AGE = 20
export const AI_START_AGE = 20

const compositeWeights: Record<Exclude<LifeScenarioCurveKey, 'composite'>, number> = {
  employment: 0.1,
  startupPulse: 0.15,
  continuousStartup: 0.2,
  aiCollaboration: 0.25,
  capitalCompound: 0.3
}

const curveMeta: Record<LifeScenarioCurveKey, Omit<LifeScenarioCurve, 'points'>> = {
  employment: {
    key: 'employment',
    label: '传统就业',
    shortLabel: '就业',
    description: '先升、平台、后降，表达稳定职业路径的典型生命力曲线。',
    color: '#64748b'
  },
  startupPulse: {
    key: 'startupPulse',
    label: '创业脉冲',
    shortLabel: '脉冲',
    description: '多次尝试、爆发和回落，适合观察短期高波动项目机会。',
    color: '#f97316'
  },
  continuousStartup: {
    key: 'continuousStartup',
    label: '连续创业',
    shortLabel: '连续',
    description: '波动中低点逐渐抬高，表达失败不回原点的复利式创业经验。',
    color: '#fb7185'
  },
  aiCollaboration: {
    key: 'aiCollaboration',
    label: 'AI协作',
    shortLabel: 'AI',
    description: 'AI 启动后跳升，并随工作流、Agent、自动化沉淀持续增长。',
    color: '#8b5cf6'
  },
  capitalCompound: {
    key: 'capitalCompound',
    label: '资本复利',
    shortLabel: '复利',
    description: '前期慢，中后期逐渐抬高底线，表达储备、投资和现金流托底。',
    color: '#14b8a6'
  },
  composite: {
    key: 'composite',
    label: '复合叠加',
    shortLabel: '复合',
    description: '就业、创业、AI 和资本复利的加权叠加线，用来观察整体底线是否抬高。',
    color: '#ec4899'
  }
}

function clampValue(value: number) {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10))
}

function ageRange() {
  return Array.from({ length: END_AGE - START_AGE + 1 }, (_, index) => START_AGE + index)
}

function employmentValue(age: number) {
  if (age < 25) return (age - 18) * 3
  if (age < 35) return 20 + (age - 25) * 3.5
  if (age < 45) return 55 - (age - 35) * 0.5
  if (age < 60) return 50 - (age - 45) * 2
  return Math.max(5, 20 - (age - 60) * 1)
}

function gaussian(age: number, center: number, width: number, height: number) {
  return height * Math.exp(-((age - center) ** 2) / (2 * width ** 2))
}

function startupPulseValue(age: number) {
  const base = 8 + Math.max(0, age - 18) * 0.15
  const pulses = [
    { center: 22, height: 34, width: 1.4 },
    { center: 27, height: 46, width: 1.8 },
    { center: 33, height: 58, width: 2.1 },
    { center: 39, height: 50, width: 2.3 },
    { center: 46, height: 42, width: 2.5 }
  ]
  const pulseValue = pulses.reduce((total, pulse) => total + gaussian(age, pulse.center, pulse.width, pulse.height), base)
  const cooldown = age > 50 ? (age - 50) * 0.9 : 0
  return pulseValue - cooldown
}

function continuousStartupValue(age: number) {
  const progress = age - START_AGE
  const risingFloor = 10 + progress * 0.78
  const wave = Math.sin(progress * 0.72) * 9 + Math.sin(progress * 0.29) * 5
  const breakout = age > 32 ? (age - 32) * 0.55 : 0
  return risingFloor + wave + breakout
}

function aiCollaborationValue(age: number) {
  if (age < AI_START_AGE) {
    return 4 + (age - START_AGE) * 1.2
  }
  const years = age - AI_START_AGE
  const jump = 22
  const growth = 68 * (1 - Math.exp(-years / 13))
  return jump + growth
}

function capitalCompoundValue(age: number) {
  const midpoint = 42
  const steepness = 0.13
  const sigmoid = 1 / (1 + Math.exp(-(age - midpoint) * steepness))
  const earlyBase = 5 + Math.max(0, age - START_AGE) * 0.22
  return earlyBase + sigmoid * 72
}

function createCurve(key: Exclude<LifeScenarioCurveKey, 'composite'>, valueFn: (age: number) => number): LifeScenarioCurve {
  return {
    ...curveMeta[key],
    points: ageRange().map((age) => ({
      age,
      value: clampValue(valueFn(age))
    }))
  }
}

function createCompositeCurve(curves: LifeScenarioCurve[]): LifeScenarioCurve {
  const curveByKey = new Map(curves.map((curve) => [curve.key, curve]))
  return {
    ...curveMeta.composite,
    points: ageRange().map((age, index) => {
      const value = Object.entries(compositeWeights).reduce((total, [key, weight]) => {
        const curve = curveByKey.get(key as LifeScenarioCurveKey)
        return total + (curve?.points[index]?.value ?? 0) * weight
      }, 0)
      return { age, value: clampValue(value) }
    })
  }
}

export function buildLifeScenarioCurves(): LifeScenarioCurve[] {
  const baseCurves = [
    createCurve('employment', employmentValue),
    createCurve('startupPulse', startupPulseValue),
    createCurve('continuousStartup', continuousStartupValue),
    createCurve('aiCollaboration', aiCollaborationValue),
    createCurve('capitalCompound', capitalCompoundValue)
  ]
  return [...baseCurves, createCompositeCurve(baseCurves)]
}
