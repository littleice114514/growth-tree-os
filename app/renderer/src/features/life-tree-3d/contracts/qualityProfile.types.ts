export type QualityProfileName = 'low' | 'medium' | 'high'

export interface QualityProfile {
  name: QualityProfileName
  maxLeaves: number
  maxFruits: number
  maxActiveAnimations: number
  textureSize: 512 | 1024 | 2048
  enableHeavyShadow: boolean
  enableWindAnimation: boolean
  enableDetailedLabels: boolean
  devicePixelRatioLimit: number
  defaultForMac: boolean
  defaultForWindows: boolean
}

export const qualityProfiles: Record<QualityProfileName, QualityProfile> = {
  low: {
    name: 'low',
    maxLeaves: 150,
    maxFruits: 20,
    maxActiveAnimations: 10,
    textureSize: 512,
    enableHeavyShadow: false,
    enableWindAnimation: false,
    enableDetailedLabels: false,
    devicePixelRatioLimit: 1,
    defaultForMac: false,
    defaultForWindows: false
  },
  medium: {
    name: 'medium',
    maxLeaves: 500,
    maxFruits: 50,
    maxActiveAnimations: 30,
    textureSize: 1024,
    enableHeavyShadow: false,
    enableWindAnimation: true,
    enableDetailedLabels: true,
    devicePixelRatioLimit: 1.5,
    defaultForMac: true,
    defaultForWindows: false
  },
  high: {
    name: 'high',
    maxLeaves: 1500,
    maxFruits: 100,
    maxActiveAnimations: 80,
    textureSize: 2048,
    enableHeavyShadow: true,
    enableWindAnimation: true,
    enableDetailedLabels: true,
    devicePixelRatioLimit: 2,
    defaultForMac: false,
    defaultForWindows: true
  }
}
